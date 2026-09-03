/**
 * Business Rule Distinction:
 * - PHYSICAL_PRODUCT: Physical stock items that track inventory quantities (e.g., Books, Stationery, Snacks, Accessories).
 * - SERVICE: Labor/machine student services that do NOT deduct from physical inventory stocks (e.g., Printing, Photocopy, Laminating, Binding).
 */
export const ITEM_TYPES = Object.freeze({
  PHYSICAL_PRODUCT: 'PHYSICAL_PRODUCT',
  SERVICE: 'SERVICE',
});

export const PRODUCT_CATEGORIES = Object.freeze([
  'Books',
  'Stationery',
  'Snacks & Chocolates',
  'Drinks',
  'Ice Cream',
  'USB & Mobile Accessories',
]);

export const SERVICE_CATEGORIES = Object.freeze([
  'Printing',
  'Photocopy',
  'Scanning',
  'Laminating',
  'Binding',
]);

export default {
  ITEM_TYPES,
  PRODUCT_CATEGORIES,
  SERVICE_CATEGORIES,
};
