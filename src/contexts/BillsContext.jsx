import { createContext, useContext, useState, useEffect } from 'react';

const BillsContext = createContext();

export function useBillsContext() {
  return useContext(BillsContext);
}

export function BillsProvider({ children }) {
  const [bills, setBills] = useState(() => {
    const savedBills = localStorage.getItem('bills');
    return savedBills ? JSON.parse(savedBills) : [];
  });

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  const addBill = (bill) => {
    const newBill = { ...bill, id: crypto.randomUUID() };
    setBills([...bills, newBill]);
    return newBill;
  };

  const updateBill = (id, updates) => {
    setBills(bills.map(bill => 
      bill.id === id ? { ...bill, ...updates } : bill
    ));
  };

  const deleteBill = (id) => {
    setBills(bills.filter(bill => bill.id !== id));
  };

  const clearAllBills = () => {
    setBills([]);
  };

  return (
    <BillsContext.Provider value={{ bills, addBill, updateBill, deleteBill, clearAllBills }}>
      {children}
    </BillsContext.Provider>
  );
} 