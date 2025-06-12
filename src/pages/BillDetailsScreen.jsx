import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrashIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { calculateItemSplit } from '../utils/billCalculations';
import Layout from '../components/Layout';
import Dialog from '../components/Dialog';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BillDetailsScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bills, updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeletePersonDialog, setShowDeletePersonDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [personToEdit, setPersonToEdit] = useState(null);
  const { t, i18n } = useTranslation();

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
    if (!currentBill?.items) return 0;

    return currentBill.items.reduce((total, item) => {
      if (!item.splitBetween?.includes(personId)) return total;

      const price = parseFloat(item.price);
      if (item.splitMethod === 'full') {
        return total + price;
      }

      if (item.splitMethod === 'percentage') {
        const percentage = parseFloat(item.percentages?.[personId] || 0);
        return total + (price * percentage) / 100;
      }

      if (item.splitMethod === 'value') {
        return total + (parseFloat(item.valueSplits?.[personId] || 0));
      }

      // Default to equal split
      const splitCount = item.splitBetween.length;
      return total + price / splitCount;
    }, 0);
  };

  const calculateSpecialItemsShare = () => {
    if (!currentBill?.specialItems?.length) return 0;
    
    const subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    const specialItemsTotal = currentBill.specialItems.reduce((sum, item) => {
      if (item.method === 'percentage') {
        return sum + (subtotal * item.value) / 100;
      }
      return sum + item.value;
    }, 0);

    return specialItemsTotal / (currentBill.people?.length || 1);
  };

  const handleDeletePerson = (personId) => {
    if (!currentBill) return;

    // Check if this is the last person and there are items
    if (currentBill.people.length === 1 && currentBill.items.length > 0) {
      setPersonToDelete(personId);
      setShowDeleteDialog(true);
      return;
    }

    const updatedBill = {
      ...currentBill,
      people: currentBill.people.filter(p => p.id !== personId),
      items: currentBill.items.map(item => {
        if (!item.splitBetween.includes(personId)) return item;

        const updatedSplitBetween = item.splitBetween.filter(id => id !== personId);
        if (updatedSplitBetween.length === 0) return item;

        // Recalculate splits based on method
        if (item.splitMethod === 'percentage') {
          const remainingPeople = updatedSplitBetween.length;
          const removedPercentage = parseFloat(item.percentages?.[personId] || 0);
          const adjustmentPerPerson = removedPercentage / remainingPeople;

          const updatedPercentages = { ...item.percentages };
          delete updatedPercentages[personId];

          // Redistribute the removed person's percentage
          updatedSplitBetween.forEach(id => {
            updatedPercentages[id] = (parseFloat(updatedPercentages[id] || 0) + adjustmentPerPerson).toFixed(2);
          });

          return {
            ...item,
            splitBetween: updatedSplitBetween,
            percentages: updatedPercentages
          };
        }

        if (item.splitMethod === 'value') {
          const remainingPeople = updatedSplitBetween.length;
          const removedValue = parseFloat(item.valueSplits?.[personId] || 0);
          const adjustmentPerPerson = removedValue / remainingPeople;

          const updatedValueSplits = { ...item.valueSplits };
          delete updatedValueSplits[personId];

          // Redistribute the removed person's value
          updatedSplitBetween.forEach(id => {
            updatedValueSplits[id] = (parseFloat(updatedValueSplits[id] || 0) + adjustmentPerPerson).toFixed(2);
          });

          return {
            ...item,
            splitBetween: updatedSplitBetween,
            valueSplits: updatedValueSplits
          };
        }

        return {
          ...item,
          splitBetween: updatedSplitBetween
        };
      })
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

  const handleConfirmDeletePerson = () => {
    if (personToDelete) {
      handleDeletePerson(personToDelete);
    }
    setShowDeleteDialog(false);
    setPersonToDelete(null);
  };

  const handleEditPerson = (person) => {
    if (person.name === user.name) {
      setShowEditUserDialog(true);
      return;
    }
    navigate(`/bills/${id}/add-person`, { state: { editPerson: person } });
  };

  if (!currentBill) return null;

  return (
    <Layout title={t('bills:details')} showBack>
      <div className="max-w-2xl mx-auto pb-24">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            { currentBill.name && <h2 className="text-lg font-semibold mb-4">{currentBill.name}</h2> }
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('bills:date')}</span>
                <span>{new Date(currentBill.date).toLocaleDateString(i18n.language)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('bills:place')}</span>
                <span>{currentBill.place}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{t('bills:total')}</span>
                <span>{formatCurrency(calculateTotal(), user.currency)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{t('bills:people.title')} ({currentBill.people?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-person`)}
                className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 border-2 border-primary-600 rounded-lg px-2 py-1"
              >
                <span className="text-lg text-secondary-600">{t('bills:people.add')}</span>
                <PlusIcon className="h-5 w-5 font-bold text-secondary-600" />
              </button>
            </div>
            <div className="space-y-2">
              {currentBill.people?.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handleEditPerson(person)}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{person.icon}</span>
                    <span>
                      {person.name}
                      {person.name === user.name && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          ({t('person:you')})
                        </span>
                      )}
                    </span>
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
              <h2 className="text-lg font-semibold">{t('bills:items.title')} ({currentBill.items?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-item`)}
                className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 border-2 border-primary-600 rounded-lg px-2 py-1"
              >
                <span className="text-lg text-secondary-600">{t('bills:items.add')}</span>
                <PlusIcon className="h-5 w-5 font-bold text-secondary-600" />
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
              <h2 className="text-lg font-semibold">{t('bills:taxTip.title')} ({currentBill.specialItems?.length || 0})</h2>
              <button
                onClick={() => navigate(`/bills/${id}/add-special`)}
                className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 border-2 border-primary-600 rounded-lg px-2 py-1"
              >
                <span className="text-lg text-secondary-600">{t('bills:taxTip.add')}</span>
                <PlusIcon className="h-5 w-5 font-bold text-secondary-600" />
              </button>
            </div>
            <div className="space-y-2">
              {currentBill.specialItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.type === 'tax' ? '💸' : '💰'}
                    </span>
                    <span className="font-medium">{t(`bills:taxTip.type.${item.type}`)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.method === 'percentage'
                        ? `${item.value}%`
                        : formatCurrency(item.value, user.currency)}
                    </span>
                    <button
                      onClick={() => handleDeleteSpecialItem(item.id)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <button
        onClick={() => navigate(`/bills/${id}/summary`)}
        className="flex flex-col max-w-2xl mx-auto fixed bottom-0 left-0 right-0 w-full py-2 px-4 text-lg bg-primary-600 dark:bg-primary-600 text-white hover:bg-secondary-700 dark:hover:bg-secondary-700 border-t-4 border-solid border-t-secondary-500" 
      >
        <div className="flex flex-col gap-0 items-center justify-center">
          <span className="text-lg font-bold">
            {t('bills:summary.actionTitle')}
          </span>
          <span className="text-sm text-gray-300">
            {t('bills:summary.description')}
          </span>
        </div>
        <ChevronRightIcon className="absolute right-0 bottom-0 h-16 w-16 text-white opacity-70 animate-pulse" />
      </button>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setPersonToDelete(null);
        }}
        title="Cannot Remove Last Person"
        description="You cannot remove the last person from a bill that contains items. Please remove all items first, or add another person before removing this one."
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setShowDeleteDialog(false);
              setPersonToDelete(null);
            },
            variant: 'outline'
          },
          {
            label: 'Remove All Items',
            onClick: () => {
              const updatedBill = {
                ...currentBill,
                items: [],
                specialItems: []
              };
              updateBill(id, updatedBill);
              updateCurrentBill(updatedBill);
              setShowDeleteDialog(false);
              setPersonToDelete(null);
            },
            variant: 'danger'
          }
        ]}
      />

      <Dialog
        isOpen={showEditUserDialog}
        onClose={() => setShowEditUserDialog(false)}
        title={t('person:editUser.title')}
        description={t('person:editUser.description')}
        actions={[
          {
            label: t('common:buttons.backToBill'),
            onClick: () => setShowEditUserDialog(false),
            variant: 'outline',
            icon: ArrowLeftIcon
          }
        ]}
      />
    </Layout>
  );
} 