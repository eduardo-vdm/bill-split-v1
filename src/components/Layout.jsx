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
                <HomeIcon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
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
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 text-2xl"
            aria-label={t('navigation:newBill')}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
} 