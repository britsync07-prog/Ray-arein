import { Product, FilterState, SortOption } from './types';

// Safe helpers so sorting never crashes even if price is a DB string
const toNumber = (price: any): number => {
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[৳,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
  return products.filter((product) => {
    const matchesStyle =
      filters.style.length === 0 ||
      filters.style.some(s => Array.isArray(product.style) && product.style.includes(s));

    const matchesFabrics =
      filters.fabrics.length === 0 ||
      filters.fabrics.some(f => Array.isArray(product.fabrics) && product.fabrics.includes(f));

    const matchesType =
      filters.type.length === 0 ||
      filters.type.includes(product.type || '');

    const matchesStitchType =
      filters.stitchType.length === 0 ||
      filters.stitchType.includes(product.stitchType || '');

    // AND logic across categories
    return matchesStyle && matchesFabrics && matchesType && matchesStitchType;
  });
};

export const sortProducts = (products: Product[], sortOption: SortOption): Product[] => {
  const sorted = [...products];
  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    case 'price-low':
      return sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
    case 'price-high':
      return sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
    default:
      return sorted;
  }
};
