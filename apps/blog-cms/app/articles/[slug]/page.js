import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await prisma.posts.findUnique({
    where: { slug }
  });

  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: `${post.title} | Blog CMS`,
    description: post.content.substring(0, 160).replace(/(<([^>]+)>)/ig, '') + '...',
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  
  const post = await prisma.posts.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: true,
      category: true,
    }
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
        </Link>
        
        <article>
          <header className="mb-12 border-b border-white/10 pb-8">
            {post.category && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider mb-6">
                <Tag className="w-3 h-3 mr-2" /> {post.category.name}
              </div>
            )}
            
            <h1 className="font-heading text-4xl md:text-5xl font-black leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.author?.full_name || post.author?.username || 'Admin'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </header>
          
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
