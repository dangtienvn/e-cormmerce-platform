const express = require('express');
const router = express.Router();
const FileController = require('./file.controller');
const { protect } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.post('/upload', protect, upload.any(), FileController.upload);
router.delete('/', protect, FileController.delete);

// This route does not need `protect` because the token itself acts as auth
router.get('/download', FileController.downloadLocalSecure);

module.exports = router;
