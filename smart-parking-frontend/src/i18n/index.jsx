import { createContext, useContext, useState } from 'react';
import en from './en.json';
import mr from './mr.json';
import hi from './hi.json';

const STRINGS = { en, mr, hi };
const LABELS = { en: 'EN', mr: 'मरा', hi: 'हिं' };

function readSavedLang() {
  try {
    const saved = localStorage.getItem('lang');
    return STRINGS[saved] ? saved : 'en';
  } catch {
    return 'en';
  }
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readSavedLang);

  const setLang = (code) => {
    setLangState(code);
    try {
      localStorage.setItem('lang', code);
    } catch {
      // storage blocked: choice still applies for this visit
    }
  };

  // Missing key in the chosen language falls back to English, then the key itself.
  const t = (key, vars = {}) =>
    (STRINGS[lang][key] ?? en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang, t } = useTranslation();
  return (
    <div className="lang-toggle" role="group" aria-label={t('language')}>
      {Object.entries(LABELS).map(([code, label]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          className={lang === code ? 'is-active' : ''}
          onClick={() => setLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
