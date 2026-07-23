const PostService = require('./post.service');

class PostController {
  async getPosts(req, res, next) {
    try {
      const posts = await PostService.getPosts(req.query);
      const total = await PostService.countPosts(req.query);
      res.status(200).json({ success: true, data: posts, total });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const post = await PostService.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req, res, next) {
    try {
      const post = await PostService.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req, res, next) {
    try {
      const tags = await PostService.getTags();
      res.status(200).json({ success: true, data: tags });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      // automatically assign author_id to logged in user if not provided in body
      const author_id = req.body.author_id || req.user.id;
      const postData = { ...req.body, author_id };
      
      const post = await PostService.createPost(postData);
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const post = await PostService.updatePost(req.params.id, req.body);
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await PostService.deletePost(req.params.id);
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
