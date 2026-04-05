import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// Define the User and Context shapes
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (userData: User, tokenData: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();

  // Load the token and user data on app startup
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (
      // If the user is not signed in and the initial segment is not the login screen
      !token &&
      !inAuthGroup
    ) {
      // Redirect to the login screen
      router.replace('/login');
    } else if (token && inAuthGroup) {
      // Redirect away from the login screen
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading]);

  const signIn = async (userData: User, tokenData: string) => {
    try {
      await AsyncStorage.setItem('auth_token', tokenData);
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(tokenData);
      setUser(userData);
    } catch (e) {
      console.error('Failed to save auth state', e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to remove auth state', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
