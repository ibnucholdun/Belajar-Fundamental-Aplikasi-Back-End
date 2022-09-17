const joi = require('joi');

const AlbumPayloadSchema = joi.object({
  name: joi.string().required(),
  year: joi.number().required(),
});

const AlbumCoverHeaderSchema = joi.object({
  'content-type': joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = { AlbumPayloadSchema, AlbumCoverHeaderSchema };
