import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#E98D3D] mb-4 font-[var(--font-playfair)]">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[#E98D3D] mb-4">
          Page Not Found
        </h2>
        <p className="text-[#333333] mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button>
            Return Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
