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
    <Card className="text-center h-full flex flex-col">
      <Badge variant={badgeVariant} className="mb-3 sm:mb-4">
        {tier.name}
      </Badge>
      <h3 className="text-xl sm:text-2xl font-bold text-[#5D4037] mb-2 font-[var(--font-playfair)]">
        ${tier.minSpend} - ${tier.maxSpend}
      </h3>
      <p className="text-sm sm:text-base text-[#333333] mb-4 sm:mb-6 min-h-[3rem] flex-grow">
        {tier.description}
      </p>
      <Button onClick={handleSelect} className="w-full text-sm sm:text-base py-2.5 sm:py-3">
        Start Building
      </Button>
    </Card>
  );
}
