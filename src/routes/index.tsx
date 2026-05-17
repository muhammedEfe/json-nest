import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonEditor } from "@/components/json/JsonEditor";
import { Toaster } from "@/components/ui/sonner";
import { Github, Lock, Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme";

const SITE_URL = "https://sourcepiece.app";
const PAGE_TITLE = "SourcePiece — JSON Görselleştirici, Formatlayıcı ve TypeScript Dönüştürücü";
const PAGE_DESC =
  "JSON verilerini anında etkileşimli grafik, ağaç ve formatlı çıktı olarak görselleştirin. Formatlayın, küçültün, doğrulayın ve TypeScript tiplerine dönüştürün. %100 tarayıcıda, sunucuya veri gitmez.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "SourcePiece JSON Tools",
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
      name: "SourcePiece",
      inLanguage: "tr-TR",
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "keywords", content: "json görselleştirici, json formatter, json viewer, json to typescript, json minify, json validator, json tree, json graph" },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SourcePiece JSON Görselleştirici" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: "SourcePiece JSON Görselleştirici" },
      { "script:ld+json": structuredData },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
    ],
  }),
  component: Home,
});

function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
      aria-label={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
      title={isDark ? "Aydınlık mod" : "Karanlık mod"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function Home() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <div className="sp-brand flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight">
          <Link to="/" aria-label="SourcePiece" className="group flex min-w-0 items-center gap-2">
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
          </Link>
          <Link
            to="/"
            className="sp-mono hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:inline font-mono"
          >
            JSON Tools
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Anlık görselleştirme</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> %100 tarayıcıda çalışır</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
