import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image src="/img/avatar.png" alt="Kernel" fill className="object-cover" />
              </div>
              <span className="font-bold text-slate-900">Kernel</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nơi chia sẻ kiến thức thực tế về JavaScript ecosystem, System Design và hành trình phát triển phần mềm chuẩn Production.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Chuyên Mục</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {[
                { label: "Next.js", href: "/blogs?category=next-js" },
                { label: "JavaScript", href: "/blogs?category=javascript" },
                { label: "System Design", href: "/blogs?category=system-design" },
                { label: "PostgreSQL", href: "/blogs?category=postgresql" },
                { label: "DevOps", href: "/blogs?category=devops" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-teal-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Khác</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3002"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 transition-colors"
                >
                  🛒 Digital Store
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-600 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-teal-600 transition-colors text-slate-400">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Kernel. Built by Đặng Thanh Tiến.</p>
          <p>Made with ❤️ using Next.js & PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
