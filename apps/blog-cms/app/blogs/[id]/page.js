import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import Sidebar from "@/components/Sidebar";
import { Clock, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

function calcReadTime(content = "") {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getPost(id) {
  try {
    const res = await fetch(`${API}/api/posts/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getSidebarData() {
  try {
    const [catRes, postsRes] = await Promise.all([
      fetch(`${API}/api/post-categories`, { cache: "no-store" }),
      fetch(`${API}/api/posts?status=PUBLISHED&take=5`, { cache: "no-store" }),
    ]);
    const categories = catRes.ok ? (await catRes.json()).data || [] : [];
    const popularPosts = postsRes.ok ? (await postsRes.json()).data || [] : [];
    return { categories, popularPosts };
  } catch {
    return { categories: [], popularPosts: [] };
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Bài viết không tồn tại" };
  return {
    title: `${post.title} – Kernel`,
    description: post.content?.substring(0, 150),
  };
}

export default async function PostDetailPage({ params }) {
  const { id } = await params;
  const [post, { categories, popularPosts }] = await Promise.all([
    getPost(id),
    getSidebarData(),
  ]);

  if (!post) notFound();

  const readTime = calcReadTime(post.content);
  const date = new Date(post.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const tags = ["Next.js", "JavaScript", "Node.js", "PostgreSQL", "Docker", "TypeScript"];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── MAIN ARTICLE ── */}
          <article>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-teal-600 transition-colors">Trang chủ</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blogs" className="hover:text-teal-600 transition-colors">Bài viết</Link>
              {post.category && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <Link
                    href={`/blogs?category=${post.category.slug}`}
                    className="hover:text-teal-600 transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-400 line-clamp-1 max-w-[200px]">{post.title}</span>
            </nav>

            {/* Article card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              {/* Cover image */}
              <div className="relative h-64 md:h-80 bg-slate-100">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-black text-6xl text-slate-200 uppercase tracking-widest">devlog</span>
                  </div>
                )}
              </div>

              {/* Article content */}
              <div className="p-6 md:p-10">

                {/* Category + meta */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {post.category && (
                    <Link
                      href={`/blogs?category=${post.category.slug}`}
                      className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {post.category.name}
                    </Link>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {readTime} phút đọc
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-8">
                  {post.title}
                </h1>

                {/* Article body */}
                <div className="prose-article">
                  {post.content?.split("\n").map((para, i) =>
                    para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                  )}
                </div>

                {/* Store CTA if linked */}
                {post.external_store_url && (
                  <div className="mt-12 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-8 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg mb-1">Muốn đi sâu hơn về chủ đề này?</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Mình có tài liệu / eBook chuyên sâu dành riêng về chủ đề này trong cửa hàng.
                        </p>
                        <a
                          href={post.external_store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                        >
                          Xem sản phẩm trong cửa hàng →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
                  {(post.category ? [post.category.name] : []).concat(["JavaScript", "Web Dev"]).map((tag) => (
                    <Link
                      key={tag}
                      href={`/blogs?q=${encodeURIComponent(tag)}`}
                      className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 mt-6">
              <CommentSection postId={post.id} />
            </div>

          </article>

          {/* ── SIDEBAR ── */}
          <div className="sticky top-24">
            <Sidebar
              categories={categories}
              popularPosts={popularPosts}
              tags={tags}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
