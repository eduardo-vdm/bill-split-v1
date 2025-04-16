import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { languages } from './utils/helpers';

// Import translations for each language and namespace
import enBills from './locales/en/bills.json';
import esBills from './locales/es/bills.json';
import ptBills from './locales/pt/bills.json';

import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import ptCommon from './locales/pt/common.json';

import enSettings from './locales/en/settings.json';
import esSettings from './locales/es/settings.json';
import ptSettings from './locales/pt/settings.json';

import enNavigation from './locales/en/navigation.json';
import esNavigation from './locales/es/navigation.json';
import ptNavigation from './locales/pt/navigation.json';

import enPerson from './locales/en/person.json';
import esPerson from './locales/es/person.json';
import ptPerson from './locales/pt/person.json';

import enBillTypes from './locales/en/billTypes.json';
import esBillTypes from './locales/es/billTypes.json';
import ptBillTypes from './locales/pt/billTypes.json';

import enSplitMethods from './locales/en/splitMethods.json';
import esSplitMethods from './locales/es/splitMethods.json';
import ptSplitMethods from './locales/pt/splitMethods.json';

import enSpecialItems from './locales/en/specialItems.json';
import esSpecialItems from './locales/es/specialItems.json';
import ptSpecialItems from './locales/pt/specialItems.json';

import enShare from './locales/en/share.json';
import esShare from './locales/es/share.json';
import ptShare from './locales/pt/share.json';

import enApp from './locales/en/app.json';
import esApp from './locales/es/app.json';
import ptApp from './locales/pt/app.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    supportedLngs: languages.map(lang => lang.code),
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true,
      // Add language code mapping for variants
      convertDetectedLanguage: (lng) => {
        // Get the base language code (e.g., 'pt' from 'pt-BR')
        const baseLang = lng.split('-')[0].toLowerCase();
        
        // If the base language is one of our supported languages, use it
        if (languages.some(lang => lang.code === baseLang)) {
          return baseLang;
        }
        
        // Otherwise, fall back to English
        return 'en';
      }
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        bills: enBills,
        common: enCommon,
        settings: enSettings,
        navigation: enNavigation,
        person: enPerson,
        billTypes: enBillTypes,
        splitMethods: enSplitMethods,
        specialItems: enSpecialItems,
        share: enShare,
        app: enApp
      },
      es: {
        bills: esBills,
        common: esCommon,
        settings: esSettings,
        navigation: esNavigation,
        person: esPerson,
        billTypes: esBillTypes,
        splitMethods: esSplitMethods,
        specialItems: esSpecialItems,
        share: esShare,
        app: esApp
      },
      pt: {
        bills: ptBills,
        common: ptCommon,
        settings: ptSettings,
        navigation: ptNavigation,
        person: ptPerson,
        billTypes: ptBillTypes,
        splitMethods: ptSplitMethods,
        specialItems: ptSpecialItems,
        share: ptShare,
        app: ptApp
      }
    },
    ns: ['bills', 'common', 'settings', 'navigation', 'person', 'billTypes', 'splitMethods', 'specialItems', 'share', 'app'],
    defaultNS: 'common'
  });

export default i18n; 