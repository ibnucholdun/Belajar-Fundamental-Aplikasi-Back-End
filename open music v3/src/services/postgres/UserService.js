const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ fullname, username, password }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(10)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users (id, fullname, username, password) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, fullname, username, hashedPassword],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('User gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async getUserByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE = $1',
      values: [`%${username}%`],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Username sudah terdaftar');
    }
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Username atau password salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      throw new AuthenticationError('Username atau password salah');
    }

    return id;
  }
}

module.exports = UserService;
