export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden py-24 md:py-32 mb-16 text-center border-b border-gray-200 bg-white">
      {/* Very subtle dot pattern background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 mb-8 text-xs font-semibold text-gray-600 tracking-wide uppercase">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
          </span>
          Next-Gen Digital Assets
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter text-gray-900 max-w-4xl">
          Build faster with <br className="hidden md:block"/>
          <span className="text-gray-400">premium resources.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
          High-quality courses, e-books, and UI templates crafted for modern developers and designers. 
          Purchase once, access forever.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          <a href="#store-content" className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center">
            Explore Library
          </a>
          <a href="#trending" className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 px-8 py-3.5 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
            View Trending
          </a>
        </div>
      </div>
    </div>
  );
}
