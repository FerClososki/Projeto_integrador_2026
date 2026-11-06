import React, { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { AuthContext } from './AuthContext';
import { storageService } from '../services/storageService';
import { calculateSubtotal, calculateShipping, calculatePixDiscount } from '../utils/pricing';

interface CartContextData {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  subtotal: number;
  shipping: number;
  pixDiscount: number;
  total: number;
}

export const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // Carrega o carrinho específico do usuário logado
  useEffect(() => {
    async function loadCart() {
      if (!user) {
        setItems([]); // Limpa o carrinho se ninguém estiver logado
        return;
      }
      const key = `@ToyMania:cart:${user.id}`;
      const storedCart = await storageService.getItem<CartItem[]>(key);
      if (storedCart) setItems(storedCart);
      else setItems([]);
    }
    loadCart();
  }, [user]);

  // Salva o carrinho sempre que ele mudar, mas apenas se houver usuário
  useEffect(() => {
    async function saveCart() {
      if (!user) return;
      const key = `@ToyMania:cart:${user.id}`;
      await storageService.setItem(key, items);
    }
    saveCart();
  }, [items, user]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    if (code.toUpperCase() === 'FRETEGRATIS') {
      setCoupon({ code: 'FRETEGRATIS', freeShipping: true, description: 'Frete Grátis' });
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = useMemo(() => calculateSubtotal(items), [items]);
  const shipping = useMemo(() => calculateShipping('SP', subtotal, !!coupon?.freeShipping), [subtotal, coupon]);
  const pixDiscount = useMemo(() => calculatePixDiscount(subtotal), [subtotal]);
  const total = subtotal + shipping - pixDiscount;

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, coupon, applyCoupon, removeCoupon, subtotal, shipping, pixDiscount, total }}
    >
      {children}
    </CartContext.Provider>
  );
};