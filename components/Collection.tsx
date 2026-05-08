import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter as FilterIcon } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { Product, FilterState, SortOption } from '../types';
import { filterProducts, sortProducts } from '../filterUtils';
import FilterSidebar from './Filter/FilterSidebar';
import ActiveFilterTags from './Filter/ActiveFilterTags';
import SortDropdown from './Filter/SortDropdown';
import MobileFilterDrawer from './Filter/MobileFilterDrawer';

// Safe helpers — never crash even if DB returns price as string or fabrics as null
const formatPrice = (price: any): string => {
  if (typeof price === 'string' && price.includes('৳')) return price;
  const num = Number(price);
  return isNaN(num) ? String(price) : `৳${num.toLocaleString()}`;
};

const formatFabrics = (fabrics: any): string => {
  if (Array.isArray(fabrics) && fabrics.length > 0) return fabrics.join(', ');
  if (typeof fabrics === 'string' && fabrics) return fabrics;
  return '';
};

const Collection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    style: [],
    fabrics: [],
    type: [],
    stitchType: [],
  });
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : MOCK_PRODUCTS);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local mock data if API unavailable
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, sortOption);
  }, [products, filters, sortOption]);

  const navigateToProduct = (id: string) => {
    window.history.pushState({}, '', `/product/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleRemoveFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value),
    }));
  };

  const clearAllFilters = () => {
    setFilters({ style: [], fabrics: [], type: [], stitchType: [] });
  };

  if (loading) {
    return (
      <section id="collection" className="py-24 px-4 text-center">
        <div className="animate-pulse font-serif text-xl text-zinc-300">Loading Collection...</div>
      </section>
    );
  }

  return (
    <section id="collection" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-serif mb-4">Latest Collection</h2>
        <div className="w-16 h-[1px] bg-zinc-300 mx-auto mb-4"></div>
        <p className="text-zinc-500 max-w-lg mx-auto text-sm tracking-wide">
          Explore our curated selection of luxury Pakistani fashion, featuring traditional styles and contemporary designs.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-zinc-200 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                <FilterIcon size={16} />
                Filters
              </button>
              <div className="text-sm text-zinc-500 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </div>
            </div>
            <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
          </div>

          {/* Active Filter Tags */}
          <ActiveFilterTags
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={clearAllFilters}
          />

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => navigateToProduct(product.id)}
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
                    <div className="space-y-2 px-1">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-serif text-lg text-zinc-900 leading-tight">{product.name}</h3>
                        <p className="text-zinc-900 font-medium whitespace-nowrap">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <p className="text-zinc-500 text-xs tracking-wider uppercase">
                        {formatFabrics(product.fabrics)}{product.type ? ` • ${product.type}` : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 mb-6">
                <FilterIcon size={24} className="text-zinc-300" />
              </div>
              <h3 className="text-xl font-serif mb-2">No products found</h3>
              <p className="text-zinc-500 text-sm mb-8">Try adjusting your filters to find what you're looking for.</p>
              <button
                onClick={clearAllFilters}
                className="px-8 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </section>
  );
};

export default Collection;
