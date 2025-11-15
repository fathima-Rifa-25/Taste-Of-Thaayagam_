import { createContext, useContext, useEffect, useState } from 'react';

// Simple i18n implementation (no dependencies) with localStorage persistence
const defaultLang = localStorage.getItem('lang') || 'en';

const translations = {
  en: {
    allUsers: 'All Users',
    searchPlaceholder: 'Search by name...',
    addUser: '+ Add User',
    generateReport: 'Generate Report',
    downloadCSV: 'Download CSV',
    noUsers: 'No users found',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    action: 'Action',
    save: 'Save',
    update: 'Update',
    cancel: 'Cancel',
    deleteConfirm: 'Are you sure you want to delete',
  },
  ta: {
    allUsers: 'அனைத்து பயனர்கள்',
    searchPlaceholder: 'பெயரால் தேடுக...',
    addUser: '+ பயனரை சேர்',
    generateReport: 'அறிக்கை உருவாக்கவும்',
    downloadCSV: 'CSV பதிவிறக்கு',
    noUsers: 'பயனர்கள் இல்லை',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    email: 'மின்னஞ்சல்',
    phone: 'தொலைபேசி',
    action: 'செயல்',
    save: 'சேமிக்க',
    update: 'புதுப்பிக்க',
    cancel: 'விடு',
    deleteConfirm: 'நீங்கள் realmente நீக்க விரும்புகிறீர்களா',
  },
  si: {
    allUsers: 'පරිශීලක සියලු',
    searchPlaceholder: 'නම අනුව සෙවීම...',
    addUser: '+ පරිශීලකයා එක් කරන්න',
    generateReport: 'රියපද සැකසීම',
    downloadCSV: 'CSV බාගත කරන්න',
    noUsers: 'පරිශීලකයන් නොමැත',
    firstName: 'පළමු නාමය',
    lastName: 'අග නාමය',
    email: 'ඊමේල්',
    phone: 'දුරකථන',
    action: 'ක්‍රියාව',
    save: 'සුරකින්න',
    update: 'යාවත්කාලීන කරන්න',
    cancel: 'ඉවත්වන්න',
    deleteConfirm: 'ඔබ මකා දැමීමට කැමතිද',
  },
};

const I18nContext = createContext();

// eslint-disable-next-line react/prop-types
export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(defaultLang);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang] && translations[lang][key]
      ? translations[lang][key]
      : translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export const availableLanguages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'si', label: 'සිංහල' },
];
