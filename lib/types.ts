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
  compareAtPrice?: number; // Original price before discount
  slug?: string; // Shopify product handle
  shippingCost?: number; // Per-item shipping cost from Shopify
  weight?: number; // Product weight in grams
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
  phone?: string;
  email?: string;
  giftMessage?: string;
  isValid: boolean;
  errors: string[];
}

export interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  deliveryDate: string;
  notes?: string;
  notifyByText?: boolean;
}

export interface SelectedProduct {
  product: Product;
  quantity: number;
}

export interface SelectedPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  includes: string[];
  quantity: number;
  variantId?: string; // Shopify variant ID for creating orders
}

export interface DeliveryMethod {
  id: 'factory-pickup' | 'individual' | 'local-delivery' | 'heavy-order';
  name: string;
  price: number;
  estimatedDays?: string;
  shippingMethod?: 'ups-ground' | 'ups-2day' | 'local';
}

export interface GiftState {
  selectedTier: GiftTier | null;
  selectedProducts: SelectedProduct[];
  selectedPackage: SelectedPackage | null;
  recipients: Recipient[];
  buyerInfo: BuyerInfo | null;
  deliveryMethod: DeliveryMethod | null;
  currentStep: 'tier' | 'build' | 'package' | 'promotional' | 'recipients' | 'review' | 'confirmation';
  plannedRecipientCount: number;
  appliedDiscount: AppliedDiscount | null;
}

export interface AppliedDiscount {
  code: string;
  title: string;
  valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  discountAmount: number;
}

export type GiftAction =
  | { type: 'SELECT_TIER'; payload: GiftTier }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'SELECT_PACKAGE'; payload: { package: Omit<SelectedPackage, 'quantity'>; quantity: number } }
  | { type: 'SET_RECIPIENTS'; payload: Recipient[] }
  | { type: 'SET_BUYER_INFO'; payload: BuyerInfo }
  | { type: 'SET_DELIVERY_METHOD'; payload: DeliveryMethod }
  | { type: 'SET_STEP'; payload: GiftState['currentStep'] }
  | { type: 'SET_RECIPIENT_COUNT'; payload: number }
  | { type: 'SET_DISCOUNT'; payload: AppliedDiscount | null }
  | { type: 'HYDRATE'; payload: GiftState }
  | { type: 'CLEAR_CART' }
  | { type: 'RESET' };
