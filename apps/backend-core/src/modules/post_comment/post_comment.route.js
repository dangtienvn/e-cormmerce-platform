const express = require('express');
const router = express.Router();
const PostCommentController = require('./post_comment.controller');
const { protect } = require('../../middlewares/auth.middleware');

// Public route to get comments for a post
router.get('/:postId', PostCommentController.getCommentsByPost);

// Protected route to create a comment
router.post('/', PostCommentController.createComment);

// Protected route to delete a comment (optional but good to have)
router.delete('/:id', protect, PostCommentController.deleteComment);

module.exports = router;
