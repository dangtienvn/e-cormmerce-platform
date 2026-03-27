import Link from "next/link";
import Image from "next/image";
import { getPosts, countPosts } from "@/modules/post/post.service";

export default async function AdminProductsPage() {
    // Gọi Database lấy danh sách bài viết admin
    const posts = await getPosts();
    const total = await countPosts();

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Quản lý Bài Viết ({total})</h1>
            
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 className="m-0 font-weight-bold text-primary">Danh sách bài viết</h6>
                    <Link href="/admin/products/create" className="btn btn-success btn-sm">
                        + Thêm mới
                    </Link>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th width="5%">STT</th>
                                    <th width="15%">Hình ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th width="15%">Giá / Trạng thái</th>
                                    <th width="10%">Vị trí</th>
                                    <th width="15%">Trạng thái hiển thị</th>
                                    <th width="15%">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="position-relative" style={{ width: "80px", height: "80px" }}>
                                                <Image 
                                                    src={item.thumbnail || "/images/logo.jpg"} 
                                                    alt={item.title} 
                                                    fill 
                                                    style={{ objectFit: "cover" }}
                                                    className="rounded"
                                                />
                                            </div>
                                        </td>
                                        <td>{item.title}</td>
                                        <td>{item.price ? `${item.price}$` : 'Miễn phí'}</td>
                                        <td>
                                            <input type="number" defaultValue={item.position} className="form-control form-control-sm" style={{ width: "60px" }} />
                                        </td>
                                        <td>
                                            {item.status === 'active' ? (
                                                <span className="badge bg-success">Đã xuất bản</span>
                                            ) : (
                                                <span className="badge bg-secondary">Bản nháp</span>
                                            )}
                                        </td>
                                        <td>
                                            <Link href={`/admin/products/edit/${item.id}`} className="btn btn-warning btn-sm me-1">Sửa</Link>
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
