export default function Footer() {
    return (
        <footer className="border-t py-8 bg-gray-50 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} NexBlog. Built by Đặng Thanh Tiến.
            </div>
        </footer>
    );
}
