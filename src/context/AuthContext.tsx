import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (userData: Omit<User, 'id'>, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

type StoredUser = User & { password?: string };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedUser = await storageService.getItem<User>('@ToyMania:user');
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    }
    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Preencha todos os campos');
    
    const registeredUsers = await storageService.getItem<StoredUser[]>('@ToyMania:registered_users') || [];
    const userFound = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userFound) throw new Error('E-mail não encontrado. Faça o cadastro primeiro.');
    if (userFound.password !== password) throw new Error('Senha incorreta.');

    const { password: _, ...userWithoutPassword } = userFound;
    setUser(userWithoutPassword);
    await storageService.setItem('@ToyMania:user', userWithoutPassword);
  };

  const register = async (userData: Omit<User, 'id'>, password: string) => {
    if (!password) throw new Error('A senha é obrigatória');

    const registeredUsers = await storageService.getItem<StoredUser[]>('@ToyMania:registered_users') || [];
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    
    if (emailExists) throw new Error('Este e-mail já está cadastrado.');

    const newUser: StoredUser = { ...userData, id: String(Date.now()), password };
    await storageService.setItem('@ToyMania:registered_users', [...registeredUsers, newUser]);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    await storageService.setItem('@ToyMania:user', userWithoutPassword);
  };

  const signOut = async () => {
    // Limpa o usuário da memória
    setUser(null);
    // Remove a sessão ativa
    await storageService.removeItem('@ToyMania:user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};