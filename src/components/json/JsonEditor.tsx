import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from "reactflow";
import { jsonToGraph } from "@/lib/json-to-graph";
import { jsonToTypescript } from "@/lib/json-to-ts";
import { JsonNode } from "./JsonNode";
import { JsonTree } from "./JsonTree";
import { CodeEditor } from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, Sparkles, Minimize2, Upload, Check, AlertCircle, Network, ListTree, FileCode, Code2 } from "lucide-react";

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

const nodeTypes = { jsonNode: JsonNode };
type Tab = "graph" | "tree" | "formatted" | "ts";

function Graph({ value }: { value: unknown }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const { nodes: n, edges: e } = jsonToGraph(value);
    setNodes(n);
    setEdges(e);
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
  }, [value, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.05}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} size={1} color="var(--border)" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        maskColor="oklch(0.16 0.015 250 / 0.7)"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        nodeColor={() => "var(--primary)"}
      />
    </ReactFlow>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Network; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-9 text-xs font-medium border-b-2 transition-colors ${
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
  const [text, setText] = useState(SAMPLE);
  const [tab, setTab] = useState<Tab>("graph");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [text]);

  const format = () => {
    if (!parsed.ok) return toast.error("Geçersiz JSON");
    setText(JSON.stringify(parsed.value, null, 2));
    toast.success("Formatlandı");
  };
  const minify = () => {
    if (!parsed.ok) return toast.error("Geçersiz JSON");
    setText(JSON.stringify(parsed.value));
    toast.success("Küçültüldü");
  };
  const copy = async (s: string, label = "Panoya kopyalandı") => {
    await navigator.clipboard.writeText(s);
    toast.success(label);
  };
  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const onUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(f);
  };

  const formatted = parsed.ok ? JSON.stringify(parsed.value, null, 2) : "";
  const minified = parsed.ok ? JSON.stringify(parsed.value) : "";
  const tsTypes = parsed.ok ? jsonToTypescript(parsed.value) : "";

  return (
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      {/* Left: editor */}
      <div className="lg:w-[440px] lg:min-w-[360px] lg:max-w-[45vw] flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
          <Button size="sm" variant="ghost" onClick={format}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Formatla</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={minify}>
            <Minimize2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Küçült</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => copy(text)} title="Kopyala">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => download(text, "data.json", "application/json")} title="İndir">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} title="Yükle">
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
          <div className="ml-auto flex items-center gap-1.5 text-[11px] pr-1">
            {parsed.ok ? (
              <>
                <Check className="h-3.5 w-3.5 text-string" />
                <span className="text-muted-foreground">Geçerli · {text.length.toLocaleString()} karakter</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-destructive">Geçersiz</span>
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
      <div className="flex-1 min-h-[400px] flex flex-col bg-background">
        <div className="flex items-center border-b border-border bg-card/40 px-2">
          <TabButton active={tab === "graph"} onClick={() => setTab("graph")} icon={Network} label="Grafik" />
          <TabButton active={tab === "tree"} onClick={() => setTab("tree")} icon={ListTree} label="Ağaç" />
          <TabButton active={tab === "formatted"} onClick={() => setTab("formatted")} icon={FileCode} label="Çıktı" />
          <TabButton active={tab === "ts"} onClick={() => setTab("ts")} icon={Code2} label="TypeScript" />
        </div>
        <div className="flex-1 min-h-0 relative">
          {!parsed.ok ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Görselleştirme için geçerli bir JSON girin
            </div>
          ) : tab === "graph" ? (
            <Graph value={parsed.value} />
          ) : tab === "tree" ? (
            <JsonTree value={parsed.value} />
          ) : tab === "formatted" ? (
            <OutputPane
              tabs={[
                { label: "Formatlı", value: formatted, filename: "data.json", mime: "application/json" },
                { label: "Küçültülmüş", value: minified, filename: "data.min.json", mime: "application/json" },
                { label: "Escape", value: JSON.stringify(minified), filename: "data.escaped.txt", mime: "text/plain" },
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
  const [idx, setIdx] = useState(0);
  const cur = tabs[idx];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-card/30">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setIdx(i)}
            className={`px-2.5 h-7 text-xs rounded-md transition-colors ${
              i === idx ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => copy(cur.value)} title="Kopyala">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => download(cur.value, cur.filename, cur.mime)} title="İndir">
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
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}
