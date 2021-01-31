const express = require('express');

const router = express.Router();
const { validate } = require('jsonschema');
const db = require('../db/db');

router.get('/', (req, res, next) => {
  const albums = db.get('albums');

  res.json({ status: 'OK', data: albums });
});
router.get('/:id/photos', (req, res, next) => {
  const { id } = req.params;
  const photos = db.get('photos');
  const data = photos.filter((photo) => String(photo.albumId) === id);
  res.json({ status: 'OK', data });
});
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const albums = db.get('albums');
  const data = albums.find((it) => String(it.id) === id);
  res.json({ status: 'OK', data });
});
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  db.get('albums')
    .remove({ id: Number(id) })
    .write();

  res.json({ status: 'OK' });
});

router.post('/', (req, res, next) => {
  const { body } = req;

  const taskSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
    },
    required: ['title'],
    additionalProperties: false,
  };
  const validationResult = validate(body, taskSchema);

  if (!validationResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }

  const newAlbum = { id: Date.now(), title: body.title };
  try {
    db.get('albums').push(newAlbum).write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({ status: 'OK', data: newAlbum });
});

module.exports = router;
