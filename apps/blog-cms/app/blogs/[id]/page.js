import Link from "next/link";
import { getPostById } from "@/modules/post/post.service";

export default async function PostDetailPage({ params }) {
    // Đọc ID từ URL
    const { id } = await params;
    
    const post = await getPostById(parseInt(id));

    if (!post) {
        return <div className="container mx-auto px-4 py-12 text-center text-red-500">Bài viết không tồn tại</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link href="/blogs" className="text-primary hover:underline mb-6 inline-block">
                &larr; Quay lại danh sách
            </Link>
            
            <div className="bg-white rounded-xl overflow-hidden mt-4 shadow-sm border">
                <div className="relative h-[400px] w-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                    Ảnh Cover Bài Viết
                </div>
                
                <div className="p-8">
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    <div className="text-gray-500 text-sm mb-8 pb-8 border-b">
                        Đăng ngày: {post.createdAt}
                    </div>
                    
                    <div className="prose max-w-none">
                        <p className="text-lg leading-relaxed text-gray-700">
                            {post.content}
                        </p>
                        
                        {post.externalStoreUrl && (
                            <div className="mt-12 bg-blue-50 border border-blue-200 p-8 rounded-xl text-center">
                                <h3 className="text-2xl font-bold text-blue-900 mb-4">Bạn quan tâm đến chủ đề này?</h3>
                                <p className="text-blue-700 mb-6">Chúng tôi có sản phẩm số / tài liệu cao cấp dành riêng cho bạn để đi sâu hơn vào vấn đề này.</p>
                                <a 
                                    href={post.externalStoreUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
                                >
                                    Mua ngay / Xem chi tiết sản phẩm &rarr;
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
