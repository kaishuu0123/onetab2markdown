import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "./ja.json";
import en from "./en.json";

// ブラウザの言語設定を取得
const browserLanguage = navigator.language.split("-")[0];
const supportedLanguages = ["ja", "en"];
const defaultLanguage = supportedLanguages.includes(browserLanguage)
  ? browserLanguage
  : "ja";

i18n.use(initReactI18next).init({
  resources: {
    ja: {
      translation: ja.translation,
    },
    en: {
      translation: en.translation,
    },
  },
  lng: defaultLanguage,
  fallbackLng: "ja",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true,
  },
});

export default i18n;
