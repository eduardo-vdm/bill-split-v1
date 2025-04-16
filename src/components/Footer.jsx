import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {import.meta.env.VITE_APP_TITLE} v{import.meta.env.VITE_APP_VERSION}, {import.meta.env.VITE_APP_AUTHOR}
        </p>
      </div>
    </footer>
  );
} 