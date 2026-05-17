function cap(s: string) {
  return s.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(.)/, (m) => m.toUpperCase()) || "Type";
}

function tsType(value: unknown, name: string, defs: Map<string, string>): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const types = Array.from(new Set(value.map((v) => tsType(v, name, defs))));
    return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
  }
  if (typeof value === "object") {
    const typeName = cap(name);
    const obj = value as Record<string, unknown>;
    const lines = Object.entries(obj).map(([k, v]) => {
      const safe = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `  ${safe}: ${tsType(v, k, defs)};`;
    });
    const body = `interface ${typeName} {\n${lines.join("\n")}\n}`;
    defs.set(typeName, body);
    return typeName;
  }
  return typeof value;
}

export function jsonToTypescript(value: unknown): string {
  const defs = new Map<string, string>();
  const root = tsType(value, "Root", defs);
  const out = Array.from(defs.values()).reverse().join("\n\n");
  return defs.size ? out : `type Root = ${root};`;
}
