'use client';

import { useEffect } from 'react';

/**
 * Hook to dismiss keyboard when clicking outside input fields on mobile
 */
export function useKeyboardDismiss() {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't dismiss if clicking on an input, textarea, or select
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select')
      ) {
        return;
      }

      // Dismiss keyboard by blurring active element
      if (document.activeElement instanceof HTMLElement) {
        const activeElement = document.activeElement;
        // Only blur if it's an input field
        if (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT'
        ) {
          activeElement.blur();
        }
      }
    };

    // Use touchstart for mobile, click for desktop
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
}
