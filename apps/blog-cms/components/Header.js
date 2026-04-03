import Link from "next/link";
import { Flame, Sun } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f19] border-b border-transparent transition-colors">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Flame className="w-10 h-10 text-orange-500 hover:scale-110 transition-transform" />
        </Link>

        {/* Right side Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Promo Banner (Hidden on mobile) */}
          <Link href="#" className="hidden lg:flex items-center justify-center border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 transition-colors">
            <span className="text-xs font-bold font-sans text-pink-500 mr-2 uppercase tracking-wide">NEW</span>
            <span className="text-xs font-medium text-slate-300">Bài viết mới nhất đã có mặt &rarr;</span>
          </Link>

          {/* Theme Toggle */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          
          {/* Login Button */}
          <Link href="/login" className="flex items-center justify-center h-10 px-6 rounded-full border-2 border-yellow-400 text-yellow-400 font-black text-sm tracking-widest hover:bg-yellow-400/10 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all uppercase">
            LOGIN
          </Link>
        </div>
        
      </div>
    </header>
  );
}
