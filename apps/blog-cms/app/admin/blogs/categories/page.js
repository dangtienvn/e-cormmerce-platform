import Link from "next/link";


export default async function AdminCategoriesPage() {
    let categories = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post-categories/tree`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            categories = data.data || [];
        }
    } catch (err) {
        console.error("Failed to fetch categories", err);
    }

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Danh Mục Bài Viết</h1>

            <div className="card shadow mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="m-0 font-weight-bold text-primary">Danh sách phân cấp</h6>
                    <Link href="/admin/blogs/categories/create" className="btn btn-success">
                        + Thêm mới danh mục
                    </Link>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th width="5%">STT</th>
                                    <th>Tiêu đề</th>
                                    <th width="15%">Vị trí</th>
                                    <th width="15%">Trạng thái</th>
                                    <th width="15%">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {/* Logic render tree (prefix --) sẽ dùng component đệ quy sau */}
                                            {item.parent_id ? `-- ${item.title}` : item.title}
                                        </td>
                                        <td>
                                            <input type="number" defaultValue={item.position} className="form-control form-control-sm" style={{ width: "60px" }} />
                                        </td>
                                        <td>
                                            <span className="badge bg-success">Hoạt động</span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/products/categories/edit/${item.id}`} className="btn btn-warning btn-sm me-1">Sửa</Link>
                                            <button className="btn btn-danger btn-sm">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
