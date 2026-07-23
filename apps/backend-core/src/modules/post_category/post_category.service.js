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

  async categoryExists(id) {
    return await prisma.post_categories.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async isCircularParent(childId, parentId) {
    if (!parentId) return false;
    if (childId === parentId) return true;

    const parent = await prisma.post_categories.findUnique({
      where: { id: parseInt(parentId) },
      select: { parent_id: true },
    });

    if (!parent || !parent.parent_id) return false;
    return this.isCircularParent(childId, parent.parent_id);
  }

  async createCategory(data) {
    const parentId = data.parent_id ? parseInt(data.parent_id) : null;
    if (parentId) {
      const parent = await this.categoryExists(parentId);
      if (!parent) {
        throw new Error('Parent category does not exist');
      }
    }

    const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    return await prisma.post_categories.create({
      data: {
        name: data.name,
        slug,
        parent_id: parentId,
        position: data.position ?? 0,
      },
    });
  }

  async updateCategory(id, data) {
    const categoryId = parseInt(id);
    const parentId = data.parent_id ? parseInt(data.parent_id) : null;

    if (parentId) {
      const parent = await this.categoryExists(parentId);
      if (!parent) {
        throw new Error('Parent category does not exist');
      }
      if (parentId === categoryId) {
        throw new Error('Category cannot be its own parent');
      }
      if (await this.isCircularParent(categoryId, parentId)) {
        throw new Error('Cannot set a child category as parent');
      }
    }

    let slug;
    if (data.name) {
      slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    }

    return await prisma.post_categories.update({
      where: { id: categoryId },
      data: {
        ...data,
        parent_id: parentId,
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
