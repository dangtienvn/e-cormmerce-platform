const { prisma } = require("../../config/database");

const RefreshTokenRepository = {
  async create(userId, tokenHash, expiresAt) {
    const rec = await prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });
    return rec;
  },

  async findByTokenHash(tokenHash) {
    return await prisma.refresh_tokens.findFirst({
      where: { token_hash: tokenHash },
      include: { users: true },
    });
  },

  async deleteById(id) {
    return await prisma.refresh_tokens.delete({ where: { id } });
  },

  async deleteByUserId(userId) {
    return await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
  },

  async deleteByTokenHash(tokenHash) {
    return await prisma.refresh_tokens.deleteMany({ where: { token_hash: tokenHash } });
  }
};

module.exports = RefreshTokenRepository;
