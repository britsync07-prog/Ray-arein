import { Product, FilterState, SortOption } from './types';

// Parse a field that may be a JS array OR a JSON-encoded string from the DB
// e.g. ["Chiffon"] or '["Chiffon"]' or "Chiffon" — all handled
const toArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { /* fall through */ }
  }
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
};

// Parse price safely — strip currency symbols and commas
const toNumber = (price: any): number => {
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[৳,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
  return products.filter((product) => {
    const productStyle    = toArray(product.style);
    const productFabrics  = toArray(product.fabrics);
    const productType     = String(product.type || '').trim();
    const productStitch   = String(product.stitchType || '').trim();

    const matchesStyle =
      filters.style.length === 0 ||
      filters.style.some(s => productStyle.includes(s));

    const matchesFabrics =
      filters.fabrics.length === 0 ||
      filters.fabrics.some(f => productFabrics.includes(f));

    const matchesType =
      filters.type.length === 0 ||
      filters.type.includes(productType);

    const matchesStitchType =
      filters.stitchType.length === 0 ||
      filters.stitchType.includes(productStitch);

    // AND logic across categories, OR within each category
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
