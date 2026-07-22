import Link from "next/link";
import { Tag, TrendingUp, Folder } from "lucide-react";

export default function Sidebar({ categories = [], popularPosts = [], tags = [] }) {
  return (
    <aside className="space-y-6">

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
            <Folder className="w-4 h-4 text-teal-600" />
            Chuyên Mục
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/blogs?category=${cat.slug}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                >
                  <span className="font-medium group-hover:font-semibold transition-all">{cat.name}</span>
                  {cat._count?.posts !== undefined && (
                    <span className="text-xs text-slate-400 bg-slate-100 group-hover:bg-teal-100 px-2 py-0.5 rounded-full transition-colors">
                      {cat._count.posts}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Bài Viết Nổi Bật
          </h3>
          <ul className="space-y-3">
            {popularPosts.slice(0, 5).map((post, i) => (
              <li key={post.id} className="flex gap-3 items-start">
                <span className="text-2xl font-black text-slate-100 leading-none mt-0.5 shrink-0 w-6 text-center">
                  {i + 1}
                </span>
                <Link
                  href={`/blogs/${post.id}`}
                  className="text-sm text-slate-700 hover:text-teal-700 font-medium line-clamp-2 leading-snug transition-colors"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
            <Tag className="w-4 h-4 text-teal-600" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
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
      )}

      {/* Store CTA */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-200 mb-2">Digital Store</p>
        <h3 className="font-bold text-base mb-2 leading-snug">Muốn đi sâu hơn?</h3>
        <p className="text-sm text-teal-100 mb-4 leading-relaxed">
          Khám phá các tài liệu, eBook & template code chất lượng cao của mình.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full text-center bg-white text-teal-700 font-bold text-sm py-2.5 rounded-lg hover:bg-teal-50 transition-colors"
        >
          Xem cửa hàng →
        </a>
      </div>

    </aside>
  );
}
