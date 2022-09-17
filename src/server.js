require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./API/albums');
const songs = require('./API/songs');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');
const SongService = require('./services/postgres/SongService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumsService = new AlbumService();
  const songsService = new SongService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },

  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
