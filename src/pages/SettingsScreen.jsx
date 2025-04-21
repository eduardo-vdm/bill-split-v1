import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Footer from '../components/Footer';
import { currencies } from '../utils/helpers';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useUserContext();
  const { bills, deleteBill } = useBillsContext();
  const { clearCurrentBill } = useCurrentBillContext();
  const { t } = useTranslation();
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
      theme: 'dark',
      isSetup: false
    });
    
    // Delete all bills one by one
    bills.forEach(bill => deleteBill(bill.id));
    clearCurrentBill();
    
    // Clear any remaining data
    localStorage.removeItem('recentPeople');
    localStorage.removeItem('recentPlaces');
    
    // Navigate to the splash screen instead of setup
    navigate('/');
    setShowResetConfirm(false);
  };

  return (
    <Layout title={t('settings:title')} showBack>
      <div className="max-w-[28rem] min-w-[20rem] mx-auto">
        <div className="space-y-6 pb-16">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t('settings:name')}
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
                  {t('settings:currency.title')}
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} {currency.code} {currency.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t('settings:theme.title')}
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <option value="light">{t('settings:theme.light')}</option>
                  <option value="dark">{t('settings:theme.dark')}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-tertiary-600 dark:bg-tertiary-600 text-white dark:drop-shadow-white drop-shadow-dark py-2 px-4 rounded-lg hover:bg-tertiary-700 dark:hover:bg-tertiary-700"
              >
                {t('common:buttons.save')}
              </button>
            </form>

            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('settings:dangerZone')}</h2>
              <button
                onClick={handleResetData}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
              >
                {t('settings:resetData')}
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('settings:resetDataConfirm')}
              </p>
            </div>

            <ConfirmDialog
              isOpen={showResetConfirm}
              onClose={() => setShowResetConfirm(false)}
              onConfirm={handleConfirmReset}
              title={t('settings:resetData')}
              description={t('settings:resetDataConfirm')}
            />
          </Card>
        </div>
        <Footer />
      </div>
    </Layout>
  );
} 