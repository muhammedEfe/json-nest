import type { Node, Edge } from "reactflow";

export type JsonNodeData = {
  label: string;
  entries: Array<{ key: string; value: string; type: string; isChild?: boolean }>;
};

const NODE_WIDTH = 260;
const H_GAP = 80;
const V_GAP = 16;
const ROW_HEIGHT = 24;
const HEADER = 32;

type Build = {
  nodes: Node<JsonNodeData>[];
  edges: Edge[];
  counter: { n: number };
};

function typeOf(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function formatPrimitive(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}

function nodeHeight(entries: number) {
  return HEADER + Math.max(1, entries) * ROW_HEIGHT + 8;
}

function build(
  value: unknown,
  label: string,
  depth: number,
  ctx: Build,
  yCursor: { y: number },
): { id: string; height: number } {
  const id = `n${ctx.counter.n++}`;
  const isObj = value !== null && typeof value === "object";
  const entries: JsonNodeData["entries"] = [];
  const childEdges: Array<{ childId: string; key: string }> = [];

  if (isObj) {
    const obj = value as Record<string, unknown>;
    const keys = Array.isArray(value) ? value.map((_, i) => String(i)) : Object.keys(obj);
    for (const k of keys) {
      const v = (obj as Record<string, unknown>)[k];
      const t = typeOf(v);
      if (v !== null && typeof v === "object") {
        entries.push({ key: k, value: Array.isArray(v) ? `[${(v as unknown[]).length}]` : "{…}", type: t, isChild: true });
      } else {
        entries.push({ key: k, value: formatPrimitive(v), type: t });
      }
    }
  } else {
    entries.push({ key: "", value: formatPrimitive(value), type: typeOf(value) });
  }

  const height = nodeHeight(entries.length);
  const x = depth * (NODE_WIDTH + H_GAP);
  const myY = yCursor.y;

  // placeholder, will set position after children to center vertically
  const node: Node<JsonNodeData> = {
    id,
    type: "jsonNode",
    position: { x, y: myY },
    data: { label, entries },
    draggable: true,
  };
  ctx.nodes.push(node);

  if (isObj) {
    const childStartY = yCursor.y;
    let childTotal = 0;
    const obj = value as Record<string, unknown>;
    const keys = Array.isArray(value) ? value.map((_, i) => String(i)) : Object.keys(obj);
    for (const k of keys) {
      const v = (obj as Record<string, unknown>)[k];
      if (v !== null && typeof v === "object") {
        const child = build(v, k, depth + 1, ctx, yCursor);
        yCursor.y += child.height + V_GAP;
        childTotal += child.height + V_GAP;
        childEdges.push({ childId: child.id, key: k });
      }
    }
    if (childTotal > 0) {
      childTotal -= V_GAP;
      // center current node vertically with its children
      const center = childStartY + childTotal / 2 - height / 2;
      node.position.y = Math.max(myY, center);
    } else {
      yCursor.y = myY + height + V_GAP;
    }
    for (const ce of childEdges) {
      ctx.edges.push({
        id: `e${id}-${ce.childId}`,
        source: id,
        target: ce.childId,
        sourceHandle: `${id}-${ce.key}`,
        type: "smoothstep",
      });
    }
  } else {
    yCursor.y = myY + height + V_GAP;
  }

  return { id, height: Math.max(height, yCursor.y - myY - V_GAP) };
}

export function jsonToGraph(value: unknown): { nodes: Node<JsonNodeData>[]; edges: Edge[] } {
  const ctx: Build = { nodes: [], edges: [], counter: { n: 0 } };
  build(value, "root", 0, ctx, { y: 0 });
  return { nodes: ctx.nodes, edges: ctx.edges };
}

export const NODE_DIMS = { width: NODE_WIDTH, rowHeight: ROW_HEIGHT, header: HEADER };
