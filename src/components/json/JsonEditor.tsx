import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { jsonToTypescript } from "@/lib/json-to-ts";
import { JsonTree } from "./JsonTree";
import { CodeEditor } from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, Sparkles, Minimize2, Eraser, Upload, Check, AlertCircle, Network, ListTree, FileCode, Code2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

const GraphView = lazy(() => import("./GraphView"));

const SAMPLE = JSON.stringify(
  {
    name: "JSONFlow",
    version: "1.0.0",
    secure: true,
    features: ["visualize", "format", "validate", "minify", "convert"],
    author: { name: "Ada Lovelace", country: "UK" },
    stats: { stars: 1024, forks: 87, issues: 3 },
  },
  null,
  2,
);

type Tab = "graph" | "tree" | "formatted" | "ts";

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Network; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 h-9 text-xs font-medium border-b-2 transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Inner() {
  const { t } = useI18n();
  const [text, setText] = useState(SAMPLE);
  const [tab, setTab] = useState<Tab>("graph");
  const fileRef = useRef<HTMLInputElement>(null);

  const changeTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    track("tool_action", { action: "view_tab", view: next });
  };

  // Editör (client) yüklendiğinde tool görüntüleme event'i.
  useEffect(() => {
    track("tool_view");
  }, []);

  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [text]);

  const format = () => {
    if (!parsed.ok) return toast.error(t("invalidJson"));
    setText(JSON.stringify(parsed.value, null, 2));
    toast.success(t("formatted"));
    track("tool_action", { action: "format" });
  };
  const minify = () => {
    if (!parsed.ok) return toast.error(t("invalidJson"));
    setText(JSON.stringify(parsed.value));
    toast.success(t("minified"));
    track("tool_action", { action: "minify" });
  };
  // Boşlukları yalnızca string literalleri DIŞINDA siler; geçersiz JSON'da da
  // çalışır ve string içeriklerini bozmaz.
  const stripWhitespace = () => {
    let out = "";
    let inStr = false;
    let esc = false;
    for (const ch of text) {
      if (inStr) {
        out += ch;
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') {
        inStr = true;
        out += ch;
      } else if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        // skip whitespace outside strings
      } else {
        out += ch;
      }
    }
    setText(out);
    toast.success(t("whitespaceRemoved"));
    track("tool_action", { action: "strip_whitespace" });
  };
  const copy = async (s: string, label?: string) => {
    await navigator.clipboard.writeText(s);
    toast.success(label ?? t("copiedToClipboard"));
    track("tool_copy", { char_count: s.length });
  };
  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    track("tool_download", { file_type: filename.split(".").pop() ?? "json" });
  };
  const onUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(f);
    track("file_upload", { file_type: "json", file_count: 1 });
  };

  const formatted = parsed.ok ? JSON.stringify(parsed.value, null, 2) : "";
  const minified = parsed.ok ? JSON.stringify(parsed.value) : "";
  const tsTypes = parsed.ok ? jsonToTypescript(parsed.value) : "";

  return (
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      {/* Left: editor */}
      <div className="min-h-[40vh] lg:min-h-0 lg:w-[440px] lg:min-w-[360px] lg:max-w-[45vw] flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
          <Button size="sm" variant="ghost" onClick={format}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t("format")}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={minify}>
            <Minimize2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t("minify")}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={stripWhitespace} title={t("stripWhitespace")}>
            <Eraser className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => copy(text)} title={t("copy")}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => download(text, "data.json", "application/json")} title={t("download")}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} title={t("upload")}>
            <Upload className="h-4 w-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <div className="ml-auto flex items-center gap-1.5 text-[11px] pr-1 min-w-0">
            {parsed.ok ? (
              <>
                <Check className="h-3.5 w-3.5 text-string shrink-0" aria-label={t("valid")} />
                <span className="text-muted-foreground truncate">
                  <span className="hidden sm:inline">{t("valid")} · </span>
                  {text.length.toLocaleString()}<span className="hidden sm:inline"> {t("chars")}</span>
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-destructive truncate">{t("invalid")}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background">
          <CodeEditor value={text} onChange={setText} />
        </div>
        {!parsed.ok && (
          <div className="px-3 py-2 text-xs text-destructive bg-destructive/10 border-t border-destructive/30 font-mono">
            {parsed.error}
          </div>
        )}
      </div>

      {/* Right: tabs */}
      <div className="flex-1 min-h-[50vh] lg:min-h-0 flex flex-col bg-background">
        <div className="flex items-center border-b border-border bg-card/40 px-2 overflow-x-auto scrollbar-none">
          <TabButton active={tab === "graph"} onClick={() => changeTab("graph")} icon={Network} label={t("tabGraph")} />
          <TabButton active={tab === "tree"} onClick={() => changeTab("tree")} icon={ListTree} label={t("tabTree")} />
          <TabButton active={tab === "formatted"} onClick={() => changeTab("formatted")} icon={FileCode} label={t("tabOutput")} />
          <TabButton active={tab === "ts"} onClick={() => changeTab("ts")} icon={Code2} label={t("tabTypescript")} />
        </div>
        <div className="flex-1 min-h-0 relative">
          {!parsed.ok ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {t("enterValidJson")}
            </div>
          ) : tab === "graph" ? (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  {t("loading")}
                </div>
              }
            >
              <GraphView value={parsed.value} />
            </Suspense>
          ) : tab === "tree" ? (
            <JsonTree value={parsed.value} />
          ) : tab === "formatted" ? (
            <OutputPane
              tabs={[
                { label: t("outFormatted"), value: formatted, filename: "data.json", mime: "application/json" },
                { label: t("outMinified"), value: minified, filename: "data.min.json", mime: "application/json" },
                { label: t("outEscape"), value: JSON.stringify(minified), filename: "data.escaped.txt", mime: "text/plain" },
              ]}
              copy={copy}
              download={download}
            />
          ) : (
            <OutputPane
              tabs={[{ label: "TypeScript", value: tsTypes, filename: "types.ts", mime: "text/typescript" }]}
              copy={copy}
              download={download}
              language="ts"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OutputPane({
  tabs,
  copy,
  download,
}: {
  tabs: Array<{ label: string; value: string; filename: string; mime: string }>;
  copy: (s: string, label?: string) => void;
  download: (s: string, filename: string, mime: string) => void;
  language?: string;
}) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const cur = tabs[idx];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-card/30">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setIdx(i)}
            className={`px-2.5 h-7 text-xs rounded-md transition-colors ${
              i === idx ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => copy(cur.value)} title={t("copy")}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => download(cur.value, cur.filename, cur.mime)} title={t("download")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-[13px] font-mono leading-relaxed text-foreground bg-background m-0 whitespace-pre-wrap break-all">
        {cur.value}
      </pre>
    </div>
  );
}

export function JsonEditor() {
  const { t } = useI18n();
  return (
    <ClientOnly
      fallback={
        <div className="flex flex-1 min-h-0 items-center justify-center text-sm text-muted-foreground">
          {t("loading")}
        </div>
      }
    >
      <Inner />
    </ClientOnly>
  );
}
