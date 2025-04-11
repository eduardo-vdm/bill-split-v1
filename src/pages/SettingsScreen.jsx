import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useUserContext();
  const { bills, deleteBill } = useBillsContext();
  const { clearCurrentBill } = useCurrentBillContext();
  const [name, setName] = useState(user.name);
  const [currency, setCurrency] = useState(user.currency);
  const [theme, setTheme] = useState(user.theme);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ name, currency, theme });
    navigate('/bills');
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    // Clear all local storage data
    localStorage.clear();
    
    // Reset the application state
    updateUser({
      name: '',
      currency: 'USD',
      theme: 'light',
      isSetup: false
    });
    
    // Delete all bills one by one
    bills.forEach(bill => deleteBill(bill.id));
    clearCurrentBill();
    
    // Navigate to the splash screen instead of setup
    navigate('/');
    setShowResetConfirm(false);
  };

  return (
    <Layout title="Settings" showBack>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Save Changes
          </button>
        </form>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Danger Zone</h2>
          <button
            onClick={handleResetData}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Reset All Data
          </button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This will delete all your bills and settings. This action cannot be undone.
          </p>
        </div>

        <ConfirmDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleConfirmReset}
          title="Reset All Data"
          message="Are you sure you want to reset all data? This will delete all your bills and settings. This action cannot be undone."
        />
      </div>
    </Layout>
  );
} 