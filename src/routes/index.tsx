import { createFileRoute } from "@tanstack/react-router";
import { JsonEditor } from "@/components/json/JsonEditor";
import { Toaster } from "@/components/ui/sonner";
import { Github, Lock, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JSONFlow — Hızlı ve Güvenli JSON Görselleştirici" },
      { name: "description", content: "JSON verilerinizi anında etkileşimli grafik olarak görselleştirin. Hızlı, güvenli ve tamamen tarayıcınızda çalışır." },
      { property: "og:title", content: "JSONFlow — JSON Görselleştirici" },
      { property: "og:description", content: "JSON verilerinizi anında etkileşimli grafik olarak görselleştirin." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <div className="sp-brand flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight">
          <a href="/" aria-label="SourcePiece" className="group flex min-w-0 items-center gap-2">
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
          <a
            href="/"
            className="sp-mono hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:inline font-mono"
          >
            JSON Tools
          </a>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Anlık görselleştirme</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> %100 tarayıcıda çalışır</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="ml-auto h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </header>
      <JsonEditor />
      <Toaster />
    </div>
  );
}
