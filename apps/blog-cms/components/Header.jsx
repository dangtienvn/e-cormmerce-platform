"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, Menu, ChevronDown } from "lucide-react";

const NAV_CATEGORIES = [
  { label: "Tất cả", slug: "" },
  { label: "Next.js", slug: "next-js" },
  { label: "JavaScript", slug: "javascript" },
  { label: "System Design", slug: "system-design" },
  { label: "DevOps", slug: "devops" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blogs?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogoClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isActive = (slug) => {
    if (!slug) return pathname === "/blogs" && !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('category');
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('category') === slug;
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : "shadow-none"
      }`}
    >
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-teal-500 transition-all">
            <Image src="/img/avatar.png" alt="Kernel" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Kernel
          </span>
        </Link>

        {/* Desktop Search Bar (inline) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm bài viết, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Tìm kiếm"
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Store link */}
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            🛒 Cửa hàng
          </a>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t bg-white">
          <form onSubmit={handleSearch} className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm bài viết, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </form>
        </div>
      )}

      {/* Category Nav (Sub-header) */}
      <div className="hidden md:block border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-none">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug ? `/blogs?category=${cat.slug}` : "/blogs"}
                className={`shrink-0 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  isActive(cat.slug)
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug ? `/blogs?category=${cat.slug}` : "/blogs"}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {cat.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2">
            <a
              href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002"}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
            >
              🛒 Cửa hàng Digital
            </a>
          </div>
        </div>
      )}
    </header>
  );
}