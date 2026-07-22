"use client";
import Link from "next/link";
import { Clock, Tag } from "lucide-react";

function calcReadTime(content = "") {
  const words = content.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} phút đọc`;
}

export default function PostCard({ post, variant = "default" }) {
  if (!post) return null;

  const href = `/blogs/${post.id}`;
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "";
  const readTime = calcReadTime(post.content);
  const excerpt = post.content ? post.content.substring(0, 120).trim() + "…" : "";

  // Horizontal variant: image left + content right (used on homepage featured)
  if (variant === "horizontal") {
    return (
      <Link href={href} className="group flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
        {/* Thumbnail */}
        <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">
              blog
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {post.category && (
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded mb-1.5">
              {post.category.name}
            </span>
          )}
          <h3 className="font-semibold text-sm text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{readTime}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant: vertical card (used in /blogs listing)
  return (
    <article className="group flex gap-5 py-6 border-b border-slate-100 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-36 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300">
            <span className="font-bold text-xs uppercase tracking-widest">devlog</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <Link
              href={`/blogs?category=${post.category.slug || post.category.name?.toLowerCase()}`}
              className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {post.category.name}
            </Link>
          )}
          <span className="text-[11px] text-slate-400">{date}</span>
        </div>

        <Link href={href}>
          <h2 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-1.5 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{excerpt}</p>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{readTime}</span>
          <Link
            href={href}
            className="ml-auto text-teal-600 hover:text-teal-700 font-semibold text-xs hover:underline transition-colors"
          >
            Đọc tiếp →
          </Link>
        </div>
      </div>
    </article>
  );
}
