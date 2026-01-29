'use client';

import { useRouter } from 'next/navigation';
import { GiftPackage } from '@/lib/packages';
import { useGift } from '@/context/GiftContext';
import Button from '@/components/ui/Button';

interface PackageCardProps {
  package: GiftPackage & { tier?: string | null; variantId?: string };
  image?: string;
}

const tierConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  bronze: {
    label: 'Bronze',
    bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
    text: 'text-white',
    border: 'border-amber-500',
  },
  silver: {
    label: 'Silver',
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    text: 'text-gray-900',
    border: 'border-gray-400',
  },
  gold: {
    label: 'Gold',
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    text: 'text-amber-900',
    border: 'border-yellow-400',
  },
};

export default function PackageCard({ package: pkg, image }: PackageCardProps) {
  const router = useRouter();
  const { state, dispatch, setCartOpen } = useGift();

  const handleViewDetails = () => {
    router.push(`/package/${pkg.slug}`);
  };

  const handleAddToGift = () => {
    dispatch({
      type: 'SELECT_PACKAGE',
      payload: {
        package: {
          id: pkg.id,
          name: pkg.name,
          slug: pkg.slug,
          description: pkg.description || '',
          longDescription: pkg.longDescription || '',
          price: pkg.price,
          image: pkg.image || '',
          includes: pkg.includes || [],
          variantId: (pkg as any).variantId,
        },
        quantity: state.plannedRecipientCount,
      },
    });
    setCartOpen(true);
  };

  const displayImage = image || pkg.image;
  const tier = (pkg as any).tier as string | null;

  return (
    <div className="relative group">
      {/* Gilded border effect */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"></div>

      {/* Shimmer overlay */}
      <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      </div>

      {/* Main card */}
      <div className="relative glass-card rounded-2xl overflow-hidden h-full flex flex-col border-2 border-amber-400/50 group-hover:border-amber-500/70 transition-all duration-300">
        {/* Sparkle particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
          <div className="sparkle sparkle-4"></div>
          <div className="sparkle sparkle-5"></div>
          <div className="sparkle sparkle-6"></div>
        </div>

        {/* Package Image - Clickable */}
        <div
          className="aspect-square bg-gradient-to-br from-cream to-lavender/30 overflow-hidden relative cursor-pointer"
          onClick={handleViewDetails}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={pkg.name}
              className="w-full h-full object-cover img-zoom"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-light-brown/50">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
          )}

          {/* Tier Badge - Upper Right Corner */}
          {tier && tierConfig[tier] && (
            <div className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full shadow-lg ${tierConfig[tier].bg} ${tierConfig[tier].text} border ${tierConfig[tier].border}`}>
              <span className="text-xs font-bold uppercase tracking-wide">{tierConfig[tier].label}</span>
            </div>
          )}

          {/* Click for details indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2.5 shadow-lg">
              <svg className="w-6 h-6 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          {/* Golden overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-amber-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          {/* Corner gilded accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl pointer-events-none"></div>
        </div>

        {/* Package Info */}
        <div className="p-4 sm:p-6 flex flex-col flex-grow relative z-10">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-amber-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-primary-brown mb-2 font-display">
              {pkg.name}
            </h3>
            {pkg.price > 0 && (
              <p className="text-2xl font-bold text-primary-brown mb-3">
                ${pkg.price.toFixed(2)}
              </p>
            )}
            {pkg.description && (
              <p className="text-sm text-charcoal/70 mb-4 line-clamp-3 flex-grow">
                {pkg.description}
              </p>
            )}
            <div className="mt-auto">
              <Button
                onClick={handleAddToGift}
                className="w-full text-sm sm:text-base py-2.5 sm:py-3 btn-primary"
              >
                Add to Gift
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #ffd700 0%, transparent 70%);
          border-radius: 50%;
          animation: sparkle-float 3s ease-in-out infinite;
          opacity: 0;
        }

        .group:hover .sparkle {
          opacity: 1;
        }

        .sparkle-1 { top: 10%; left: 15%; animation-delay: 0s; }
        .sparkle-2 { top: 20%; right: 20%; animation-delay: 0.5s; }
        .sparkle-3 { top: 40%; left: 10%; animation-delay: 1s; }
        .sparkle-4 { top: 60%; right: 15%; animation-delay: 1.5s; }
        .sparkle-5 { top: 80%; left: 25%; animation-delay: 2s; }
        .sparkle-6 { top: 30%; right: 10%; animation-delay: 2.5s; }

        @keyframes sparkle-float {
          0%, 100% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          50% {
            transform: scale(1) translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
