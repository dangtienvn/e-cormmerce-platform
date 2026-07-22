import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getData(searchParams) {
  const category = searchParams?.category || "";
  const q = searchParams?.q || "";
  const page = parseInt(searchParams?.page || "1");
  const take = 10;
  const skip = (page - 1) * take;

  let url = `${API}/api/posts?status=PUBLISHED&take=${take}&skip=${skip}`;
  if (category) url += `&categorySlug=${category}`;
  if (q) url += `&search=${encodeURIComponent(q)}`;

  try {
    const [postsRes, categoriesRes] = await Promise.all([
      fetch(url, { cache: "no-store" }),
      fetch(`${API}/api/post-categories`, { cache: "no-store" }),
    ]);
    const postsData = postsRes.ok ? await postsRes.json() : { data: [] };
    const catData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
    return {
      posts: postsData.data || [],
      total: postsData.total || postsData.data?.length || 0,
      categories: catData.data || [],
      page,
      take,
    };
  } catch {
    return { posts: [], total: 0, categories: [], page: 1, take };
  }
}

export default async function BlogsPage({ searchParams }) {
  const sp = await searchParams;
  const { posts, total, categories, page, take } = await getData(sp);
  const category = sp?.category || "";
  const q = sp?.q || "";
  const totalPages = Math.ceil(total / take);

  const popularPosts = posts.slice(0, 5);
  const tags = ["Next.js", "JavaScript", "Node.js", "PostgreSQL", "Docker", "Redis", "TypeScript", "React"];

  const pageTitle = q
    ? `Kết quả tìm kiếm: "${q}"`
    : category
    ? `Chuyên mục: ${categories.find((c) => c.slug === category)?.name || category}`
    : "Tất Cả Bài Viết";

  function buildPageUrl(newPage) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (newPage > 1) params.set("page", String(newPage));
    return `/blogs${params.toString() ? "?" + params.toString() : ""}`;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-black text-slate-900">{pageTitle}</h1>
          {total > 0 && (
            <p className="text-sm text-slate-500 mt-1">{total} bài viết</p>
          )}

          {/* Active filters */}
          {(category || q) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Đang lọc:</span>
              {category && (
                <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  {categories.find((c) => c.slug === category)?.name || category}
                  <Link href="/blogs" className="ml-1 text-teal-500 hover:text-teal-700">×</Link>
                </span>
              )}
              {q && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
                  Tìm: {q}
                  <Link href="/blogs" className="ml-1 text-blue-500 hover:text-blue-700">×</Link>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main layout: posts + sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Posts list */}
          <div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {posts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <div key={post.id} className="px-6">
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-lg mb-2">😕 Không tìm thấy bài viết nào</p>
                  <p className="text-sm text-slate-400 mb-6">Thử tìm kiếm với từ khóa khác hoặc xem tất cả bài viết.</p>
                  <Link href="/blogs" className="text-sm font-semibold text-teal-600 hover:underline">
                    Xem tất cả bài viết →
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ← Trước
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildPageUrl(p)}
                    className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      p === page
                        ? "bg-teal-600 text-white"
                        : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Tiếp →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar categories={categories} popularPosts={popularPosts} tags={tags} />
        </div>
      </div>
    </div>
  );
}
