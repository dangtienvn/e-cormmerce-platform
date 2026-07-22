"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post-comments/${postId}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch comments", error);
            }
        };
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post-comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: postId, content: newComment })
            });

            if (res.ok) {
                const data = await res.json();
                setComments([data.data, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to submit comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Bình luận ({comments.length})</h3>

            <form onSubmit={handleSubmit} className="mb-8">
                <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 min-h-[100px] mb-3 text-sm"
                    disabled={isSubmitting}
                />
                <button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                    disabled={isSubmitting || !newComment.trim()}
                >
                    {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                </button>
            </form>

            <div className="space-y-5">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-100">
                            {comment.user?.avatar_url ? (
                                <Image src={comment.user.avatar_url} alt={comment.user.full_name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                                    {comment.user?.full_name?.charAt(0) || comment.user?.username?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-slate-800 text-sm">{comment.user?.full_name || comment.user?.username || "Người dùng"}</span>
                                <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
