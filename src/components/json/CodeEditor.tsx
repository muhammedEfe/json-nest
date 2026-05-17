import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <Editor
      value={value}
      onValueChange={(v) => onChange?.(v)}
      highlight={(code) => Prism.highlight(code, Prism.languages.json, "json")}
      padding={16}
      readOnly={readOnly}
      textareaClassName="json-textarea"
      preClassName="json-pre"
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.6,
        minHeight: "100%",
        background: "transparent",
        color: "var(--foreground)",
        caretColor: "var(--primary)",
      }}
      className="json-editor h-full"
    />
  );
}
