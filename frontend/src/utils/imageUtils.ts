const FALLBACKS: Record<string, string> = {
  'jacket':    'https://images.unsplash.com/photo-1544923246-77307dd270b3?auto=format&fit=crop&w=600&q=80',
  'outerwear': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80',
  'blazers':   'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  't-shirt':   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  'pants':     'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
  'footwear':  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  'dresses':   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  'sets':      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';

export function getPremiumImage(product: any): string {
  if (!product) return DEFAULT;

  // ✅ Trust the DB imageUrl as the primary source (set correctly by DbFixer on startup)
  if (product.imageUrl) return product.imageUrl;

  // Fallback by category only when imageUrl is missing
  const cat = (product.category || '').toLowerCase();
  return FALLBACKS[cat] ?? DEFAULT;
}
