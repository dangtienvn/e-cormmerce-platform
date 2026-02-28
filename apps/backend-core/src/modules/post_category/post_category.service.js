const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class PostCategoryService {
  async getCategories() {
    return await prisma.post_categories.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async getCategoryTree() {
    const categories = await prisma.post_categories.findMany({
      orderBy: { position: 'asc' },
    });

    const buildTree = (parentId = null) => {
      return categories
        .filter((category) => category.parent_id === parentId)
        .map((category) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree(null);
  }

  async createCategory(data) {
    const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    return await prisma.post_categories.create({
      data: {
        name: data.name,
        slug,
        parent_id: data.parent_id || null,
        position: data.position ?? 0,
      },
    });
  }

  async updateCategory(id, data) {
    let slug;
    if (data.name) {
      slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    }
    return await prisma.post_categories.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        ...(slug && { slug }),
      },
    });
  }

  async deleteCategory(id) {
    return await prisma.post_categories.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new PostCategoryService();
