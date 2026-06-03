export default function CategoryList() {
  const categories = [
    { id: 'course', name: 'Khóa học Online', desc: 'Video & Bài giảng', icon: '▶', color: 'bg-blue-100 text-blue-600' },
    { id: 'ebook', name: 'Ebooks / Tài liệu', desc: 'Sách & PDF', icon: '📚', color: 'bg-green-100 text-green-600' },
    { id: 'template', name: 'Templates / UI', desc: 'Thiết kế & Mẫu', icon: '🎨', color: 'bg-amber-100 text-amber-600' },
    { id: 'software', name: 'Phần mềm & Tools', desc: 'Công cụ hỗ trợ', icon: '⚙️', color: 'bg-cyan-100 text-cyan-600' },
  ];

  return (
    <div className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Danh mục phổ biến</h2>
        <p className="text-slate-500">Khám phá các sản phẩm theo nhu cầu của bạn</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map(cat => (
          <a key={cat.id} href="#store-content" className="group block">
            <div className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${cat.color.replace('text-', 'bg-').replace('100', '50')} border border-transparent hover:border-${cat.color.split(' ')[1].split('-')[1]}-200`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 bg-white shadow-sm ${cat.color.split(' ')[1]}`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">{cat.name}</h3>
              <p className="text-sm text-slate-500">{cat.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
