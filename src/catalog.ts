export type Category = 'All' | 'Blush' | 'Lip' | 'Moisturizer' | 'Serum' | 'Cleanser';
export type IngredientOrigin = 'natural' | 'synthetic' | 'unspecified';
export const ingredientOriginLabels: Record<IngredientOrigin, string> = {
  natural: 'Natural', synthetic: 'Synthetic', unspecified: 'Not specified',
};
export type Ingredient = { name: string; note: string; origin: IngredientOrigin; korean?: string };
export type Product = {
  id: string;
  name: string;
  subtitle: string;
  brand: string;
  category: Exclude<Category, 'All'>;
  size: string;
  shade?: string;
  image: string;
  tone: string;
  description: string;
  texture: string;
  finish: string;
  focus: string;
  use: string;
  ingredients: Ingredient[];
  talkingPoint: string;
  source: string;
};

export const categoryLabels: Record<Category, string> = {
  All: 'All products', Blush: 'Blush', Lip: 'Lips',
  Moisturizer: 'Moisturizers', Serum: 'Serums', Cleanser: 'Cleansers',
};
export const categories: Category[] = ['All', 'Blush', 'Lip', 'Moisturizer', 'Serum', 'Cleanser'];
export const products: Product[] = [
  {
    id: 'rare-blush', name: 'Soft Pinch Liquid Blush', subtitle: 'Hope · Nude mauve',
    brand: 'Rare Beauty', category: 'Blush', size: '7.5 ml', shade: 'Hope · Nude mauve', tone: 'rose',
    image: '/images/rare-blush.jpg',
    description: 'A liquid blush with concentrated color. Hope has a dewy finish.',
    texture: 'Liquid', finish: 'Dewy', focus: 'Buildable cheek color',
    use: 'Dot a small amount onto cheeks and blend with fingertips or a brush. Add more as needed.',
    ingredients: [
      { name: 'Lotus extract', origin: 'natural', note: 'Part of the soothing botanical blend.' },
      { name: 'Gardenia extract', origin: 'natural', note: 'Part of the soothing botanical blend.' },
      { name: 'White water lily extract', origin: 'natural', note: 'Part of the soothing botanical blend.' },
    ],
    talkingPoint: 'Choose this for concentrated liquid color. Start with a small dot and build up.',
    source: 'https://www.rarebeauty.com/products/soft-pinch-liquid-blush?variant=43734829695111',
  },
  {
    id: 'rhode-blush', name: 'Pocket Blush', subtitle: 'Piggy · Baby pink',
    brand: 'Rhode', category: 'Blush', size: '5.3 g', shade: 'Piggy · Baby pink', tone: 'rose',
    image: '/images/rhode-blush.png',
    description: 'A cream blush stick for cheeks and lips, with color that builds in layers.',
    texture: 'Cream stick', finish: 'Satin', focus: 'Cheek & lip color',
    use: 'Tap onto cheeks with fingers or a brush. Apply to lips for matching color. Avoid the eye area.',
    ingredients: [
      { name: 'Peptides', origin: 'synthetic', note: 'Palmitoyl tripeptide-1 and palmitoyl tripeptide-5.' },
      { name: 'Tamanu oil', origin: 'natural', note: 'Listed as Calophyllum inophyllum seed oil.' },
      { name: 'Glycerin', origin: 'unspecified', note: 'Helps retain moisture.' },
    ],
    talkingPoint: 'Choose this for one cream stick to use on both cheeks and lips.',
    source: 'https://www.rhodeskin.com/products/pocket-blush-piggy',
  },
  {
    id: 'fenty-blush', name: 'Cheeks Out Freestyle Cream Blush', subtitle: 'Petal Poppin',
    brand: 'Fenty Beauty', category: 'Blush', size: '3 g', shade: 'Petal Poppin', tone: 'rose',
    image: '/images/fenty-blush.jpg',
    description: 'A cream blush in a compact, with sheer color that can be built up.',
    texture: 'Cream', finish: 'Sheer, natural', focus: 'Buildable cheek color',
    use: 'Tap onto cheeks with fingertips or a brush, then layer to increase the color.',
    ingredients: [
      { name: 'Vitamin E', origin: 'unspecified', note: 'Listed as tocopheryl acetate.' },
      { name: 'Mica', origin: 'natural', note: 'A mineral pigment used in the formula.' },
      { name: 'Candelilla wax', origin: 'natural', note: 'Helps give the cream its structure.' },
    ],
    talkingPoint: 'Choose this for a sheer wash of color from a cream compact; add layers for more color.',
    source: 'https://fentybeauty.com/products/cheeks-out-freestyle-cream-blush-petal-poppin',
  },
  {
    id: 'rare-lip-oil', name: 'Soft Pinch Tinted Lip Oil', subtitle: 'Hope · Nude mauve',
    brand: 'Rare Beauty', category: 'Lip', size: '3 ml', shade: 'Hope · Nude mauve', tone: 'rose',
    image: '/images/rare-lip-oil.jpg',
    description: 'A lip gel that becomes an oil, leaving a tint as the initial gloss wears down.',
    texture: 'Gel-to-oil', finish: 'Glossy, then tinted', focus: 'Lip color & moisture',
    use: 'Swipe onto lips with the applicator. Add another layer for more color.',
    ingredients: [
      { name: 'Jojoba seed oil', origin: 'natural', note: 'Helps soften lips and retain moisture.' },
      { name: 'Sunflower seed oil', origin: 'natural', note: 'Helps condition lips.' },
    ],
    talkingPoint: 'Choose this when the customer wants lip color that leaves a tint after the shine fades.',
    source: 'https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil?variant=43734835069063',
  },
  {
    id: 'rhode-lip', name: 'Peptide Lip Treatment', subtitle: 'Unscented',
    brand: 'Rhode', category: 'Lip', size: '10 ml', shade: 'Clear', tone: 'cream',
    image: '/images/rhode-lip.png',
    description: 'An unscented lip treatment for moisture and a clear gloss finish.',
    texture: 'Thick balm', finish: 'Clear gloss', focus: 'Lip moisture',
    use: 'Apply directly to lips and reapply when needed.',
    ingredients: [
      { name: 'Shea butter', origin: 'natural', note: 'Helps soften lips and retain moisture.' },
      { name: 'Peptide', origin: 'synthetic', note: 'Listed as palmitoyl tripeptide-1.' },
      { name: 'Vitamin E', origin: 'unspecified', note: 'Helps condition lips.' },
    ],
    talkingPoint: 'Choose this for unscented lip care with clear shine and no added color.',
    source: 'https://www.rhodeskin.com/products/peptide-lip-treatment',
  },
  {
    id: 'fenty-gloss', name: 'Gloss Bomb Universal Lip Luminizer', subtitle: 'Fenty Glow',
    brand: 'Fenty Beauty', category: 'Lip', size: '9 ml', shade: 'Fenty Glow', tone: 'honey',
    image: '/images/fenty-gloss.jpg',
    description: 'A sheer lip gloss with shimmer, shine and a peach-vanilla scent.',
    texture: 'Gloss', finish: 'Sheer shimmer', focus: 'Lip shine & moisture',
    use: 'Wear on its own or apply over lipstick.',
    ingredients: [
      { name: 'Shea butter', origin: 'natural', note: 'Helps soften lips and retain moisture.' },
      { name: 'Vitamin E', origin: 'unspecified', note: 'Helps condition lips.' },
      { name: 'Peptide', origin: 'synthetic', note: 'Listed as palmitoyl tripeptide-1.' },
    ],
    talkingPoint: 'Choose this for shimmer and shine, either on bare lips or over lipstick.',
    source: 'https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow',
  },
  {
    id: 'dynasty-cream', name: 'Dynasty Cream', subtitle: 'Rice & ginseng',
    brand: 'Beauty of Joseon', category: 'Moisturizer', size: '50 ml', tone: 'cream',
    image: '/images/dynasty-cream.webp',
    description: 'A nourishing daily cream for lasting moisture and a soft, dewy finish.',
    texture: 'Rich cream', finish: 'Dewy', focus: 'Dryness & lasting moisture',
    use: 'Apply after serum, morning and evening. Follow with sunscreen in the daytime.',
    ingredients: [
      { name: 'Rice bran water', origin: 'natural', note: 'Helps replenish moisture.', korean: '쌀겨수' },
      { name: 'Ginseng root water', origin: 'natural', note: 'Supports the moisture barrier.', korean: '인삼수' },
      { name: 'Squalane', origin: 'unspecified', note: 'Adds softness and moisture.', korean: '스쿠알란' },
      { name: 'Niacinamide', origin: 'unspecified', note: 'Helps balance oil and moisture.', korean: '나이아신아마이드' },
    ],
    talkingPoint: 'For someone who wants a richer moisturizer and a dewy finish.',
    source: 'https://beautyofjoseon.com/products/dynasty-cream',
  },
  {
    id: 'glow-serum', name: 'Glow Serum', subtitle: 'Propolis & niacinamide',
    brand: 'Beauty of Joseon', category: 'Serum', size: '30 ml', tone: 'honey',
    image: '/images/glow-serum-propolis-niacinamide.webp',
    description: 'A cushiony serum that hydrates and helps refine the look of pores and uneven texture.',
    texture: 'Honey-like serum', finish: 'Glowy', focus: 'Uneven texture & excess oil',
    use: 'Pat 2–3 drops onto skin before moisturizer. Use sunscreen during the day.',
    ingredients: [
      { name: 'Propolis extract', origin: 'natural', note: 'Helps hydrate and soothe.', korean: '프로폴리스추출물' },
      { name: 'Niacinamide', origin: 'unspecified', note: 'Helps balance oil and moisture.', korean: '나이아신아마이드' },
      { name: 'Betaine salicylate', origin: 'unspecified', note: 'A BHA for gentle exfoliation.', korean: '베타인살리실레이트' },
    ],
    talkingPoint: 'A targeted serum step for texture and glow, before moisturizer.',
    source: 'https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide',
  },
  {
    id: 'red-bean-gel', name: 'Red Bean Water Gel', subtitle: 'Red bean & peptides',
    brand: 'Beauty of Joseon', category: 'Moisturizer', size: '100 ml', tone: 'rose',
    image: '/images/red-bean-water-gel.webp',
    description: 'A fresh, lightweight moisturizer for oily or combination skin that prefers a lighter feel.',
    texture: 'Light gel', finish: 'Fresh, non-greasy', focus: 'Oil balance & light hydration',
    use: 'Pat a small amount onto skin after serum. Follow with sunscreen in the daytime.',
    ingredients: [
      { name: 'Red bean extract', origin: 'natural', note: 'Helps manage excess sebum.', korean: '팥추출물' },
      { name: 'Peptide complex', origin: 'unspecified', note: 'Supports a smoother-looking finish.', korean: '펩타이드' },
    ],
    talkingPoint: 'For someone who wants moisture without the feel of a rich cream.',
    source: 'https://beautyofjoseon.com/products/red-bean-water-gel',
  },
  {
    id: 'green-plum-cleanser', name: 'Green Plum Cleanser', subtitle: 'Plum & mung bean',
    brand: 'Beauty of Joseon', category: 'Cleanser', size: '100 ml', tone: 'sage',
    image: '/images/green-plum-refreshing-cleanser.webp',
    description: 'A gentle, pH-balanced daily cleanser that leaves skin feeling refreshed and soft.',
    texture: 'Soft cleansing gel', finish: 'Rinses clean', focus: 'Daily cleansing',
    use: 'Massage onto wet skin, then rinse with lukewarm water. Use a separate makeup remover when needed.',
    ingredients: [
      { name: 'Plum water', origin: 'natural', note: 'Helps leave skin feeling hydrated.', korean: '매실수' },
      { name: 'Mung bean extract', origin: 'natural', note: 'Supports comfortable cleansing.', korean: '녹두추출물' },
    ],
    talkingPoint: 'An everyday cleansing step, rather than a makeup remover.',
    source: 'https://beautyofjoseon.com/products/green-plum-refreshing-cleanser',
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function searchProducts(query: string, category: Category = 'All'): Product[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const text = [p.name, p.subtitle, p.brand, p.category, p.focus, ...p.ingredients.flatMap(i => [i.name, i.korean])].join(' ').toLocaleLowerCase();
    return (category === 'All' || p.category === category) && terms.every(term => text.includes(term));
  });
}

export type SelectionResult = { ids: string[]; status: 'added' | 'removed' | 'full' | 'duplicate' | 'invalid' };
export function selectProduct(ids: string[], id: string, replaceIndex?: number): SelectionResult {
  if (!getProduct(id)) return { ids, status: 'invalid' };
  if (replaceIndex !== undefined) {
    if (replaceIndex < 0 || replaceIndex > 1 || !Number.isInteger(replaceIndex)) return { ids, status: 'invalid' };
    if (ids.some((selected, index) => selected === id && index !== replaceIndex)) return { ids, status: 'duplicate' };
    const next = [...ids]; next[Math.min(replaceIndex, next.length)] = id;
    return { ids: next, status: 'added' };
  }
  if (ids.includes(id)) return { ids: ids.filter(selected => selected !== id), status: 'removed' };
  if (ids.length >= 2) return { ids, status: 'full' };
  return { ids: [...ids, id], status: 'added' };
}

export function recommend(a: Product, b: Product): { text: string; notes: { name: string; text: string }[] } {
  return {
    text: a.category !== b.category ? 'These serve different purposes. Choose based on the step the customer needs.' : '',
    notes: [a, b].map(p => ({ name: p.name, text: p.talkingPoint })),
  };
}
