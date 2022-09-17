const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postPlaylistSongByIdHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getPlaylistSongByIdHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deletePlaylistSongByIdHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  // {
  //   method: 'GET',
  //   path: '/playlists/{id}/activities',
  //   handler: handler.getPlaylistActivitiyByIdHandler,
  //   options: {
  //     auth: 'openmusicapi_jwt',
  //   },
  // },
];

module.exports = routes;
