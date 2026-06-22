export interface Category {
  slug: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  isNew?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'fashion',
    label: 'Fashion',
    emoji: '👗',
    color: '#F472B6',
    bgColor: 'rgba(244,114,182,0.1)',
    description: 'Designer clothing, streetwear, and luxury fashion pieces.',
  },
  {
    slug: 'sneakers',
    label: 'Sneakers',
    emoji: '👟',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.1)',
    description: 'Limited drops, collaborations, and rare sneaker finds.',
  },
  {
    slug: 'bags',
    label: 'Bags',
    emoji: '👜',
    color: '#F472B6',
    bgColor: 'rgba(244,114,182,0.1)',
    description: 'Designer handbags, totes, and luxury accessories.',
  },
  {
    slug: 'jewellery',
    label: 'Jewellery',
    emoji: '💎',
    color: '#7DD3FC',
    bgColor: 'rgba(125,211,252,0.1)',
    description: 'Fine jewellery, diamonds, gold, and luxury pieces.',
  },
  {
    slug: 'watches',
    label: 'Watches',
    emoji: '⌚',
    color: '#F9C846',
    bgColor: 'rgba(249,200,70,0.1)',
    description: 'Luxury and collector timepieces from top brands.',
  },
  {
    slug: 'tech',
    label: 'Tech',
    emoji: '📱',
    color: '#86EFAC',
    bgColor: 'rgba(134,239,172,0.1)',
    description: 'Premium gadgets, laptops, and cutting-edge electronics.',
  },
  {
    slug: 'art',
    label: 'Art',
    emoji: '🎨',
    color: '#FCA5A5',
    bgColor: 'rgba(252,165,165,0.1)',
    description: 'Original artworks, prints, and collectible pieces.',
  },
  {
    slug: 'wine-spirits',
    label: 'Wine & Spirits',
    emoji: '🍷',
    color: '#C084FC',
    bgColor: 'rgba(192,132,252,0.1)',
    description: 'Rare bottles, vintage collections, and luxury tipples.',
    isNew: true,
  },
  {
    slug: 'travel',
    label: 'Travel & Stays',
    emoji: '✈️',
    color: '#7DD3FC',
    bgColor: 'rgba(125,211,252,0.1)',
    description: 'Luxury hotel stays, experiences, and exclusive getaways.',
    isNew: true,
  },
  {
    slug: 'home',
    label: 'Home & Living',
    emoji: '🏠',
    color: '#86EFAC',
    bgColor: 'rgba(134,239,172,0.1)',
    description: 'Designer homewares, furniture, and luxury interiors.',
    isNew: true,
  },
  {
    slug: 'beauty',
    label: 'Beauty',
    emoji: '🌸',
    color: '#F472B6',
    bgColor: 'rgba(244,114,182,0.08)',
    description: 'Luxury skincare, fragrance, and beauty collections.',
    isNew: true,
  },
  {
    slug: 'collectibles',
    label: 'Collectibles',
    emoji: '🏆',
    color: '#F9C846',
    bgColor: 'rgba(249,200,70,0.1)',
    description: 'Rare memorabilia, limited editions, and signed pieces.',
    isNew: true,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}
