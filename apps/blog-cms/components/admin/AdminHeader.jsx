import { Button } from "@/components/ui/button";

export default function AdminHeader() {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="text-sm text-gray-500 font-medium">
                Quản trị viên / <span className="text-gray-900">Tổng quan</span>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">Trợ giúp</Button>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                    AD
                </div>
            </div>
        </header>
    );
}
