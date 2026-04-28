// ── 19 UNIQUE Unsplash images — every URL is different, zero repeats ──
const MAPPING: Record<string, string> = {
  'Classic White Tee': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
  'Denim Jacket':      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
  'Slim Fit Chinos':   'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
  'Bomber Jacket':     'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
  'Oxford Shirt':      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
  'Wool Overcoat':     'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?q=80&w=800&auto=format&fit=crop',
  'Knitted Polo':      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop',
  'Tailored Trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
  'Henley Shirt':      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
  'Chelsea Boots':     'https://images.unsplash.com/photo-1638247025967-b4e38f7bf9c4?q=80&w=800&auto=format&fit=crop',
  'Trench Coat':       'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
  'Puffer Jacket':     'https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=800&auto=format&fit=crop',
  'Shearling Coat':    'https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=800&auto=format&fit=crop',
  'Navy Blazer':       'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
  'Linen Blazer':      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop',
  'Slip Dress':        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'Wrap Dress':        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
  'Linen Set':         'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
  'Knit Set':          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
};

export function getPremiumImage(product: any): string {
  if (!product) return MAPPING['Classic White Tee'];

  // Use the DB URL if it's already an Unsplash link
  if (product.imageUrl && product.imageUrl.includes('unsplash.com')) return product.imageUrl;

  // Fall back to name-based mapping
  if (MAPPING[product.name]) return MAPPING[product.name];

  // Last resort — use first available image
  return MAPPING['Classic White Tee'];
}
