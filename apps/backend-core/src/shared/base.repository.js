const { prisma } = require("../config/database");

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(search = "", searchFields = ["name"]) {
    const where = { deleted_at: null };
    
    if (search && searchFields.length > 0) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search }
      }));
    }
    
    return await prisma[this.tableName].findMany({
      where,
      orderBy: { id: 'desc' }
    });
  }

  async findById(id) {
    return await prisma[this.tableName].findFirst({
      where: { id: parseInt(id), deleted_at: null }
    });
  }

  async create(data) {
    return await prisma[this.tableName].create({
      data
    });
  }

  async update(id, data) {
    return await prisma[this.tableName].update({
      where: { id: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return await prisma[this.tableName].update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
  }

  async findTrash(search = "", searchFields = ["name"]) {
    const where = { deleted_at: { not: null } };
    
    if (search && searchFields.length > 0) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search }
      }));
    }
    
    return await prisma[this.tableName].findMany({
      where,
      orderBy: { deleted_at: 'desc' }
    });
  }

  async restore(id) {
    return await prisma[this.tableName].update({
      where: { id: parseInt(id) },
      data: { deleted_at: null }
    });
  }
}

module.exports = BaseRepository;
