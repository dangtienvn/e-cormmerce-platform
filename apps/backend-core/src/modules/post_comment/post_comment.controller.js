const PostCommentService = require('./post_comment.service');

class PostCommentController {
    async getCommentsByPost(req, res, next) {
        try {
            const { postId } = req.params;
            const comments = await PostCommentService.getCommentsByPost(parseInt(postId));
            res.status(200).json({ success: true, data: comments });
        } catch (error) {
            next(error);
        }
    }

    async createComment(req, res, next) {
        try {
            const { post_id, content } = req.body;
            // user is attached by the protect middleware, but we removed it for MVP
            const userId = req.user ? req.user.id : 1;
            
            const comment = await PostCommentService.createComment({
                postId: parseInt(post_id),
                userId,
                content
            });
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    }

    async deleteComment(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role_id;
            await PostCommentService.deleteComment(parseInt(id), userId, userRole);
            res.status(200).json({ success: true, message: "Comment deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostCommentController();
