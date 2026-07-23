const request = require('supertest');
const express = require('express');

jest.mock('../src/middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 42 };
    next();
  },
  admin: (req, res, next) => next(),
}));

jest.mock('../src/modules/post/post.service', () => ({
  getPosts: jest.fn(),
  countPosts: jest.fn(),
  getPostBySlug: jest.fn(),
  getTags: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}));

const PostService = require('../src/modules/post/post.service');
const postRoute = require('../src/modules/post/post.route');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoute);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('Post routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('GET /api/posts returns posts and total count', async () => {
    const posts = [{ id: 1, title: 'Test post' }];
    PostService.getPosts.mockResolvedValue(posts);
    PostService.countPosts.mockResolvedValue(1);

    const res = await request(app).get('/api/posts?search=test').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(posts);
    expect(res.body.total).toBe(1);
    expect(PostService.getPosts).toHaveBeenCalledWith({ search: 'test' });
    expect(PostService.countPosts).toHaveBeenCalledWith({ search: 'test' });
  });

  test('GET /api/posts/tags returns distinct tags', async () => {
    const tags = ['ecommerce', 'news'];
    PostService.getTags.mockResolvedValue(tags);

    const res = await request(app).get('/api/posts/tags').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(tags);
    expect(PostService.getTags).toHaveBeenCalled();
  });

  test('GET /api/posts/slug/:slug returns post by slug', async () => {
    const post = { id: 2, title: 'Blog post', slug: 'blog-post' };
    PostService.getPostBySlug.mockResolvedValue(post);

    const res = await request(app).get('/api/posts/slug/blog-post').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(post);
    expect(PostService.getPostBySlug).toHaveBeenCalledWith('blog-post');
  });

  test('POST /api/posts creates a new post and attaches author_id', async () => {
    const created = { id: 3, title: 'New blog' };
    PostService.createPost.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'New blog', content: 'Content' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(created);
    expect(PostService.createPost).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New blog',
      content: 'Content',
      author_id: 42,
    }));
  });
});
