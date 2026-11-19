import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../types';

export interface SavedAddress extends Address {
  id: string;
  label: string;
  isDefault: boolean;
}

export const emptyAddress: Address = {
  zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
};

export function isValidAddress(address: Address) {
  return /^\d{8}$/.test(address.zipCode.replace(/\D/g, ''))
    && !!address.street.trim() && !!address.number.trim()
    && !!address.neighborhood.trim() && !!address.city.trim()
    && /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(address.state);
}

const key = (userId: string) => `@ToyMania:addresses:${userId}`;

export async function getSavedAddresses(userId: string): Promise<SavedAddress[]> {
  const stored = await AsyncStorage.getItem(key(userId));
  if (stored !== null) return JSON.parse(stored);
  const legacy = await AsyncStorage.getItem(`@ToyMania:address:${userId}`);
  if (!legacy) return [];
  const previous = JSON.parse(legacy);
  const migrated: SavedAddress[] = [{ ...emptyAddress, ...previous,
    zipCode: String(previous.zipCode || '').replace(/\D/g, ''),
    id: 'legacy', label: 'Casa', isDefault: true }];
  await AsyncStorage.setItem(key(userId), JSON.stringify(migrated));
  return migrated;
}

export async function saveAddress(userId: string, address: SavedAddress): Promise<SavedAddress[]> {
  if (!address.label.trim() || !isValidAddress(address)) throw new Error('Preencha o nome e todos os campos obrigatórios do endereço.');
  const list = await getSavedAddresses(userId);
  const saved = { ...address, label: address.label.trim(), zipCode: address.zipCode.replace(/\D/g, ''), isDefault: list.length === 0 || address.isDefault };
  const next = list.some(item => item.id === saved.id)
    ? list.map(item => item.id === saved.id ? saved : item) : [...list, saved];
  const defaultId = saved.isDefault ? saved.id : (next.find(item => item.isDefault)?.id ?? next[0].id);
  const normalized = next.map(item => ({ ...item, isDefault: item.id === defaultId }));
  await AsyncStorage.setItem(key(userId), JSON.stringify(normalized));
  return normalized;
}

export async function removeAddress(userId: string, id: string): Promise<SavedAddress[]> {
  const next = (await getSavedAddresses(userId)).filter(item => item.id !== id);
  const defaultId = next.find(item => item.isDefault)?.id ?? next[0]?.id;
  const normalized = next.map(item => ({ ...item, isDefault: item.id === defaultId }));
  await AsyncStorage.setItem(key(userId), JSON.stringify(normalized));
  return normalized;
}

export function deliveryAddress(saved: Address): Address {
  return { zipCode: saved.zipCode, street: saved.street, number: saved.number,
    complement: saved.complement || '', neighborhood: saved.neighborhood, city: saved.city, state: saved.state };
}
