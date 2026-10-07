import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en';
import fr from '@/locales/fr';
import ar from '@/locales/ar';

const DICTS = { en, fr, ar };
const STORAGE_KEY = 'skillscope_lang';

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

const LanguageContext = createContext(null);

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
    const browser = navigator.language?.slice(0, 2);
    return DICTS[browser] ? browser : 'en';
  });

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const t = useCallback(
    (key, vars) => {
      const value = resolve(DICTS[lang], key) ?? resolve(DICTS.en, key) ?? key;
      if (typeof value !== 'string') return key;
      if (!vars) return value;
      return Object.entries(vars).reduce(
        (str, [name, replacement]) => str.replaceAll(`{${name}}`, String(replacement)),
        value
      );
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, dir, t, languages: LANGUAGES }), [lang, dir, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
