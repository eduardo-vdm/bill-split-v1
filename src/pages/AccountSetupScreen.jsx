import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { currencies, languages } from '../utils/helpers';

export default function AccountSetupScreen() {
  const navigate = useNavigate();
  const { updateUser } = useUserContext();
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(() => {
    // Get the current language's default currency
    const currentLanguage = languages.find(lang => lang.code === i18n.language);
    return currentLanguage?.defaultCurrencyCode || 'USD';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name,
      currency,
      isSetup: true
    });
    navigate('/bills');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-500 to-secondary-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {t('app:setup.title')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('app:setup.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('app:setup.namePlaceholder')}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('app:setup.currency')}
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

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {t('app:setup.start')}
          </button>
        </form>
      </motion.div>
    </div>
  );
} 