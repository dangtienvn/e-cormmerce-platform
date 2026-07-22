const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PostCommentService {
    async getCommentsByPost(postId) {
        return await prisma.post_comments.findMany({
            where: { post_id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar_url: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async createComment(data) {
        return await prisma.post_comments.create({
            data: {
                post_id: data.postId,
                user_id: data.userId,
                content: data.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar_url: true,
                    }
                }
            }
        });
    }

    async deleteComment(commentId, userId, userRole) {
        const comment = await prisma.post_comments.findUnique({
            where: { id: commentId }
        });

        if (!comment) throw new Error("Comment not found");

        // allow delete if user is author or admin (role_id 1 usually)
        if (comment.user_id !== userId && userRole !== 1) {
            throw new Error("Unauthorized to delete this comment");
        }

        return await prisma.post_comments.delete({
            where: { id: commentId }
        });
    }
}

module.exports = new PostCommentService();
