const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class PostService {
  async getPosts(params = {}) {
    const { categoryId, status, tag, search, skip = 0, take = 10 } = params;

    const where = {
      ...(categoryId && { category_id: parseInt(categoryId) }),
      ...(status && { status }),
      ...(tag && { tags: { has: tag } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { seo_title: { contains: search, mode: 'insensitive' } },
          { seo_description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await prisma.posts.findMany({
      where,
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { created_at: 'desc' },
    });
  }

  async countPosts(params = {}) {
    const { categoryId, status, tag, search } = params;
    const where = {
      ...(categoryId && { category_id: parseInt(categoryId) }),
      ...(status && { status }),
      ...(tag && { tags: { has: tag } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { seo_title: { contains: search, mode: 'insensitive' } },
          { seo_description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await prisma.posts.count({ where });
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

  async getTags() {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT DISTINCT UNNEST(tags) as tag FROM posts WHERE tags IS NOT NULL'
    );
    return rows.map((row) => row.tag).filter(Boolean);
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
        tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        seo_keywords: data.seo_keywords || null,
        slug,
      },
    });
  }

  async updatePost(id, data) {
    let slug;
    if (data.title) {
      slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    }
    
    const updateData = {
      ...data,
      ...(data.category_id ? { category_id: parseInt(data.category_id) } : {}),
      ...(data.author_id ? { author_id: parseInt(data.author_id) } : {}),
      ...(Array.isArray(data.tags) ? { tags: data.tags.map(String) } : {}),
      seo_title: data.seo_title !== undefined ? data.seo_title : undefined,
      seo_description: data.seo_description !== undefined ? data.seo_description : undefined,
      seo_keywords: data.seo_keywords !== undefined ? data.seo_keywords : undefined,
    };

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
