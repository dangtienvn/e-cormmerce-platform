import { createPost } from "@/modules/post/post.service";
import { getCategoryTree } from "@/modules/category/category.service";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
    const categories = await getCategoryTree();

    const handleSubmit = async (formData: FormData) => {
        "use server";
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const categoryId = parseInt(formData.get("categoryId") as string);
        const externalStoreUrl = formData.get("externalStoreUrl") as string;
        // In a real app, authorId would come from the session. 
        // We'll hardcode 1 for MVP (assuming User 1 exists).
        await createPost({
            title,
            content,
            categoryId: isNaN(categoryId) ? undefined : categoryId,
            externalStoreUrl: externalStoreUrl || undefined,
            authorId: 1
        });
        
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
