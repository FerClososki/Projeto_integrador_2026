import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order } from '../types';
import { AuthContext } from './AuthContext';
import { storageService } from '../services/storageService';

interface OrderContextData {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const OrderContext = createContext<OrderContextData>({} as OrderContextData);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setOrders([]);
        return;
      }
      const key = `@ToyMania:orders:${user.id}`;
      const stored = await storageService.getItem<Order[]>(key);
      if (stored) setOrders(stored);
      else setOrders([]);
    }
    loadOrders();
  }, [user]);

  const addOrder = (order: Order) => {
    if (!user) return;
    const updated = [order, ...orders];
    setOrders(updated);
    const key = `@ToyMania:orders:${user.id}`;
    storageService.setItem(key, updated);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};