const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class PostService {
  async getPosts(params = {}) {
    const { categoryId, status, skip = 0, take = 10 } = params;
    
    return await prisma.posts.findMany({
      where: {
        ...(categoryId && { category_id: parseInt(categoryId) }),
        ...(status && { status }),
      },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { created_at: 'desc' },
    });
  }

  async countPosts() {
    return await prisma.posts.count();
  }

  async getPostById(id) {
    return await prisma.posts.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
  }

  async getPostBySlug(slug) {
    return await prisma.posts.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
  }

  async createPost(data) {
    const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    return await prisma.posts.create({
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        external_store_url: data.external_store_url,
        status: data.status || 'DRAFT',
        author_id: parseInt(data.author_id),
        category_id: data.category_id ? parseInt(data.category_id) : null,
        slug,
      },
    });
  }

  async updatePost(id, data) {
    let slug;
    if (data.title) {
      slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    }
    
    // Clean up undefined/null values appropriately if needed, or rely on Prisma ignoring undefined
    const updateData = { ...data };
    if (updateData.category_id) updateData.category_id = parseInt(updateData.category_id);
    if (updateData.author_id) updateData.author_id = parseInt(updateData.author_id);
    
    return await prisma.posts.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...(slug && { slug }),
      },
    });
  }

  async deletePost(id) {
    return await prisma.posts.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new PostService();
