import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, Star, ArrowRight, Heart, Share2, 
  ChevronRight, Clock, MapPin, ShieldCheck, Zap 
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  desc: string;
  sales?: number;
  rating?: string;
  specs?: {
    sizes?: string[];
    labels?: string;
  };
}

export interface TemplateProps {
  company: string;
  headline: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

// --- FASHION TEMPLATES ---

export const FashionLuxe = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-white text-black font-serif">
    <header className="py-12 px-8 border-b border-zinc-100 flex flex-col items-center text-center space-y-4">
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] tracking-[0.3em] uppercase text-zinc-400"
      >
        Established 2026
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-6xl font-light tracking-tighter"
      >
        {company}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl text-zinc-500 text-sm md:text-base leading-relaxed"
      >
        {headline}
      </motion.p>
    </header>

    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
      {products.map((p, idx) => (
        <motion.div 
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="group cursor-pointer"
          onClick={() => onProductClick(p)}
        >
          <div className="aspect-[3/4] bg-zinc-50 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-700">
              {p.image}
            </div>
            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-zinc-800"
              >
                Add to Collection
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{p.name}</h3>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">{p.category}</p>
            </div>
            <span className="text-lg font-light">¥{p.price}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const FashionStreet = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#0a0a0a] text-white font-sans overflow-hidden">
    <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
      <div className="relative z-10 text-center space-y-4 px-6">
        <motion.div 
          initial={{ rotate: -5, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          className="inline-block bg-yellow-400 text-black px-4 py-1 text-sm font-black italic uppercase skew-x-[-10deg]"
        >
          Limited Drop
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic italic">
          {company}
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base font-bold">
          {headline}
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p, idx) => (
        <motion.div 
          key={p.id}
          whileHover={{ y: -5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-none p-4 group relative overflow-hidden"
          onClick={() => onProductClick(p)}
        >
          <div className="aspect-square flex items-center justify-center text-6xl mb-4 group-hover:rotate-12 transition-transform">
            {p.image}
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase italic">{p.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-black text-lg">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// --- CATERING TEMPLATES ---

export const CateringDark = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#0f0f0f] text-[#d4af37] font-serif">
    <header className="h-[60vh] flex flex-col items-center justify-center text-center px-6 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="space-y-6 relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-light tracking-widest uppercase">{company}</h1>
        <div className="w-24 h-[1px] bg-[#d4af37] mx-auto" />
        <p className="text-zinc-400 italic text-lg max-w-2xl">{headline}</p>
        <button className="mt-8 border border-[#d4af37] px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-[#d4af37] hover:text-black transition-all">
          Reserve a Table
        </button>
      </motion.div>
    </header>

    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {products.map((p) => (
          <div 
            key={p.id} 
            className="flex items-start space-x-6 border-b border-zinc-800 pb-8 cursor-pointer group"
            onClick={() => onProductClick(p)}
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">{p.image}</div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-medium text-white">{p.name}</h3>
                <span className="text-lg">¥{p.price}</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed italic">{p.desc}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="text-[10px] tracking-widest uppercase border border-zinc-700 px-3 py-1 hover:border-[#d4af37] hover:text-white transition-colors"
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- RETAIL TEMPLATES ---

export const RetailClean = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#f8f9fa] text-zinc-900 font-sans">
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-4 flex justify-between items-center border-b border-zinc-100">
      <span className="font-bold text-xl tracking-tight">{company}</span>
      <div className="flex space-x-8 text-sm font-medium text-zinc-500">
        <span className="text-black">Shop</span>
        <span>Categories</span>
        <span>About</span>
      </div>
      <ShoppingBag className="w-5 h-5" />
    </nav>

    <main className="max-w-7xl mx-auto px-8 py-16">
      <div className="mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">{headline}</h1>
        <p className="text-zinc-500 text-xl max-w-2xl">Discover our curated selection of global essentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p) => (
          <motion.div 
            key={p.id}
            whileHover={{ y: -8 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-50 flex flex-col cursor-pointer"
            onClick={() => onProductClick(p)}
          >
            <div className="aspect-square bg-zinc-50 rounded-2xl flex items-center justify-center text-7xl mb-6">
              {p.image}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span className="bg-zinc-100 px-2 py-1 rounded-full text-[10px] font-bold text-zinc-500">NEW</span>
              </div>
              <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{p.desc}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  </div>
);

// --- JEWELRY TEMPLATES ---

export const JewelryRoyal = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#050a14] text-[#e5c100] font-serif min-h-screen">
    <div className="h-screen flex flex-col items-center justify-center text-center px-6 border-b border-[#e5c100]/20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="space-y-8"
      >
        <div className="w-16 h-16 border-2 border-[#e5c100] rotate-45 mx-auto flex items-center justify-center">
          <span className="-rotate-45 text-2xl font-bold">J</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-light tracking-[0.2em] uppercase">{company}</h1>
        <p className="text-zinc-400 text-xl max-w-3xl mx-auto font-light leading-relaxed">{headline}</p>
        <button className="mt-12 bg-[#e5c100] text-[#050a14] px-12 py-4 text-sm tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all">
          Explore Collection
        </button>
      </motion.div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-32 space-y-32">
      {products.map((p, idx) => (
        <div 
          key={p.id} 
          className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 cursor-pointer`}
          onClick={() => onProductClick(p)}
        >
          <div className="flex-1 aspect-square bg-[#0a1222] border border-[#e5c100]/10 flex items-center justify-center text-[12rem] shadow-2xl">
            {p.image}
          </div>
          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs tracking-[0.4em] uppercase opacity-60">Signature Piece</span>
            <h3 className="text-4xl md:text-5xl font-light">{p.name}</h3>
            <p className="text-zinc-400 leading-loose text-lg font-light">{p.desc}</p>
            <div className="pt-6 border-t border-[#e5c100]/20 flex items-center justify-between">
              <span className="text-3xl font-light">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="border border-[#e5c100] px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#e5c100] hover:text-black transition-all"
              >
                Inquire Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- BEAUTY TEMPLATES ---

export const BeautyZen = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#faf7f5] text-[#4a4a4a] font-sans">
    <header className="py-24 px-6 text-center bg-gradient-to-b from-[#f3ede8] to-transparent">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-[#2a2a2a]">{company}</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto italic">{headline}</p>
      </motion.div>
    </header>

    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="bg-white rounded-[2rem] p-8 flex items-center space-x-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProductClick(p)}
        >
          <div className="w-32 h-32 bg-[#faf7f5] rounded-full flex items-center justify-center text-5xl shrink-0">
            {p.image}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-medium text-[#2a2a2a]">{p.name}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">{p.desc}</p>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xl font-bold text-[#b89b8e]">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="bg-[#b89b8e] text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-[#a68a7d] transition-colors"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- FITNESS TEMPLATES ---

export const FitnessIron = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-black text-white font-mono">
    <div className="relative h-[70vh] flex flex-col justify-end p-8 border-b-4 border-yellow-400 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40" />
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-10 space-y-4"
      >
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none uppercase">{company}</h1>
        <p className="text-yellow-400 text-xl font-black uppercase italic tracking-widest">{headline}</p>
      </motion.div>
    </div>

    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="bg-zinc-900 border-2 border-zinc-800 p-6 flex flex-col cursor-pointer group hover:border-yellow-400 transition-colors"
          onClick={() => onProductClick(p)}
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{p.image}</div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black italic uppercase">{p.name}</h3>
            <p className="text-zinc-500 text-[10px] leading-tight uppercase">{p.desc}</p>
          </div>
          <div className="mt-8 flex justify-between items-end">
            <span className="text-3xl font-black italic">¥{p.price}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="bg-yellow-400 text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- HOME TEMPLATES ---

export const HomeNordic = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#fcfcfc] text-[#333] font-sans">
    <div className="max-w-7xl mx-auto px-8 py-20">
      <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <h1 className="text-6xl font-light tracking-tight">{company}</h1>
          <p className="text-zinc-400 text-xl max-w-xl font-light">{headline}</p>
        </div>
        <div className="flex space-x-12 text-sm uppercase tracking-[0.2em] font-medium text-zinc-400">
          <span className="text-black border-b border-black pb-2">Living</span>
          <span>Kitchen</span>
          <span>Bedroom</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {products.map((p, idx) => (
          <motion.div 
            key={p.id}
            className={`${idx === 0 ? 'md:col-span-8' : 'md:col-span-4'} group cursor-pointer`}
            onClick={() => onProductClick(p)}
          >
            <div className="aspect-[16/9] bg-[#f5f5f5] flex items-center justify-center text-9xl group-hover:scale-[1.02] transition-transform duration-700">
              {p.image}
            </div>
            <div className="mt-6 flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-light">{p.name}</h3>
                <p className="text-zinc-400 text-sm font-light">{p.category}</p>
              </div>
              <div className="text-right space-y-2">
                <span className="text-2xl font-light">¥{p.price}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                  className="block text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  View Detail
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export const FashionEco = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#fdfbf7] text-[#5c5c5c] font-sans">
    <header className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
      <h1 className="text-3xl md:text-5xl font-light text-[#2d2d2d] tracking-tight">{company}</h1>
      <p className="text-lg opacity-80 leading-relaxed font-light">{headline}</p>
      <div className="flex justify-center space-x-4 pt-4">
        <span className="text-[10px] uppercase tracking-widest border-b border-[#5c5c5c] pb-1">Sustainable</span>
        <span className="text-[10px] uppercase tracking-widest border-b border-[#5c5c5c] pb-1">Ethical</span>
        <span className="text-[10px] uppercase tracking-widest border-b border-[#5c5c5c] pb-1">Timeless</span>
      </div>
    </header>

    <div className="max-w-6xl mx-auto px-6 py-12 space-y-24">
      {products.map((p, idx) => (
        <div 
          key={p.id} 
          className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 group cursor-pointer`}
          onClick={() => onProductClick(p)}
        >
          <div className="flex-1 aspect-square bg-[#f5f0eb] rounded-[3rem] overflow-hidden flex items-center justify-center text-9xl group-hover:scale-[1.02] transition-transform duration-1000">
            {p.image}
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl font-light text-[#2d2d2d]">{p.name}</h3>
            <p className="text-lg opacity-70 leading-relaxed font-light">{p.desc}</p>
            <div className="flex items-center space-x-8">
              <span className="text-2xl font-medium">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="bg-[#2d2d2d] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CateringBistro = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-white text-zinc-900 font-sans">
    <header className="py-16 px-6 text-center space-y-4">
      <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-white text-2xl">🍴</div>
      <h1 className="text-4xl font-black tracking-tight">{company}</h1>
      <p className="text-zinc-500 max-w-xl mx-auto font-medium">{headline}</p>
    </header>

    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 flex flex-col group cursor-pointer"
          onClick={() => onProductClick(p)}
        >
          <div className="h-64 flex items-center justify-center text-8xl bg-white group-hover:scale-110 transition-transform duration-500">
            {p.image}
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl">{p.name}</h3>
                <span className="text-xs text-orange-500 font-bold uppercase">{p.category}</span>
              </div>
              <span className="text-xl font-black">¥{p.price}</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{p.desc}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
            >
              Order Now
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RetailEditorial = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#111] text-white font-serif">
    <header className="h-[80vh] flex flex-col items-center justify-center text-center px-6 border-b border-zinc-800">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter">{company}</h1>
        <p className="text-zinc-400 text-2xl italic font-light max-w-3xl mx-auto">{headline}</p>
      </motion.div>
    </header>

    <div className="max-w-7xl mx-auto px-6 py-24 space-y-48">
      {products.map((p, idx) => (
        <div 
          key={p.id} 
          className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-24 cursor-pointer`}
          onClick={() => onProductClick(p)}
        >
          <div className="flex-1 aspect-[4/5] bg-zinc-900 flex items-center justify-center text-[15rem] relative">
            <span className="absolute top-8 left-8 text-6xl font-black opacity-10">0{idx + 1}</span>
            {p.image}
          </div>
          <div className="flex-1 space-y-8">
            <span className="text-zinc-500 uppercase tracking-[0.3em] text-sm">Selected Object</span>
            <h3 className="text-5xl font-bold leading-tight">{p.name}</h3>
            <p className="text-zinc-400 text-xl leading-loose font-light italic">{p.desc}</p>
            <div className="flex items-center justify-between pt-8 border-t border-zinc-800">
              <span className="text-4xl font-bold">¥{p.price}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="bg-white text-black px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Acquire
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const BeautyGlamour = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-black text-white font-sans">
    <header className="py-24 px-6 text-center space-y-4 border-b border-zinc-800">
      <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500">
        {company}
      </h1>
      <p className="text-zinc-400 text-lg uppercase tracking-[0.4em]">{headline}</p>
    </header>

    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="bg-black p-12 flex flex-col justify-between hover:bg-zinc-900 transition-colors cursor-pointer"
          onClick={() => onProductClick(p)}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {p.image}
            </div>
            <span className="text-3xl font-black italic opacity-20">¥{p.price}</span>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold uppercase italic tracking-tighter">{p.name}</h3>
            <p className="text-zinc-500 leading-relaxed">{p.desc}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black uppercase italic tracking-widest hover:scale-[1.02] transition-transform"
            >
              Book Experience
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const FitnessYoga = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#f0f4f8] text-[#2d3748] font-sans">
    <header className="py-20 px-6 text-center space-y-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
        🧘‍♀️
      </motion.div>
      <h1 className="text-4xl md:text-6xl font-light tracking-tight">{company}</h1>
      <p className="text-[#718096] max-w-2xl mx-auto italic">{headline}</p>
    </header>

    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 border border-white hover:bg-white transition-colors cursor-pointer"
          onClick={() => onProductClick(p)}
        >
          <div className="w-48 h-48 bg-[#e2e8f0] rounded-full flex items-center justify-center text-8xl shadow-inner">
            {p.image}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{p.name}</h3>
            <p className="text-[#718096] text-sm leading-relaxed">{p.desc}</p>
          </div>
          <div className="flex flex-col items-center space-y-4 w-full">
            <span className="text-3xl font-light">¥{p.price}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="w-full py-4 bg-[#2d3748] text-white rounded-2xl font-bold hover:bg-black transition-colors"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const JewelryModern = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-white text-black font-sans">
    <header className="h-[50vh] flex flex-col items-center justify-center border-b border-zinc-100">
      <h1 className="text-4xl font-light tracking-[0.5em] uppercase">{company}</h1>
      <div className="h-px w-32 bg-black my-8" />
      <p className="text-zinc-400 text-xs tracking-widest uppercase">{headline}</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="aspect-square border-r border-b border-zinc-100 p-12 flex flex-col justify-between group cursor-pointer hover:bg-zinc-50 transition-colors"
          onClick={() => onProductClick(p)}
        >
          <div className="flex-1 flex items-center justify-center text-9xl group-hover:scale-110 transition-transform duration-700">
            {p.image}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold tracking-widest uppercase">{p.name}</h3>
              <span className="text-xs font-light">¥{p.price}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="w-full py-3 border border-black text-[10px] tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all"
            >
              View Piece
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HomeUrban = ({ company, headline, products, onAddToCart, onProductClick }: TemplateProps) => (
  <div className="bg-[#1a1a1a] text-[#e0e0e0] font-sans">
    <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">{company}</h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">{headline}</p>
        <div className="flex space-x-4">
          <button className="bg-white text-black px-8 py-3 rounded-full font-bold">New Arrival</button>
          <button className="border border-zinc-700 px-8 py-3 rounded-full font-bold">Lookbook</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map((p, idx) => (
          <div 
            key={p.id} 
            className={`p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between aspect-square cursor-pointer hover:border-zinc-600 transition-colors ${idx === 1 ? 'mt-12' : ''}`}
            onClick={() => onProductClick(p)}
          >
            <div className="text-6xl">{p.image}</div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">¥{p.price}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- TEMPLATE MAPPER ---

export const INDUSTRY_TEMPLATES: Record<string, {
  templates: { id: string; name: string; component: React.FC<TemplateProps> }[]
}> = {
  fashion: {
    templates: [
      { id: 'fashion_luxe', name: 'Vogue Luxe', component: FashionLuxe },
      { id: 'fashion_street', name: 'Street Trend', component: FashionStreet },
      { id: 'fashion_eco', name: 'Eco Minimal', component: FashionEco },
    ]
  },
  catering: {
    templates: [
      { id: 'catering_dark', name: 'Michelin Dark', component: CateringDark },
      { id: 'catering_bistro', name: 'Insta-Bistro', component: CateringBistro },
      { id: 'catering_editorial', name: 'Editorial Story', component: RetailEditorial }, // Reusing editorial for catering story
    ]
  },
  retail: {
    templates: [
      { id: 'retail_clean', name: 'Global Market', component: RetailClean },
      { id: 'retail_editorial', name: 'Editorial Curated', component: RetailEditorial },
      { id: 'retail_street', name: 'Street Drop', component: FashionStreet }, // Reusing street trend for retail
    ]
  },
  beauty: {
    templates: [
      { id: 'beauty_zen', name: 'Zen Spa', component: BeautyZen },
      { id: 'beauty_glamour', name: 'Glamour Studio', component: BeautyGlamour },
      { id: 'beauty_luxe', name: 'Luxury Clinic', component: FashionLuxe }, // Reusing Luxe for clinic
    ]
  },
  fitness: {
    templates: [
      { id: 'fitness_iron', name: 'Iron Core', component: FitnessIron },
      { id: 'fitness_yoga', name: 'Flow Yoga', component: FitnessYoga },
      { id: 'fitness_clean', name: 'Tech Wellness', component: RetailClean }, // Reusing clean for tech fitness
    ]
  },
  jewelry: {
    templates: [
      { id: 'jewelry_royal', name: 'Royal Heritage', component: JewelryRoyal },
      { id: 'jewelry_modern', name: 'Modern Carat', component: JewelryModern },
      { id: 'jewelry_editorial', name: 'Editorial Showcase', component: RetailEditorial }, // Reusing editorial for jewelry
    ]
  },
  home: {
    templates: [
      { id: 'home_nordic', name: 'Nordic Loft', component: HomeNordic },
      { id: 'home_urban', name: 'Urban Chic', component: HomeUrban },
      { id: 'home_luxe', name: 'Modern Estate', component: FashionLuxe }, // Reusing Luxe for high-end home
    ]
  }
};
