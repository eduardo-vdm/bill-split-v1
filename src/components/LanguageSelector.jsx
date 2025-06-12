import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { languages } from '../utils/helpers';
import clsx from 'clsx';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const formatLanguageCode = (code) => {
    if (!code || code.length < 2) return 'En';
    return code.charAt(0).toUpperCase() + code.charAt(1).toLowerCase();
  };

  const CurrentLanguageFlag = languages.find(language => language.code === i18n.language)?.flag;

  return (
    <Menu as="div" className="relative inline-block text-left">

      <Menu.Button title={i18n.language} className={clsx('inline-flex items-center justify-center w-full px-4 py-2 text-sm rounded-md',
                                                         'bg-gray-200 text-gray-700 dark:text-gray-200 opacity-60')}>
        {CurrentLanguageFlag && <CurrentLanguageFlag className="w-5 h-5" />}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
        <div className="py-1">
          {languages.map((language) => (
            <Menu.Item key={language.code}>
              {({ active }) => (
                <button
                  title={language.name}
                  onClick={() => changeLanguage(language.code)}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } ${
                    i18n.language === language.code ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
                  } block w-full text-left px-4 py-2 text-sm`}
                >
                  {language.flag && <language.flag className="w-5 h-5" />}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
} 