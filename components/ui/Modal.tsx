'use client';

import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-[#FFF8E7] rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 border-2 border-[#8B7355]/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2
            id="modal-title"
            className="text-xl sm:text-2xl font-bold text-[#E98D3D] font-[var(--font-playfair)]"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-[#E98D3D] hover:text-[#D67A2E] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="text-sm sm:text-base text-[#333333] mb-6 sm:mb-8">
          {children}
        </div>
        {showCloseButton && (
          <div className="flex justify-end">
            <Button onClick={onClose} className="min-w-[120px]">
              OK
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
