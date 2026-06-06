import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "tr" | "en";

const STORAGE_KEY = "sp-lang";

const dict = {
  tr: {
    instantViz: "Anlık görselleştirme",
    privacy: "%100 tarayıcıda çalışır",
    toLight: "Aydınlık moda geç",
    toDark: "Karanlık moda geç",
    light: "Aydınlık mod",
    dark: "Karanlık mod",
    langSwitch: "Dili değiştir",
    format: "Formatla",
    minify: "Küçült",
    stripWhitespace: "Boşlukları kaldır",
    whitespaceRemoved: "Boşluklar kaldırıldı",
    copy: "Kopyala",
    download: "İndir",
    upload: "Yükle",
    valid: "Geçerli",
    invalid: "Geçersiz",
    invalidJson: "Geçersiz JSON",
    formatted: "Formatlandı",
    minified: "Küçültüldü",
    copiedToClipboard: "Panoya kopyalandı",
    chars: "karakter",
    enterValidJson: "Görselleştirme için geçerli bir JSON girin",
    loading: "Yükleniyor…",
    tabGraph: "Grafik",
    tabTree: "Ağaç",
    tabOutput: "Çıktı",
    tabTypescript: "TypeScript",
    outFormatted: "Formatlı",
    outMinified: "Küçültülmüş",
    outEscape: "Escape",
  },
  en: {
    instantViz: "Instant visualization",
    privacy: "100% in-browser",
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
    light: "Light mode",
    dark: "Dark mode",
    langSwitch: "Change language",
    format: "Format",
    minify: "Minify",
    stripWhitespace: "Remove whitespace",
    whitespaceRemoved: "Whitespace removed",
    copy: "Copy",
    download: "Download",
    upload: "Upload",
    valid: "Valid",
    invalid: "Invalid",
    invalidJson: "Invalid JSON",
    formatted: "Formatted",
    minified: "Minified",
    copiedToClipboard: "Copied to clipboard",
    chars: "characters",
    enterValidJson: "Enter valid JSON to visualize",
    loading: "Loading…",
    tabGraph: "Graph",
    tabTree: "Tree",
    tabOutput: "Output",
    tabTypescript: "TypeScript",
    outFormatted: "Formatted",
    outMinified: "Minified",
    outEscape: "Escape",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["tr"];

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getStoredLang(): Lang {
  if (typeof window === "undefined") return "tr";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "tr" || v === "en") return v;
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  return nav.startsWith("tr") ? "tr" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = getStoredLang();
    setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "tr" ? "en" : "tr");
  }, [lang, setLang]);

  const t = useCallback((key: TranslationKey) => dict[lang][key], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
