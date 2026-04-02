import Link from "next/link";
import { Clock } from "lucide-react";

export default function ArticleCard({ title, excerpt, date, readTime, tag, tagColor, link }) {
  return (
    <Link href={link || "#"} className="group flex flex-col bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1">
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video bg-[#0b0f19] relative overflow-hidden flex items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
        <span className="font-heading font-bold text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
          DEVLOG
        </span>
        <div className="absolute top-4 left-4">
           <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${tagColor || 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
            {tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-6 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="mt-auto flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {date}
          </span>
          <span>&bull;</span>
          <span>{readTime} read</span>
        </div>
      </div>
    </Link>
  );
}
