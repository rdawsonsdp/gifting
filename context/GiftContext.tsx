'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { GiftState, GiftAction, GiftTier, Product, Recipient, BuyerInfo, DeliveryMethod } from '@/lib/types';

const STORAGE_KEY = 'gift-state';

const initialState: GiftState = {
  selectedTier: null,
  selectedProducts: [],
  selectedPackage: null,
  recipients: [],
  buyerInfo: null,
  deliveryMethod: null,
  currentStep: 'tier',
  plannedRecipientCount: 1,
  appliedDiscount: null,
};

function loadState(): GiftState {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return initialState;
}

function saveState(state: GiftState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case 'SELECT_TIER': {
      const sameTier = state.selectedTier?.id === action.payload.id;
      return {
        ...state,
        selectedTier: action.payload,
        selectedProducts: sameTier ? state.selectedProducts : [],
        currentStep: 'build',
      };
    }

    case 'ADD_PRODUCT': {
      const existingIndex = state.selectedProducts.findIndex(
        (sp) => sp.product.id === action.payload.id
      );

      if (existingIndex >= 0) {
        const updated = [...state.selectedProducts];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return { ...state, selectedProducts: updated };
      }

      return {
        ...state,
        selectedProducts: [...state.selectedProducts, { product: action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_PRODUCT': {
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(
          (sp) => sp.product.id !== action.payload
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const updated = state.selectedProducts.map((sp) => {
        if (sp.product.id === action.payload.productId) {
          return { ...sp, quantity: Math.max(0, action.payload.quantity) };
        }
        return sp;
      }).filter((sp) => sp.quantity > 0);

      return { ...state, selectedProducts: updated };
    }

    case 'SELECT_PACKAGE':
      return {
        ...state,
        selectedPackage: {
          ...action.payload.package,
          quantity: action.payload.quantity,
        },
        selectedTier: null,
        selectedProducts: [],
        currentStep: 'package',
      };

    case 'SET_RECIPIENTS':
      return {
        ...state,
        recipients: action.payload,
        currentStep: 'recipients',
      };

    case 'SET_BUYER_INFO':
      return {
        ...state,
        buyerInfo: action.payload,
        currentStep: 'review',
      };

    case 'SET_DELIVERY_METHOD':
      return {
        ...state,
        deliveryMethod: action.payload,
      };

    case 'SET_RECIPIENT_COUNT':
      return {
        ...state,
        plannedRecipientCount: Math.max(1, action.payload),
      };

    case 'SET_DISCOUNT':
      return {
        ...state,
        appliedDiscount: action.payload,
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'HYDRATE':
      return action.payload;

    case 'CLEAR_CART':
      return {
        ...state,
        selectedProducts: [],
        selectedPackage: null,
        currentStep: 'tier',
        plannedRecipientCount: 1,
        appliedDiscount: null,
      };

    case 'RESET':
      saveState(initialState);
      return initialState;

    default:
      return state;
  }
}

interface GiftContextType {
  state: GiftState;
  dispatch: React.Dispatch<GiftAction>;
  getCurrentTotal: () => number;
  canProceedToRecipients: () => boolean;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export function GiftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(giftReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  // Hydrate state from sessionStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved && (saved.selectedProducts.length > 0 || saved.selectedPackage || saved.recipients.length > 0)) {
      dispatch({ type: 'HYDRATE', payload: saved });
    }
    setHydrated(true);
  }, []);

  // Persist state to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveState(state);
    }
  }, [state, hydrated]);

  const getCurrentTotal = () => {
    return state.selectedProducts.reduce(
      (total, sp) => total + sp.product.price * sp.quantity,
      0
    );
  };

  const canProceedToRecipients = () => {
    // If a package is selected, can always proceed
    if (state.selectedPackage) return true;

    // For promotional path (no tier), just need products
    if (!state.selectedTier) return state.selectedProducts.length > 0;

    // For custom builds, check minimum spend only (no max limit)
    const total = getCurrentTotal();
    return total >= state.selectedTier.minSpend;
  };

  return (
    <GiftContext.Provider value={{ state, dispatch, getCurrentTotal, canProceedToRecipients, isCartOpen, setCartOpen }}>
      {children}
    </GiftContext.Provider>
  );
}

export function useGift() {
  const context = useContext(GiftContext);
  if (context === undefined) {
    throw new Error('useGift must be used within a GiftProvider');
  }
  return context;
}
