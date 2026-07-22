import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import { ArrowRight, Mail, Rss } from "lucide-react";

export const metadata = {
  title: "Kernel – Kiến Thức Lập Trình",
  description: "Nơi chia sẻ kiến thức về JavaScript, Next.js, System Design và hành trình phát triển phần mềm chuẩn Production.",
};

const API = process.env.NEXT_PUBLIC_API_URL;

async function getHomeData() {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      fetch(`${API}/api/posts?status=PUBLISHED&take=10`, { cache: "no-store" }),
      fetch(`${API}/api/post-categories`, { cache: "no-store" }),
    ]);
    const postsData = postsRes.ok ? await postsRes.json() : { data: [] };
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
    return {
      posts: postsData.data || [],
      categories: categoriesData.data || [],
    };
  } catch {
    return { posts: [], categories: [] };
  }
}

export default async function Home() {
  const { posts, categories } = await getHomeData();

  const featuredPost = posts[0] || null;
  const recentPosts = posts.slice(1, 6);
  const popularPosts = posts.slice(0, 5);
  const tags = ["Next.js", "JavaScript", "Node.js", "PostgreSQL", "Docker", "Redis", "TypeScript", "React"];

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-teal-100">
              <Rss className="w-3 h-3" />
              Cập nhật mỗi tuần
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
              Kiến thức{" "}
              <span className="text-teal-600">thực chiến</span>{" "}
              cho Developer Việt
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
              Chia sẻ những gì mình học được qua thực tế: JavaScript ecosystem, Microservices, System Design, và DevOps từ A→Z.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/blogs"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-teal-200"
              >
                Đọc bài viết <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors"
              >
                🛒 Cửa hàng
              </a>
            </div>
          </div>

          {/* Avatar card */}
          <div className="shrink-0 text-center">
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden ring-4 ring-teal-100 shadow-xl mb-4">
              <Image src="/img/avatar.png" alt="Kernel Author" fill className="object-cover" />
            </div>
            <p className="font-bold text-slate-900">Kernel</p>
            <p className="text-sm text-slate-500">Full-stack Developer</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-400">
              <span>📦 {posts.length}+ bài viết</span>
              <span>·</span>
              <span>🏷️ {categories.length} chủ đề</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Left: Featured + Recent Posts */}
          <div>

            {/* Featured Post */}
            {featuredPost && (
              <section className="mb-10">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Bài Viết Nổi Bật</h2>
                <Link href={`/blogs/${featuredPost.id}`} className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-56 bg-slate-100">
                    {featuredPost.thumbnail ? (
                      <img src={featuredPost.thumbnail} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-black text-5xl text-slate-200 uppercase tracking-widest">devlog</span>
                      </div>
                    )}
                    {featuredPost.category && (
                      <span className="absolute top-4 left-4 text-xs font-bold text-teal-700 bg-white px-3 py-1 rounded-full shadow-sm">
                        {featuredPost.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-2 leading-snug">
                      {featuredPost.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {featuredPost.content?.substring(0, 150)}…
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                      <span>{new Date(featuredPost.created_at).toLocaleDateString("vi-VN")}</span>
                      <span>·</span>
                      <span>{Math.max(1, Math.ceil((featuredPost.content?.split(/\s+/).length || 0) / 200))} phút đọc</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600">Bài Viết Mới Nhất</h2>
                <Link href="/blogs" className="text-xs text-slate-500 hover:text-teal-600 font-medium transition-colors">
                  Xem tất cả →
                </Link>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <div key={post.id} className="px-5">
                      <PostCard post={post} />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-12 text-sm">Chưa có bài viết nào.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <Sidebar
            categories={categories}
            popularPosts={popularPosts}
            tags={tags}
          />
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <section className="bg-white border-t py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 rounded-full mb-5">
            <Mail className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Đăng ký nhận bài mới</h2>
          <p className="text-slate-500 text-sm mb-6">Nhận thông báo khi có bài viết mới. No spam, unsubscribe bất cứ lúc nào.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
