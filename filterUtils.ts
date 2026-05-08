import { Product, FilterState, SortOption } from './types';

export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
  return products.filter((product) => {
    // Style filter (OR logic within category)
    const matchesStyle =
      filters.style.length === 0 ||
      filters.style.some((s) => product.style?.includes(s));

    // Fabrics filter (OR logic within category)
    const matchesFabrics =
      filters.fabrics.length === 0 ||
      filters.fabrics.some((f) => product.fabrics?.includes(f));

    // Type filter (OR logic within category)
    const matchesType =
      filters.type.length === 0 ||
      filters.type.includes(product.type || '');

    // Stitch Type filter (OR logic within category)
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
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
};
