import { createContext, useContext, useState } from 'react';

const CurrentBillContext = createContext();

export function useCurrentBillContext() {
  return useContext(CurrentBillContext);
}

export function CurrentBillProvider({ children }) {
  const [currentBill, setCurrentBill] = useState(null);

  const updateCurrentBill = (updates) => {
    setCurrentBill(prev => prev ? { ...prev, ...updates } : updates);
  };

  const clearCurrentBill = () => {
    setCurrentBill(null);
  };

  return (
    <CurrentBillContext.Provider value={{ currentBill, updateCurrentBill, clearCurrentBill }}>
      {children}
    </CurrentBillContext.Provider>
  );
} 