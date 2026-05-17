import { Handle, Position, type NodeProps } from "reactflow";
import type { JsonNodeData } from "@/lib/json-to-graph";
import { NODE_DIMS } from "@/lib/json-to-graph";

const typeColor: Record<string, string> = {
  string: "text-string",
  number: "text-number",
  boolean: "text-boolean",
  null: "text-null",
  object: "text-key",
  array: "text-key",
};

export function JsonNode({ id, data }: NodeProps<JsonNodeData>) {
  return (
    <div
      className="rounded-md border bg-node text-foreground shadow-lg overflow-hidden"
      style={{ width: NODE_DIMS.width, borderColor: "var(--node-border)" }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "var(--node-border)", border: "none" }} />
      <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground bg-secondary/40 border-b border-[var(--node-border)] font-medium">
        {data.label}
      </div>
      <div className="divide-y divide-[var(--node-border)]/60">
        {data.entries.map((e, i) => (
          <div
            key={i}
            className="px-3 flex items-center gap-2 relative"
            style={{ height: NODE_DIMS.rowHeight }}
          >
            {e.key !== "" && (
              <span className="text-key font-mono text-[12px] truncate max-w-[40%]">{e.key}:</span>
            )}
            <span className={`font-mono text-[12px] truncate ${typeColor[e.type] ?? "text-foreground"}`}>
              {e.value}
            </span>
            {e.isChild && (
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${e.key}`}
                style={{
                  top: "50%",
                  background: "var(--primary)",
                  width: 8,
                  height: 8,
                  border: "none",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
