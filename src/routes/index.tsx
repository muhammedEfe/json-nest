import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonEditor } from "@/components/json/JsonEditor";
import { Toaster } from "@/components/ui/sonner";
import { Github, Lock, Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const SITE_URL = "https://sourcepiece.com/json-nest";
const APP_NAME = "JSON Nest";
const PAGE_TITLE = "JSON Nest — JSON Görselleştirici, Formatlayıcı ve TypeScript Dönüştürücü";
const PAGE_DESC =
  "JSON verilerini anında etkileşimli grafik, ağaç ve formatlı çıktı olarak görselleştirin. Formatlayın, küçültün, doğrulayın ve TypeScript tiplerine dönüştürün. %100 tarayıcıda, sunucuya veri gitmez.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: APP_NAME,
      url: SITE_URL,
      description: PAGE_DESC,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "JSON görselleştirme (grafik)",
        "JSON ağaç görünümü",
        "JSON formatlama ve küçültme",
        "JSON doğrulama",
        "TypeScript tipi dönüştürücü",
        "Tarayıcıda çalışır, veri gizliliği",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: APP_NAME,
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: APP_NAME },
      { name: "application-name", content: APP_NAME },
      { name: "description", content: PAGE_DESC },
      {
        name: "keywords",
        content:
          "json görselleştirici, json formatter, json viewer, json to typescript, json minify, json validator, json tree, json graph, json visualizer, json nest",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${APP_NAME} — JSON Visualizer` },
      { property: "og:locale", content: "tr_TR" },
      { property: "og:locale:alternate", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: `${APP_NAME} — JSON Visualizer` },
      { "script:ld+json": structuredData },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "alternate", hrefLang: "tr", href: SITE_URL },
      { rel: "alternate", hrefLang: "en", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
    ],
  }),
  component: Home,
});


function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const { t } = useI18n();
  const isDark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
      aria-label={isDark ? t("toLight") : t("toDark")}
      title={isDark ? t("light") : t("dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function LangToggle() {
  const { lang, toggle, t } = useI18n();
  const other = lang === "tr" ? "EN" : "TR";
  return (
    <button
      type="button"
      onClick={toggle}
      className="h-8 px-2 rounded-md border border-border flex items-center justify-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label={t("langSwitch")}
      title={`${t("langSwitch")} (${other})`}
    >
      <span className="text-foreground">{lang.toUpperCase()}</span>
      <span className="hidden sm:inline opacity-40">|</span>
      <span className="hidden sm:inline">{other}</span>
    </button>
  );
}

function Home() {
  const { t } = useI18n();
  return (
    <div className="h-screen [height:100dvh] flex flex-col bg-background text-foreground">
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <div className="sp-brand flex min-w-0 items-center gap-2 text-base sm:text-lg font-bold tracking-tight">
          <a href="https://sourcepiece.com/" aria-label="SourcePiece" className="group flex min-w-0 items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32" className="shrink-0 rounded-lg h-8 w-8" aria-hidden="true">
              <defs>
                <linearGradient id="sp-brand-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22e3a4" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="14" fill="url(#sp-brand-grad)" />
              <g fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 22 L12 32 L22 42" />
                <path d="M42 22 L52 32 L42 42" />
                <path d="M36 18 L28 46" />
              </g>
            </svg>
            <span className="truncate">
              Source
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(34, 227, 164) 0%, rgb(124, 58, 237) 100%)" }}
              >
                Piece
              </span>
            </span>
          </a>
          <Link
            to="/"
            className="sp-mono hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:inline font-mono"
          >
            JSON Tools
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> {t("instantViz")}</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> {t("privacy")}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <a
            href="https://github.com/muhammedEfe"
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>
      <JsonEditor />
      <Toaster />
    </div>
  );
}
