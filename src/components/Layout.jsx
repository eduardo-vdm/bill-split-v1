import { useNavigate, useLocation } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { ArrowLeftIcon, Cog6ToothIcon, HomeIcon } from '@heroicons/react/24/outline';
import { classNames } from '../utils/helpers';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import BackgroundCircles from './BackgroundCircles';

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

  // Don't show background circles on BillSummaryScreen
  const showBackgroundCircles = !location.pathname.includes('/summary');

  return (
    <div className="h-screen overflow-x-hidden flex flex-col bg-white dark:bg-gray-900">
      {showBackgroundCircles && <BackgroundCircles />}
      
      <header className="sticky top-0 z-50 bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 shadow-lg dark:shadow-primary-900/50 border-b-4 border-primary-50 dark:border-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="mr-2 p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/20"
                  aria-label={t('common:buttons.back')}
                >
                  <ArrowLeftIcon className="h-6 w-6 text-white" />
                </button>
              )}
              <button
                onClick={handleHome}
                className="mr-2 p-2 rounded-full"
                aria-label={t('common:buttons.home')}
              >
                <img 
                  src="/optimized_bill_icon.svg" 
                  alt="Bill Icon" 
                  className="w-16 h-16 drop-shadow-white-sm relative top-2 -left-2 brightness-100 hover:brightness-125"
                  style={{
                    margin: '0 auto'
                  }}
                />
              </button>
              {/* <h1 className="text-md md:text-lg lg:text-xl font-semibold text-white truncate">
                {typeof title === 'string' ? t(title) : title}
              </h1> */}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {showSettings && (
                <button
                  onClick={handleSettings}
                  className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/20"
                  aria-label={t('common:buttons.settings')}
                >
                  <Cog6ToothIcon className="h-6 w-6 text-white" />
                </button>
              )}
              {user.icon && (
                <div className="text-2xl text-white" role="img" aria-label={t('person:icon')}>
                  {user.icon}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center sticky top-16 w-full min-h-10 z-10 bg-white dark:bg-gray-800 border-b-2 border-primary-200 dark:border-primary-200">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary-600 dark:text-primary-400 truncate">{title}</h1>
      </div>

      <main className="h-full w-full min-w-[390px]">
        <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

    </div>
  );
} 