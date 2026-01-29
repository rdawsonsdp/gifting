'use client';

import { useKeyboardDismiss } from '@/hooks/useKeyboardDismiss';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Dismiss keyboard when clicking outside inputs on mobile
  useKeyboardDismiss();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
