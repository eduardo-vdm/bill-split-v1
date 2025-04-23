import { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const UserContext = createContext();

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      id: generateId('person-'),
      name: '',
      currency: 'USD',
      theme: 'dark',
      isSetup: false
    };
  });

  useEffect(() => {
    // Update the HTML class when theme changes
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.theme]);

  const updateUser = (updates) => {
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
} 