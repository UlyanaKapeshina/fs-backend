const express = require('express');

const router = express.Router();
const { validate } = require('jsonschema');
const multer = require('multer');
const db = require('../db/db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/', (req, res, next) => {
  const photos = db.get('photos');

  res.json({ status: 'OK', data: photos });
});
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const photos = db.get('photos');
  const data = photos.find((photo) => String(photo.id) === id);
  res.json({ status: 'OK', data });
});
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  db.get('photos')
    .remove({ id: Number(id) })
    .write();

  res.json({ status: 'OK' });
});

router.post('/', upload.single('photo'), (req, res, next) => {
  const { body, file } = req;
  const taskSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      albumId: { type: 'string' },
    },
    required: ['title', 'albumId'],
    additionalProperties: false,
  };
  const validationResult = validate(body, taskSchema);
  if (!validationResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }
  const newPhoto = {
    id: Date.now(),
    albumId: Number(body.albumId),
    url: `http://localhost:8080/img/${file.filename}`,
    thumbnailUrl: `http://localhost:8080/img/${file.filename}`,
    title: body.title,
  };
  try {
    db.get('photos').push(newPhoto).write();
  } catch (error) {
    throw new Error(error);
  }
  res.json({ status: 'OK', data: newPhoto });
});

module.exports = router;
