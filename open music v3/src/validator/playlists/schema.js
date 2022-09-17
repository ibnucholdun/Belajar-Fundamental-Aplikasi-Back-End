const joi = require('joi');

const PlaylistsPayloadScheme = joi.object({
  name: joi.string().required(),
});

const SongsPlaylistPayloadScheme = joi.object({
  songId: joi.string().required(),
});

module.exports = { PlaylistsPayloadScheme, SongsPlaylistPayloadScheme };
