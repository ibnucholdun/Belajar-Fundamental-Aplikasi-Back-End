const ClientError = require('../../exceptions/ClientError');

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const {
        title, genre, performer, year, albumId = null, duration = null,
      } = request.payload;
      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });

      const response = h.response({
        status: 'success',
        data: {
          songId,
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

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    try {
      const { title = null, performer = null } = request.query;
      const songs = await this._service.getSongs(title, performer);
      const response = h.response({
        status: 'success',
        data: {
          songs,
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

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegaglan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      const response = h.response({
        status: 'success',
        data: {
          song,
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

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { id } = request.params;
      const {
        title, genre, performer, year, albumId = null, duration = null,
      } = request.payload;

      await this._service.editSongById(id, {
        title, year, genre, performer, duration, albumId,
      });

      const response = h.response({
        status: 'success',
        message: 'Song berhasil diperbarui',
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

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._service.deleteSongById(id);

      const response = h.response({
        status: 'success',
        message: 'Song berhasil dihapus',
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

      // SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
      return response;
    }
  }
}

module.exports = SongHandler;
