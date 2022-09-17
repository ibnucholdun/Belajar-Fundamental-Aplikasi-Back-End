const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();

    this.getPlaylistSongByid = this.getPlaylistSongByid.bind(this);
  }

  async getPlaylistSongByid(playlistId) {
    const queryPlaylist = {
      text: `SELECT p.id, p.name FROM playlists p WHERE p.id = $1`,
      values: [playlistId],
    };

    const querySong = {
      text: `SELECT s.id, s.title, s.performer FROM songs s
        INNER JOIN playlist_songs p ON p.song_id = s.id WHERE p.playlist_id = $1`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    const resultSong = await this._pool.query(querySong);

    const result = {
      playlist: {
        id: resultPlaylist.rows[0].id,
        name: resultPlaylist.rows[0].name,
        songs: resultSong.rows,
      }
    };

    return result;
  }
}

module.exports = PlaylistsService;