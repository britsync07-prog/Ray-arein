import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const Collection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch collections", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
      return (
          <section className="py-32 text-center">
              <div className="animate-pulse font-serif text-xl text-zinc-400">Loading Collection...</div>
          </section>
      );
  }

  return (
    <section id="collection" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-serif mb-4">Latest Collection</h2>
        <div className="w-16 h-[1px] bg-zinc-300 mx-auto"></div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-6">
              <img 
                src={product.image} 
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-white tracking-widest uppercase text-sm border border-white px-6 py-3">
                  View
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <h3 className="font-serif text-lg text-zinc-900">{product.name}</h3>
              <p className="text-zinc-500 text-sm">{product.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Collection;
