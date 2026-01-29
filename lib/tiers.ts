import { GiftTier } from './types';

export const TIERS: GiftTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    slug: 'bronze',
    minSpend: 6,
    maxSpend: 25,
    description: 'Perfect for small appreciation gifts',
    suggestedItems: []
  },
  {
    id: 'silver',
    name: 'Silver',
    slug: 'silver',
    minSpend: 35,
    maxSpend: 50,
    description: 'Ideal for client thank-yous',
    suggestedItems: []
  },
  {
    id: 'gold',
    name: 'Gold',
    slug: 'gold',
    minSpend: 75,
    maxSpend: 100,
    description: 'Premium gifts that make an impression',
    suggestedItems: []
  },
  {
    id: 'platinum',
    name: 'Platinum',
    slug: 'platinum',
    minSpend: 150,
    maxSpend: 250,
    description: 'Luxury gift baskets for VIP clients',
    suggestedItems: []
  }
];

export function getTierBySlug(slug: string): GiftTier | undefined {
  return TIERS.find(tier => tier.slug === slug);
}
