import Link from "next/link";
import { getPosts } from "@/modules/post/post.service";

export default async function BlogsPage() {
    const posts = await getPosts();

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-10 text-center">Danh sách bài viết</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((item) => (
                    <article key={item.id} className="group flex flex-col bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-52 w-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                            Thumbnail
                            {item.status === 'active' && (
                                <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                                    Mới
                                </span>
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                            </h2>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                                {item.content.substring(0, 150)}...
                            </p>
                            <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                <span className="text-sm text-gray-400">5 phút đọc</span>
                                <Link 
                                    href={`/blogs/${item.id}`} 
                                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    Đọc tiếp <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
