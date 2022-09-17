const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(exportsService, playlistService, validator) {
    this._exportsService = exportsService;
    this._playlistService = playlistService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._exportsService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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
}

module.exports = ExportsHandler;
