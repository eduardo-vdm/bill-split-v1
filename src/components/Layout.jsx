import { useNavigate, useLocation } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { ArrowLeftIcon, Cog6ToothIcon, HomeIcon } from '@heroicons/react/24/outline';
import { classNames } from '../utils/helpers';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function Layout({ children, title, showBack = false, showSettings = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/bills');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('common:back')}
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={handleHome}
                className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('navigation:home')}
              >
                <img 
                  src="/optimized_bill_icon.svg" 
                  alt="Bill Icon" 
                  className="w-12 h-12"
                  style={{
                    margin: '0 auto'
                  }}
                />
                
              </button>
              <h1 className="text-md font-semibold text-gray-900 dark:text-white">
                {typeof title === 'string' ? t(title) : title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {showSettings && (
                <button
                  onClick={handleSettings}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t('navigation:settings')}
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
              )}
              {user.icon && (
                <div className="text-2xl" role="img" aria-label={t('person:icon')}>
                  {user.icon}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {location.pathname === '/bills' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate('/bills/new')}
            className="bg-tertiary-600 dark:bg-tertiary-700 text-white dark:drop-shadow-white drop-shadow-dark hover:bg-tertiary-700 dark:hover:bg-tertiary-800 rounded-full flex content-center justify-center w-12 h-12 text-4xl"
            aria-label={t('navigation:newBill')}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
} 