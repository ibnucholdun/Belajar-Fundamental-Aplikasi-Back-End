require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

// albums
const albums = require('./API/albums');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./API/songs');
const SongService = require('./services/postgres/SongService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./API/users');
const UserService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');

// auhentications
const authentications = require('./API/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// playlist
const playlists = require('./API/playlists');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlists');

// collaborations
const collaborations = require('./API/collaborations');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaborations');

// Exports
const _exports = require('./API/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const StorageService = require('./services/storage/StorageService');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const collaborationService = new CollaborationService(cacheService);
  const albumsService = new AlbumService(cacheService);
  const songService = new SongService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const playlistService = new PlaylistService(collaborationService, cacheService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images_cover'));

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
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        storageService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        validator: AuthenticationsValidator,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistService,
        songService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        usersService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        exportsService: ProducerService,
        playlistService,
        validator: ExportsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
