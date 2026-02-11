const express = require('express');
const router = express.Router();
const FileController = require('./file.controller');

// This route does not need `protect` because the token itself acts as auth
router.get('/download', FileController.downloadLocalSecure);

module.exports = router;
