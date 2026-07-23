
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
    let categories = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post-categories/tree`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            categories = data.data || [];
        }
    } catch (err) {
        console.error("Failed to fetch categories", err);
    }

    const handleSubmit = async (formData) => {
        "use server";
        const title = formData.get("title");
        const content = formData.get("content");
        const categoryId = parseInt(formData.get("categoryId"));
        const externalStoreUrl = formData.get("externalStoreUrl");
        // In a real app, authorId would come from the session. 
        // We'll hardcode 1 for MVP (assuming User 1 exists).
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    category_id: isNaN(categoryId) ? undefined : categoryId,
                    external_store_url: externalStoreUrl || undefined,
                    author_id: 1 // hardcoded for now
                })
            });
        } catch (err) {
            console.error("Failed to create post", err);
        }
        
        redirect("/admin/blogs");
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Thêm mới Bài Viết</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <form action={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Tiêu đề bài viết</label>
                            <input type="text" name="title" className="form-control" required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select name="categoryId" className="form-control">
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Link Sản phẩm Digital Store (tuỳ chọn)</label>
                            <input type="url" name="externalStoreUrl" className="form-control" placeholder="https://store.yourdomain.com/product/123" />
                            <small className="text-muted">Nếu điền link, bài viết sẽ hiện nút "Mua ngay" chuyển hướng người đọc sang Store.</small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nội dung</label>
                            <textarea name="content" className="form-control" rows={10} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Lưu bài viết</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
