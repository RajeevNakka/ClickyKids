import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import te from './te.json';
import hi from './hi.json';

const resources = {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi }
};

// Get saved language or default to English
const savedLanguage = localStorage.getItem('clickykids-language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('clickykids-language', lng);
});

export default i18n;

export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' }
];

export const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
};
