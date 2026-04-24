import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-4 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Get in Touch</h2>
          <p className="text-zinc-500 mb-12 font-light">
            We are here to assist you with inquiries, sizing, or styling advice.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="mailto:rayarein51@gmail.com"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-zinc-200 hover:border-black transition-colors duration-300 group"
            >
              <Mail size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
              <span className="font-medium text-sm tracking-wider">rayarein51@gmail.com</span>
            </a>
            
            <a 
              href="https://wa.me/message/YKD3NJM3DCCXF1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white hover:bg-zinc-800 transition-colors duration-300"
            >
              <Phone size={18} />
              <span className="font-medium text-sm tracking-wider">01805-111551</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
