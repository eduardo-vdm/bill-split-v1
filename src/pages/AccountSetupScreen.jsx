import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '../contexts/UserContext';
import { useBillsContext } from '../contexts/BillsContext';
import { useTranslation } from 'react-i18next';
import { currencies, languages } from '../utils/helpers';
import useSampleData from '../hooks/useSampleData';
import IconSelector from '../components/IconSelector';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';
import { Switch } from '@headlessui/react';

export default function AccountSetupScreen() {
  const navigate = useNavigate();
  const { updateUser, user } = useUserContext();
  const { setAllFromData } = useBillsContext();
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [currency, setCurrency] = useState(() => {
    // Get the current language's default currency
    const currentLanguage = languages.find(lang => lang.code === i18n.language);
    return currentLanguage?.defaultCurrencyCode || 'USD';
  });
  const [enableSampleData, setEnableSampleData] = useState(true);
  const { sampleData, isLoading, error, replaceDataUserPlaceholder } = useSampleData('bills');

  // Update currency and sample data when language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      const currentLanguage = languages.find(lang => lang.code === lng);
      setCurrency(currentLanguage?.defaultCurrencyCode || 'USD');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // whenever user changes, check if setup was done, and if sample data modify it to use the new user data, then navigate to bills
  useEffect(() => {
    const shouldNavigate = user?.isSetup;
    if (!shouldNavigate) return;

    if (enableSampleData && sampleData?.length) {
      const updatedSampleData = replaceDataUserPlaceholder(user);
      setAllFromData(updatedSampleData);
    }

    navigate('/bills');
  }, [user, enableSampleData, sampleData]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name,
      icon,
      currency,
      theme,
      isSetup: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <div className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <LanguageSelector />
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={theme === 'light' ? t('settings:theme.dark') : t('settings:theme.light')}
        >
          {theme === 'light' ? (
            <MoonIcon className="w-6 h-6 text-white" />
          ) : (
            <SunIcon className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative"
      >
        <h1 className="text-2xl font-bold text-left mb-6 text-gray-900 dark:text-white">
          {t('app:setup.title')}
        </h1>

        <img 
          src="/optimized_bill_icon.svg" 
          alt="Bill Icon" 
          className="w-32 h-32 mb-8 absolute -top-16 right-2"
          style={{
            margin: '0 auto'
          }}
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-3 pb-3">
            <div className="col-span-3">
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

              <div className="mt-4">
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
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('app:setup.icon')}
              </label>
              <IconSelector
                value={icon}
                onChange={setIcon}
                disabled={false}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <span className="text-md mr-4 text-right">
                {t('app:setup.tutorial.label')}
              </span>
              <Switch
                checked={enableSampleData}
                onChange={setEnableSampleData}
                className={`${
                  enableSampleData ? 'bg-primary-600 border-2 border-secondary-600' : 'bg-primary-600 bg-opacity-40'
                } relative inline-flex h-6 w-12 items-center rounded-full cursor-pointer transition-colors`}
              >
                <span
                  className={`${
                    enableSampleData ? 'translate-x-4' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-secondary-500 transition`}
                />
              </Switch>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 dark:bg-primary-600 text-white dark:drop-shadow-white drop-shadow-dark py-2 px-4 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-700"
          >
            {t('app:setup.start')}
          </button>
        </form>
      </motion.div>
      <Footer />
    </div>
  );
} 