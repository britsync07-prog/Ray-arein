import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductDetail = ({ id }: { id: string }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/collections?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setActiveImage(data.image);
        try {
            setImages(JSON.parse(data.images || "[]"));
        } catch(e) {
            setImages([data.image]);
        }
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-serif text-2xl text-zinc-300">Ray Arein</div>
    </div>
  );

  if (!product) return <div className="p-20 text-center">Product not found</div>;

  const priceStr = product.price.includes('৳') ? product.price : `৳${product.price}`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] bg-zinc-100 overflow-hidden relative group"
            >
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => {
                      const idx = images.indexOf(activeImage);
                      const nextIdx = (idx - 1 + images.length) % images.length;
                      setActiveImage(images[nextIdx]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      const idx = images.indexOf(activeImage);
                      const nextIdx = (idx + 1) % images.length;
                      setActiveImage(images[nextIdx]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </motion.div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 aspect-[3/4] bg-zinc-100 border-2 transition-colors ${activeImage === img ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 mb-8">
                <a href="/" className="hover:text-black">Home</a>
                <span>/</span>
                <span className="text-zinc-900">Collection</span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 mb-4">{product.name}</h1>
              <p className="text-2xl text-zinc-500 font-light mb-8">{priceStr}</p>
              
              <div className="w-full h-[1px] bg-zinc-100 mb-8"></div>
              
              <div className="space-y-6 mb-12">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-900">Description</h3>
                <p className="text-zinc-600 leading-relaxed font-light whitespace-pre-wrap">
                  {product.description || "No description provided for this elegant piece."}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button className="w-full bg-black text-white py-5 px-8 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors tracking-widest uppercase text-sm font-medium">
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
                <a 
                  href={`https://wa.me/message/YKD3NJM3DCCXF1?text=I'm interested in ${product.name} (${priceStr})`}
                  target="_blank"
                  className="w-full border border-zinc-200 text-black py-5 px-8 flex items-center justify-center gap-3 hover:border-black transition-colors tracking-widest uppercase text-sm font-medium"
                >
                  Order via WhatsApp
                </a>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-8 border-t border-zinc-100 pt-8">
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Delivery</h4>
                    <p className="text-xs text-zinc-400">Standard shipping 3-5 business days across Bangladesh.</p>
                </div>
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Details</h4>
                    <p className="text-xs text-zinc-400">Crafted with the finest fabrics for lasting elegance.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
