import Link from "next/link";
import { ArrowRight, Code, Database, Sparkles, Terminal, Cpu, Zap, Mail } from "lucide-react";
import TechCard from "@/components/TechCard";
import ArticleCard from "@/components/ArticleCard";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Blog CMS - Kiến Thức Lập Trình",
  description: "Chia sẻ kiến thức về lập trình, system design và công nghệ",
};

export default async function Home() {
  const recentPosts = await prisma.posts.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { created_at: 'desc' },
    take: 3,
    include: {
      category: true,
      author: true
    }
  });
  return (
    <div className="relative min-h-screen bg-[#0b0f19] overflow-hidden text-white pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1f2e] border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold tracking-wide text-slate-300">NEW: HƯỚNG DẪN NEXT.JS 15</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            Kiến Thức<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Lập Trình Viên
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium mb-12">
            Nơi tôi chia sẻ những kiến thức sâu sắc về Javascript ecosystem, Microservices và hành trình phát triển phần mềm chuẩn Production. Dễ hiểu && thú vị.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/articles" className="group flex items-center justify-center gap-2 px-8 h-14 bg-yellow-400 text-black font-black uppercase tracking-wider rounded-xl hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(255,255,255,0.2)]">
              Đọc Bài Mới <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/courses" className="flex items-center justify-center gap-2 px-8 h-14 bg-transparent border-2 border-white/20 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors">
              <Terminal className="w-5 h-5" /> Khóa Học
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TECH STACK / FEATURED (Cards rực rỡ style Fireship) */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
             <h2 className="font-heading font-black text-3xl uppercase tracking-wider">
               Trending <span className="text-cyan-400">Tech</span>
             </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TechCard 
              title="Next.js" 
              desc="Học kiến thức cơ bản về Next.js App Router."
              icon={Zap}
              colorClass="bg-white"
              link="/tag/nextjs"
            />
            <TechCard 
              title="Javascript" 
              desc="Xây dựng nền tảng vững chắc với ngôn ngữ mẹ đẻ."
              icon={Code}
              colorClass="bg-yellow-400"
              link="/tag/javascript"
            />
            <TechCard 
              title="PostgreSQL" 
              desc="Làm chủ CSDL quan hệ với Prisma ORM."
              icon={Database}
              colorClass="bg-blue-500"
              link="/tag/postgresql"
            />
            <TechCard 
              title="System Design" 
              desc="Kiến trúc Microservices và Docker cho người mới."
              icon={Cpu}
              colorClass="bg-purple-500"
              link="/tag/system-design"
            />
          </div>
        </div>
      </section>

      {/* 3. LATEST ARTICLES */}
      <section className="px-6 py-20 bg-[#111111] mt-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
             <h2 className="font-heading font-black text-4xl uppercase tracking-wider">
               Bài Viết <span className="text-orange-500">Mới</span>
             </h2>
             <Link href="/articles" className="font-bold text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
               Xem tất cả &rarr;
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.length > 0 ? (
              recentPosts.map(post => (
                <ArticleCard 
                  key={post.id}
                  title={post.title}
                  excerpt={post.content.substring(0, 100) + '...'}
                  date={new Date(post.created_at).toLocaleDateString('vi-VN')}
                  readTime="5 min"
                  tag={post.category?.name || "Tech"}
                  tagColor="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  slug={post.slug}
                />
              ))
            ) : (
              <p className="text-slate-400 col-span-3 text-center">Chưa có bài viết nào.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto bg-green-500 rounded-3xl p-1 md:p-2 rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="bg-[#111111] rounded-2xl p-8 md:p-16 text-center border-4 border-green-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl uppercase mb-4 text-white">
              Gia nhập hội <span className="text-green-500">Devs</span>
            </h2>
            <p className="text-slate-400 font-medium mb-8 max-w-lg mx-auto">
              Nhận những mẹo code độc quyền, tài liệu hướng dẫn cực chất và thông báo bài viết mới nhất thẳng vào hộp thư của bạn. No spam.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="flex-grow bg-[#1a1f2e] border-2 border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-green-500 transition-colors"
                required
              />
              <button 
                type="submit"
                className="bg-green-500 text-black font-black uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-green-400 transition-colors"
              >
                Đăng Ký
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
