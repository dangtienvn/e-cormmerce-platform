import Link from "next/link";

export default function TechCard({ title, desc, icon: Icon, colorClass, link }) {
  // colorClass is something like "bg-green-500"
  
  return (
    <Link href={link || "#"} className={`group relative block p-2 rounded-2xl ${colorClass} transition-transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)]`}>
      {/* Top Black Box */}
      <div className="w-full aspect-[2/1] bg-[#111111] rounded-xl flex items-center justify-center">
        <Icon className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" />
      </div>
      
      {/* Bottom Content (Colored background) */}
      <div className="p-4 pt-5 pb-6">
        <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-[#111111] mb-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm font-medium text-[#111111]/80 leading-relaxed group-hover:text-white/90 transition-colors">
          {desc}
        </p>
      </div>
    </Link>
  );
}
