import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';
import { AuthContext } from './AuthContext';
import { storageService } from '../services/storageService';

interface FavoritesContextData {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setFavorites([]); // Limpa os favoritos se não houver usuário
        return;
      }
      const key = `@ToyMania:favorites:${user.id}`;
      const stored = await storageService.getItem<Product[]>(key);
      if (stored) setFavorites(stored);
      else setFavorites([]);
    }
    loadFavorites();
  }, [user]);

  useEffect(() => {
    async function saveFavorites() {
      if (!user) return;
      const key = `@ToyMania:favorites:${user.id}`;
      await storageService.setItem(key, favorites);
    }
    saveFavorites();
  }, [favorites, user]);

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isFavorite = (productId: string) => favorites.some((p) => p.id === productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};