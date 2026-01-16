export interface GiftTier {
  id: string;
  name: string;
  slug: string;
  minSpend: number;
  maxSpend: number;
  description: string;
  suggestedItems: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  availableForTiers: string[];
  inventory: number;
  variantId?: string; // Shopify variant ID
}

export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  giftMessage?: string;
  isValid: boolean;
  errors: string[];
}

export interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface SelectedProduct {
  product: Product;
  quantity: number;
}

export interface GiftState {
  selectedTier: GiftTier | null;
  selectedProducts: SelectedProduct[];
  recipients: Recipient[];
  buyerInfo: BuyerInfo | null;
  currentStep: 'tier' | 'build' | 'recipients' | 'review' | 'confirmation';
}

export type GiftAction =
  | { type: 'SELECT_TIER'; payload: GiftTier }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'SET_RECIPIENTS'; payload: Recipient[] }
  | { type: 'SET_BUYER_INFO'; payload: BuyerInfo }
  | { type: 'SET_STEP'; payload: GiftState['currentStep'] }
  | { type: 'RESET' };
