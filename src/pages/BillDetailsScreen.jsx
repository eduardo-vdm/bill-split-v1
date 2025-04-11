import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { calculateItemSplit } from '../utils/billCalculations';
import Layout from '../components/Layout';

export default function BillDetailsScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bills, updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();

  useEffect(() => {
    const bill = bills.find(b => b.id === id);
    if (!bill) {
      navigate('/bills');
      return;
    }
    if (JSON.stringify(bill) !== JSON.stringify(currentBill)) {
      updateCurrentBill(bill);
    }
  }, [id, bills]);

  const calculateTotal = () => {
    if (!currentBill) return 0;
    const subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    const specialItemsTotal = currentBill.specialItems.reduce((sum, item) => {
      if (item.method === 'percentage') {
        return sum + (subtotal * item.value) / 100;
      }
      return sum + item.value;
    }, 0);
    return subtotal + specialItemsTotal;
  };

  const calculatePersonTotal = (personId) => {
    // Calculate regular items share
    const itemsTotal = currentBill.items.reduce((total, item) => {
      if (item.splitMethod === 'percentage') {
        // For percentage splits, use the stored percentages
        const percentage = parseFloat(item.percentages[personId] || 0);
        return total + (item.price * percentage) / 100;
      } else if (item.splitMethod === 'full') {
        // For full amount, only count if this person is selected
        return total + (item.splitBetween.includes(personId) ? item.price : 0);
      } else if (item.splitMethod === 'custom') {
        // For custom splits, use the stored custom amounts
        return total + (item.customSplits[personId] || 0);
      } else {
        // Default to equal split
        const splitCount = item.splitBetween.length;
        return total + (item.splitBetween.includes(personId) ? item.price / splitCount : 0);
      }
    }, 0);

    // Calculate special items share
    const subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    const specialItemsShare = currentBill.specialItems.reduce((total, item) => {
      const value = item.method === 'percentage' 
        ? (subtotal * item.value) / 100 
        : item.value;
      return total + (value / currentBill.people.length);
    }, 0);

    return itemsTotal + specialItemsShare;
  };

  const handleDeletePerson = (personId) => {
    const updatedBill = {
      ...currentBill,
      people: currentBill.people.filter(p => p.id !== personId),
      // Also remove the person from item splits
      items: currentBill.items.map(item => ({
        ...item,
        splitBetween: item.splitBetween.filter(id => id !== personId)
      }))
    };
    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
  };

  const handleDeleteItem = (itemId) => {
    const updatedBill = {
      ...currentBill,
      items: currentBill.items.filter(item => item.id !== itemId)
    };
    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
  };

  const handleDeleteSpecialItem = (itemId) => {
    const updatedBill = {
      ...currentBill,
      specialItems: currentBill.specialItems.filter(item => item.id !== itemId)
    };
    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
  };

  if (!currentBill) return null;

  return (
    <Layout title={currentBill.name || 'Bill Details'} showBack>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Bill Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Date</span>
                <span>{new Date(currentBill.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Place</span>
                <span>{currentBill.place}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal(), user.currency)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">People ({currentBill.people?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-person`)}
                className="text-blue-600 hover:text-blue-700"
              >
                Add Person
              </button>
            </div>
            <div className="space-y-2">
              {currentBill.people?.map((person) => (
                <div
                  key={person.id}
                  onClick={() => navigate(`/bills/${id}/add-person`, { state: { editPerson: person } })}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{person.icon}</span>
                    <span>{person.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(calculatePersonTotal(person.id), user.currency)}
                    </span>
                    <div className="flex items-center gap-2">
                      <PencilIcon className="h-5 w-5 text-gray-400 transition-opacity" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePerson(person.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                        aria-label={`Delete ${person.name}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Items ({currentBill.items?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-item`)}
                className="text-blue-600 hover:text-blue-700"
              >
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {currentBill.items?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/bills/${id}/add-item`, { state: { editItem: item } })}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span>{formatCurrency(item.price, user.currency)}</span>
                    <div className="flex items-center gap-2">
                      <PencilIcon className="h-5 w-5 text-gray-400 transition-opacity" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                        aria-label={`Delete ${item.name}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Special Items ({currentBill.specialItems?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-special`)}
                className="text-blue-600 hover:text-blue-700"
              >
                Add Special Item
              </button>
            </div>
            <div className="space-y-2">
              {currentBill.specialItems?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/bills/${id}/add-special`, { state: { editSpecialItem: item } })}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <span>{item.type === 'tax' ? 'Tax' : 'Tip'}</span>
                  <div className="flex items-center gap-4">
                    <span>
                      {item.method === 'percentage' ? `${item.value}%` : formatCurrency(item.value, user.currency)}
                    </span>
                    <div className="flex items-center gap-2">
                      <PencilIcon className="h-5 w-5 text-gray-400 transition-opacity" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpecialItem(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                        aria-label={`Delete ${item.type}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate(`/bills/${id}/summary`)}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            View Summary
          </button>
        </div>
      </div>
    </Layout>
  );
} 