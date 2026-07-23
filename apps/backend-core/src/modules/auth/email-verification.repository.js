const { prisma } = require("../../config/database");

const EmailVerificationRepository = {
  async createToken(userId, tokenHash, expiresAt) {
    const rec = await prisma.email_verifications.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }
    });
    return rec;
  },

  async findByTokenHash(tokenHash) {
    return await prisma.email_verifications.findFirst({
      where: { token_hash: tokenHash },
      include: { users: true }
    });
  },

  async deleteById(id) {
    return await prisma.email_verifications.delete({ where: { id } });
  },

  async deleteByUserId(userId) {
    return await prisma.email_verifications.deleteMany({ where: { user_id: userId } });
  }
};

module.exports = EmailVerificationRepository;
