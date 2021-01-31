const express = require('express');

const router = express.Router();
const { validate } = require('jsonschema');

const db = require('../db/db');

router.get('/', (req, res, next) => {
  const users = db.get('users').value();

  res.json([...users]);
});
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const users = db.get('users');
  const data = users.find((it) => String(it.id) === id);
  res.json({ status: 'OK', data });
});
router.get('/:id/albums', (req, res, next) => {
  const { id } = req.params;
  const albums = db.get('albums');
  const data = albums.filter((it) => String(it.userId) === id);
  res.json({ status: 'OK', data });
});
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  db.get('users')
    .remove({ id: Number(id) })
    .write();

  res.json({ status: 'OK' });
});

router.post('/', (req, res, next) => {
  const { body } = req;
  const taskSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    required: ['name'],
    additionalProperties: false,
  };
  const validationResult = validate(body, taskSchema);
  if (!validationResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }
  const newUser = {
    id: Date.now(),
    name: body.name,
  };
  try {
    db.get('users').push(newUser).write();
  } catch (error) {
    throw new Error(error);
  }
  res.json({ status: 'OK', data: newUser });
});

router.post('/:id/albums', (req, res, next) => {
  const { body } = req;
  const { id } = req.params;
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

  const newAlbum = { id: Date.now(), title: body.title, userId: id };
  try {
    db.get('albums').push(newAlbum).write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({ status: 'OK', data: newAlbum });
});

module.exports = router;
