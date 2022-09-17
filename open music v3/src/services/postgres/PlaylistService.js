const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(10)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${owner}`);

    return result.rows[0].id;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(10)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    try {
      const result = await this._cacheService.get(`playlist:${userId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT p.id, p.name, u.username FROM playlists p 
        INNER JOIN users u ON p.owner = u.id WHERE p.owner = $1 
        UNION 
        SELECT p.id, p.name, u.username FROM collaborations c 
        INNER JOIN playlists p ON c.playlist_id = p.id 
        INNER JOIN users u ON p.owner = u.id WHERE c.user_id = $1`,
        values: [userId],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(`playlist:${userId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async getPlaylistSongById(playlistId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);
    const queryPlaylist = {
      text: `SELECT p.id, p.name, u.username FROM playlists p
      INNER JOIN users u ON p.owner = u.id WHERE p.id = $1`,
      values: [playlistId],
    };

    const querySong = {
      text: `SELECT s.id, s.title, s.performer FROM songs s
        INNER JOIN playlist_songs p ON p.song_id = s.id WHERE p.playlist_id = $1`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    const resultSong = await this._pool.query(querySong);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = resultPlaylist.rows[0];
    const result = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: resultSong.rows,
    };

    return result;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('PlaylistId tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlist:${owner}`);
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Song gagal dihapus dari playlist');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak memiliki akses ke playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
