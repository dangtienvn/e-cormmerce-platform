const express = require('express');
const router = express.Router();
const PostCategoryController = require('./post_category.controller');
const { protect, admin } = require('../../middlewares/auth.middleware');

router.get('/', PostCategoryController.getCategories);
router.get('/tree', PostCategoryController.getCategoryTree);
router.post('/', protect, admin, PostCategoryController.create);
router.put('/:id', protect, admin, PostCategoryController.update);
router.delete('/:id', protect, admin, PostCategoryController.delete);

module.exports = router;
