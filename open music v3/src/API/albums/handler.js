const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postLikeAlbumByIdHandler = this.postLikeAlbumByIdHandler.bind(this);
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._albumsService.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        data: {
          albumId,
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

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async postAlbumCoverHandler(request, h) {
    try {
      const { id } = request.params;
      const { cover } = request.payload;
      this._validator.validateAlbumCoverHeader(cover.hapi.headers);
      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
      await this._albumsService.editAlbumCoverById(id, url);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        cover: url,
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

      // server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async postLikeAlbumByIdHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: albumId } = request.params;

      await this._albumsService.getAlbumById(albumId);
      await this._albumsService.addAlbumLikeById(albumId, credentialId);

      const response = h.response({
        status: 'success',
        message: 'Operasi berhasil dilakukan',
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

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumsHandler(h) {
    const albums = await this._albumsService.getAlbums();
    const response = h.response({
      status: 'success',
      data: {
        albums,
      },
    });
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._albumsService.getAlbumById(id);
      const response = h.response({
        status: 'success',
        data: {
          album,
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

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikesByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { likes, cache } = await this._albumsService.getAlbumLikesById(id);

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });

      if (cache) response.header('X-Data-Source', 'cache');

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      await this._albumsService.editAlbumById(id, request.payload);

      const response = h.response({
        status: 'success',
        message: 'Album berhasil diperbarui',
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

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
      console.error(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._albumsService.deleteAlbumById(id);

      const response = h.response({
        status: 'success',
        message: 'Album berhasil dihapus',
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

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
