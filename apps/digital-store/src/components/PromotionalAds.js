import Link from 'next/link';

export default function PromotionalAds() {
  return (
    <div className="container mx-auto px-6 mt-16 mb-24">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
        
        <div className="relative z-10 px-8 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Unlock 30% off on all React resources.
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-xl">
              Elevate your frontend skills. Use code <span className="font-mono font-bold bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded text-sm">REACT30</span> at checkout to apply your discount.
            </p>
            <Link href="/products?category=react" className="inline-block bg-black text-white font-medium py-3 px-8 rounded-md hover:bg-gray-800 transition-colors">
              Claim Offer
            </Link>
          </div>
          
          <div className="hidden md:flex flex-col gap-4">
            <div className="w-48 h-32 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center -rotate-6 transform hover:rotate-0 transition-transform duration-500">
               <span className="text-gray-400 font-mono text-sm">&lt;React.Component /&gt;</span>
            </div>
            <div className="w-48 h-32 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center rotate-3 transform hover:rotate-0 transition-transform duration-500 translate-x-8">
               <span className="text-gray-400 font-mono text-sm">useHooks()</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
