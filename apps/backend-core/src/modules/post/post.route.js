const express = require('express');
const router = express.Router();
const PostController = require('./post.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

router.get('/', PostController.getPosts);
router.get('/slug/:slug', PostController.getPostBySlug);
router.get('/tags', PostController.getTags);
router.get('/:id', PostController.getPostById);
router.post('/', protect, admin, PostController.create);
router.put('/:id', protect, admin, PostController.update);
router.delete('/:id', protect, admin, PostController.delete);

module.exports = router;
