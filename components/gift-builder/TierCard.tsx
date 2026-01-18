'use client';

import { useRouter } from 'next/navigation';
import { GiftTier } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface TierCardProps {
  tier: GiftTier;
}

export default function TierCard({ tier }: TierCardProps) {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/build/${tier.slug}`);
  };

  const badgeVariant = tier.id as 'bronze' | 'silver' | 'gold' | 'platinum';

  return (
    <Card className="text-center h-full flex flex-col hover-lift group relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-brown/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <Badge variant={badgeVariant} className="mb-3 sm:mb-4 animate-scale-in">
          {tier.name}
        </Badge>
        <h3 className="text-xl sm:text-2xl font-bold text-primary-brown mb-2 font-display">
          ${tier.minSpend} - ${tier.maxSpend}
        </h3>
        <p className="text-sm sm:text-base text-charcoal/70 mb-4 sm:mb-6 min-h-[3rem] flex-grow">
          {tier.description}
        </p>
        <Button 
          onClick={handleSelect} 
          className="w-full text-sm sm:text-base py-2.5 sm:py-3 btn-primary"
        >
          Start Building
        </Button>
      </div>
    </Card>
  );
}
