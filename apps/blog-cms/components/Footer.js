import Link from "next/link";
import { Github, Youtube, Twitter, Linkedin, Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#111111] border-t border-white/5 py-12 mt-24">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              devlog.
            </span>
          </Link>
          <p className="text-slate-400 text-sm max-w-xs text-center md:text-left">
            Chia sẻ kiến thức lập trình Web, System Design và hành trình xây dựng sản phẩm thực tế.
          </p>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a href="#" className="hover:text-white transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-red-500 transition-colors">
            <Youtube className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-blue-500 transition-colors">
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
      </div>
      
      <div className="container mx-auto px-6 mt-8 pt-8 border-t border-white/5 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} devlog. Built with Next.js & Tailwind.
      </div>
    </footer>
  );
}
