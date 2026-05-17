import { useEffect } from "react";
import "reactflow/dist/style.css";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { jsonToGraph } from "@/lib/json-to-graph";
import { JsonNode } from "./JsonNode";

const nodeTypes = { jsonNode: JsonNode };

function GraphInner({ value }: { value: unknown }) {
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
        maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        nodeColor={() => "var(--primary)"}
      />
    </ReactFlow>
  );
}

export default function GraphView({ value }: { value: unknown }) {
  return (
    <ReactFlowProvider>
      <GraphInner value={value} />
    </ReactFlowProvider>
  );
}
