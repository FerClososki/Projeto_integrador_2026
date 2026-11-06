import { CartItem } from '../types';

export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => {
    // Multiplica o preço do produto pela quantidade no carrinho
    return acc + (item.product.price * item.quantity);
  }, 0);
};

export const calculateShipping = (state: string, subtotal: number, freeShippingCoupon: boolean): number => {
  if (freeShippingCoupon && subtotal >= 100) return 0;
  if (state.toUpperCase() === 'PR') return 15.00;
  return 25.00;
};

export const calculatePixDiscount = (subtotal: number): number => {
  return subtotal * 0.10;
};