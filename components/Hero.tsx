import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section ref={ref} id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 z-0 origin-bottom"
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://i.ibb.co.com/23mnqPV7/photo-6294278073146347905-y.jpg" 
          alt="Ray Arein Cover" 
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
        >
          <img 
            src="https://i.ibb.co.com/9HjzYKDF/photo-6294278073146347906-y.jpg" 
            alt="Ray Arein Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-full shadow-2xl mb-8 mx-auto"
          />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-wide drop-shadow-lg"
        >
          Ray Arein
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-zinc-200 font-light tracking-widest uppercase mb-12"
        >
          Elegant Women's Fashion
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          onClick={scrollToCollection}
          className="group relative px-8 py-4 bg-white text-black text-sm tracking-[0.2em] uppercase overflow-hidden hover:text-white transition-colors duration-500"
        >
          <span className="relative z-10">View Collection</span>
          <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
