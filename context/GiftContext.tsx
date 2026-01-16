'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GiftState, GiftAction, GiftTier, Product, Recipient, BuyerInfo } from '@/lib/types';

const initialState: GiftState = {
  selectedTier: null,
  selectedProducts: [],
  recipients: [],
  buyerInfo: null,
  currentStep: 'tier',
};

function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case 'SELECT_TIER':
      return {
        ...state,
        selectedTier: action.payload,
        selectedProducts: [],
        currentStep: 'build',
      };

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

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'RESET':
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
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export function GiftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(giftReducer, initialState);

  const getCurrentTotal = () => {
    return state.selectedProducts.reduce(
      (total, sp) => total + sp.product.price * sp.quantity,
      0
    );
  };

  const canProceedToRecipients = () => {
    if (!state.selectedTier) return false;
    const total = getCurrentTotal();
    return total >= state.selectedTier.minSpend && total <= state.selectedTier.maxSpend;
  };

  return (
    <GiftContext.Provider value={{ state, dispatch, getCurrentTotal, canProceedToRecipients }}>
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
