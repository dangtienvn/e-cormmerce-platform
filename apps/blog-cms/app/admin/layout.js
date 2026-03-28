import AdminHeader from "@/components/admin/AdminHeader";
import AdminSider from "@/components/admin/AdminSider";

export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
        <AdminSider />
        <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="p-6">
                {children}
            </main>
        </div>
    </div>
  );
}
