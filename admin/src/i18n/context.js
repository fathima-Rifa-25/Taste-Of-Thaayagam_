import { createContext, useContext } from 'react';

export const I18nContext = createContext();

export const useI18n = () => useContext(I18nContext);

export const availableLanguages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'si', label: 'සිංහල' },
];
