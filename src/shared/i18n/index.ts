import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../locales/en.json';
import ja from '../../locales/ja.json';
import vi from '../../locales/vi.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

export default i18n;
