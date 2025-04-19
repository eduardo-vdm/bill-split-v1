import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useBillsContext } from '../contexts/BillsContext';
import { useUserContext } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { billTypes, generateId } from '../utils/helpers';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MainScreen() {
  const navigate = useNavigate();
  const { bills, deleteBill, addBill } = useBillsContext();
  const { user } = useUserContext();
  const [billToDelete, setBillToDelete] = useState(null);
  const { t, i18n } = useTranslation();

  const calculateBillTotal = (bill) => {
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const specialItemsTotal = bill.specialItems.reduce((sum, item) => {
      if (item.method === 'percentage') {
        return sum + (subtotal * item.value) / 100;
      }
      return sum + item.value;
    }, 0);
    return subtotal + specialItemsTotal;
  };

  const handleDeleteBill = (e, bill) => {
    e.stopPropagation();
    setBillToDelete(bill);
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      deleteBill(billToDelete.id);
      setBillToDelete(null);
    }
  };

  const handleEditBill = (e, bill) => {
    e.stopPropagation();
    navigate('/bills/new', { state: { editBill: bill } });
  };

  const handleDuplicateBill = (e, bill) => {
    e.stopPropagation();
    const newBill = {
      ...bill,
      id: generateId('bill-'),
      name: `Copy of ${bill.name}`,
      date: new Date().toISOString().split('T')[0],
    };
    const createdBill = addBill(newBill);
    navigate('/bills/new', { state: { editBill: createdBill } });
  };

  return (
    <Layout title={t('bills:title')}>
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('bills:title')}</h1>
          <button
            onClick={() => navigate('/bills/new')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('bills:createNew')}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

        {bills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('bills:noBills')}</p>
            <button
              onClick={() => navigate('/bills/new')}
              className="bg-tertiary-600 dark:bg-tertiary-700 text-white dark:drop-shadow-white drop-shadow-dark py-2 px-4 rounded-lg hover:bg-tertiary-700 dark:hover:bg-tertiary-800"
            >
              {t('bills:createFirstBill')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill) => {
              const billType = billTypes.find((t) => t.id === bill.type);
              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    onClick={() => navigate(`/bills/${bill.id}`)}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-400 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all relative group hover:bg-white dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span role="img" aria-label={bill.type}>
                            {billType?.icon}
                          </span>
                          <h3 className="font-medium">{bill.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {bill.place} • {new Date(bill.date).toLocaleDateString(i18n.language)}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(calculateBillTotal(bill), user.currency)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 mb-8">
                      {bill.people?.map((person) => (
                        <span key={person.id} className="text-2xl" title={person.name}>
                          {person.icon}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-3 right-3 flex space-x-1">
                      <button
                        className="p-1.5 text-gray-400 hover:text-tertiary-500 dark:text-gray-500 dark:hover:text-tertiary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={(e) => handleEditBill(e, bill)}
                        aria-label={`Edit ${bill.name}`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-tertiary-500 dark:text-gray-500 dark:hover:text-tertiary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={(e) => handleDuplicateBill(e, bill)}
                        aria-label={`Duplicate ${bill.name}`}
                      >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={(e) => handleDeleteBill(e, bill)}
                        aria-label={`Delete ${bill.name}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!billToDelete}
          onClose={() => setBillToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t('bills:deleteBill')}
          description={t('bills:deleteBillConfirm')}
        />
      </div>
    </Layout>
  );
} 