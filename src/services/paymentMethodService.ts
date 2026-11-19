import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPaymentMethod } from '../types';

const key = (userId: string) => `@ToyMania:demo-payment-methods:${userId}`;

export async function getSavedPaymentMethods(userId: string): Promise<SavedPaymentMethod[]> {
  const stored = await AsyncStorage.getItem(key(userId));
  return stored ? JSON.parse(stored) : [];
}

export async function addDemoPaymentMethod(
  userId: string,
  brand: SavedPaymentMethod['brand'],
): Promise<SavedPaymentMethod[]> {
  const methods = await getSavedPaymentMethods(userId);
  const lastFour = brand === 'Visa' ? '4242' : '4444';
  const method: SavedPaymentMethod = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    provider: 'demo', brand, lastFour, isDefault: methods.length === 0,
  };
  const next = [...methods, method];
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
  return next;
}

export async function setDefaultPaymentMethod(userId: string, id: string): Promise<SavedPaymentMethod[]> {
  const methods = await getSavedPaymentMethods(userId);
  if (!methods.some(method => method.id === id)) throw new Error('Cartão não encontrado.');
  const next = methods.map(method => ({ ...method, isDefault: method.id === id }));
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
  return next;
}

export async function removePaymentMethod(userId: string, id: string): Promise<SavedPaymentMethod[]> {
  const remaining = (await getSavedPaymentMethods(userId)).filter(method => method.id !== id);
  if (!remaining.some(method => method.isDefault) && remaining.length) remaining[0].isDefault = true;
  await AsyncStorage.setItem(key(userId), JSON.stringify(remaining));
  return remaining;
}
