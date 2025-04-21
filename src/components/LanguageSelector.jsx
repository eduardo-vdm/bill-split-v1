import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { languages } from '../utils/helpers';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const formatLanguageCode = (code) => {
    if (!code || code.length < 2) return 'En';
    return code.charAt(0).toUpperCase() + code.charAt(1).toLowerCase();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
        <GlobeAltIcon className="w-5 h-5 mr-2" />
        {formatLanguageCode(i18n.language)}
      </Menu.Button>

      <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
        <div className="py-1">
          {languages.map((language) => (
            <Menu.Item key={language.code}>
              {({ active }) => (
                <button
                  onClick={() => changeLanguage(language.code)}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } ${
                    i18n.language === language.code ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
                  } block w-full text-left px-4 py-2 text-sm`}
                >
                  {language.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
} 