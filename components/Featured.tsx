import React from 'react';
import { motion } from 'motion/react';

const features = [
  {
    id: 1,
    title: "The Spring Edit",
    description: "Embrace the new season with flowing silhouettes and light, breathable fabrics designed to move effortlessly with you. A curation of modern elegance.",
    image: "https://images.unsplash.com/photo-1550614000-4b95d4ebf1fb?auto=format&fit=crop&q=80&w=1200",
    align: "left"
  },
  {
    id: 2,
    title: "Evening Elegance",
    description: "Make a statement after dark. Our evening collection brings together dramatic cuts and rich textures for unforgettable moments.",
    image: "https://images.unsplash.com/photo-1560457099-64cb8a5eb50c?auto=format&fit=crop&q=80&w=1200",
    align: "right"
  }
];

const Featured = () => {
  return (
    <section id="featured" className="py-24 overflow-hidden">
      {features.map((feature, index) => (
        <div key={feature.id} className={`flex flex-col ${feature.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center mb-0 md:mb-32 last:mb-0`}>
          
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: feature.align === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:h-[80vh] relative"
          >
            <img 
              src={feature.image} 
              alt={feature.title} 
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Text Side */}
          <div className="w-full md:w-1/2 py-16 px-8 md:px-16 lg:px-24 flex flex-col justify-center bg-[#FAFAFA] md:h-[80vh]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">{feature.title}</h3>
              <p className="text-zinc-600 leading-relaxed mb-10 text-lg font-light">
                {feature.description}
              </p>
              <button className="group relative inline-flex items-center gap-4 text-sm tracking-widest uppercase pb-2">
                <span className="relative z-10 font-medium">Discover</span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-300">
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></div>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Featured;
