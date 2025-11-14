import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, firstName: string, lastName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    
    if (email && firstName && lastName) {
      setCurrentUser({ email, firstName, lastName });
    }
  }, []);

  const login = (email: string, firstName: string, lastName: string) => {
    const user = { email, firstName, lastName };
    setCurrentUser(user);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userLastName', lastName);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
