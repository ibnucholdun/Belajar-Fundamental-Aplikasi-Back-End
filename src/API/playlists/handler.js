const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
  constructor(playlistService, songService, validator) {
    this._playlistService = playlistService;
    this._songService = songService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postPlaylistSongByIdHandler = this.postPlaylistSongByIdHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistSongByIdHandler = this.getPlaylistSongByIdHandler.bind(this);
    // this.getPlaylistActivitiyByIdHandler = this.getPlaylistActivitiyByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);

      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this._playlistService.addPlaylist(name, credentialId);

      const response = h.response({
        status: 'success',
        data: {
          playlistId,
        },
      }).code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async postPlaylistSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      const { songId } = request.payload;

      await this._songService.getSongById(songId);
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistService.addSongToPlaylist(playlistId, songId);
      // await this._playlistService.addActivity(playlistId, credentialId, 'add');

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan ke playlist',
      }).code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._playlistService.getPlaylists(credentialId);
      const response = h.response({
        status: 'success',
        data: { playlists },
      });
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const playlist = await this._playlistService.getPlaylistSongById(id, credentialId);
      const response = h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  // async getPlaylistActivitiyByIdHandler(request, h) {
  //   try {
  //     const { id } = request.params;
  //     const { id: credentialId } = request.auth.credentials;

  //     await this._playlistService.verifyPlaylistOwner(id, credentialId);

  //     const playlistActivity = await this._playlistService.getPlaylistActivityById(id);
  //     const response = h.response({
  //       status: 'success',
  //       data: { playlistId: id, playlistActivity },
  //     });
  //     return response;
  //   } catch (error) {
  //     if (error instanceof ClientError) {
  //       const response = h.response({
  //         status: 'fail',
  //         message: error.message,
  //       }).code(error.statusCode);
  //       return response;
  //     }

  //     // Server error
  //     const response = h.response({
  //       status: 'error',
  //       message: 'Maaf, terjadi kegagalan pada server kami',
  //     }).code(500);
  //     console.error(error);
  //     return response;
  //   }
  // }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      await this._playlistService.deletePlaylist(id);

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      }).code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { id } = request.params;
      const { songId } = request.payload;

      await this._playlistService.verifyPlaylistAccess(id, credentialId);
      await this._playlistService.deletePlaylistSong(id, songId);
      // await this._playlistService.addActivity(id, credentialId, 'delete');

      const response = h.response({
        status: 'success',
        message: 'Song berhasil dihapus dari playlist',
      }).code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistHandler;
