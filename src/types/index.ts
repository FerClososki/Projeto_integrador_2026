export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  ageRecommendation: string;
  material: string;
  pieces?: number;
  image: any; // <-- Mudou de string para any para aceitar imagens locais
  rating: number;
  reviewsCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface SavedPaymentMethod {
  id: string;
  provider: 'demo';
  brand: 'Visa' | 'Mastercard';
  lastFour: string;
  isDefault: boolean;
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  freeShipping?: boolean;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'pix' | 'credit' | 'debit';
  paymentMethodLabel?: string;
  status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered';
  address: Address;
}
