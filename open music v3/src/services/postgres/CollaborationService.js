const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;

    this.addCollaboration = this.addCollaboration.bind(this);
    this.deleteCollaboration = this.deleteCollaboration.bind(this);
    this.verifyCollaborator = this.verifyCollaborator.bind(this);
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(10)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    await this._cacheService.delete(`playlist:${userId}`);
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
    await this._cacheService.delete(`playlist:${userId}`);
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationService;
