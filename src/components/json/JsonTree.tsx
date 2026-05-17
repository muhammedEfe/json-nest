import { useState } from "react";
import { ChevronRight } from "lucide-react";

function TreeNode({ name, value, depth = 0, defaultOpen = true }: { name?: string; value: unknown; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen || depth < 2);
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);

  if (!isObj) {
    let cls = "text-foreground";
    let display: string;
    if (value === null) { cls = "text-null"; display = "null"; }
    else if (typeof value === "string") { cls = "text-string"; display = `"${value}"`; }
    else if (typeof value === "number") { cls = "text-number"; display = String(value); }
    else if (typeof value === "boolean") { cls = "text-boolean"; display = String(value); }
    else display = String(value);
    return (
      <div className="flex gap-2 font-mono text-[13px] py-0.5">
        {name !== undefined && <span className="text-key">{name}:</span>}
        <span className={cls}>{display}</span>
      </div>
    );
  }

  const entries = isArr ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>);
  const summary = isArr ? `Array(${entries.length})` : `{${entries.length}}`;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 font-mono text-[13px] py-0.5 hover:bg-accent/40 rounded px-1 -ml-1"
      >
        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        {name !== undefined && <span className="text-key">{name}:</span>}
        <span className="text-muted-foreground text-[11px]">{summary}</span>
      </button>
      {open && (
        <div className="ml-4 border-l border-border pl-3">
          {entries.map(([k, v]) => (
            <TreeNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonTree({ value }: { value: unknown }) {
  return (
    <div className="p-4 overflow-auto h-full">
      <TreeNode value={value} />
    </div>
  );
}
