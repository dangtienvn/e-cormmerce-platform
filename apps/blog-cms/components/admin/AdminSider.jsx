import Link from "next/link";

export default function AdminSider() {
    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col sticky top-0 h-screen">
            <div className="p-6">
                <Link href="/admin/dashboard" className="text-2xl font-bold tracking-tighter">
                    NexAdmin
                </Link>
            </div>
            <nav className="flex-1 px-4 space-y-1">
                <Link href="/admin/dashboard" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                    Tổng quan
                </Link>
                <Link href="/admin/blogs/categories" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                    Danh mục bài viết
                </Link>
                <Link href="/admin/blogs" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                    Quản lý bài viết
                </Link>
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hệ thống
                </div>
                <Link href="/admin/users" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                    Quản lý người dùng
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                    Cài đặt
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <span>&larr;</span> Quay lại trang web
                </Link>
            </div>
        </aside>
    );
}
