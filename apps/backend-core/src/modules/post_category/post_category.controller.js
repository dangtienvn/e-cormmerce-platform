const PostCategoryService = require('./post_category.service');

class PostCategoryController {
  async getCategories(req, res, next) {
    try {
      const categories = await PostCategoryService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryTree(req, res, next) {
    try {
      const tree = await PostCategoryService.getCategoryTree();
      res.status(200).json({ success: true, data: tree });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const category = await PostCategoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await PostCategoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await PostCategoryService.deleteCategory(req.params.id);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostCategoryController();
