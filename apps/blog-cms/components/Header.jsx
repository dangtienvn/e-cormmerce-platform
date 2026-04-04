import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Header() {
    return (
        <header className="border-b bg-slate-950/80 border-slate-800 backdrop-blur-md sticky top-0 z-50 text-slate-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <Terminal className="w-8 h-8" />
                        <span className="font-bold text-xl tracking-tight">NexBlog</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Trang chủ</Link>
                        <Link href="/blogs" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Bài viết</Link>
                        <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Giới thiệu</Link>
                    </nav>
                </div>
                <div>
                    <Link href="/admin/dashboard" className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 px-4 bg-cyan-600 text-white hover:bg-cyan-500 transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </header>
    );

}