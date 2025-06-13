import { createContext, useContext, useState } from 'react';

const CurrentBillContext = createContext();

export function useCurrentBillContext() {
  return useContext(CurrentBillContext);
}

export function CurrentBillProvider({ children }) {
  const [currentBill, setCurrentBill] = useState(null);

  const updateCurrentBill = (updates) => {
    setCurrentBill(prev => {
      const newBill = prev ? { ...prev, ...updates } : updates;
      return newBill;
    });
  };

  const clearCurrentBill = () => {
    setCurrentBill(null);
  };

  return (
    <CurrentBillContext.Provider value={{ currentBill, setCurrentBill, updateCurrentBill, clearCurrentBill }}>
      {children}
    </CurrentBillContext.Provider>
  );
} 