'use client';

import { memo, useMemo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from '@xyflow/react';
import {
  MessageSquareIcon,
  DatabaseIcon,
  BrainIcon,
  CheckCheckIcon,
  SendHorizontalIcon,
  FileTextIcon,
  WebhookIcon,
} from '@animateicons/react/lucide';
import '@xyflow/react/dist/style.css';
import './workflow-canvas.css';

/* ---------------------------------------------------------------- nodes --- */

type TileData = {
  label: string;
  icon: 'message' | 'database' | 'brain' | 'check' | 'send' | 'file' | 'api' | 'brand';
  tone: 'node' | 'hub' | 'tool';
  brand?: string;
};

const ICON_SIZE = 44;

function renderIcon(kind: TileData['icon'], brand?: string) {
  const props = { size: ICON_SIZE, strokeWidth: 1.5, isAnimated: false } as const;
  switch (kind) {
    case 'message':
      return <MessageSquareIcon {...props} />;
    case 'database':
      return <DatabaseIcon {...props} />;
    case 'brain':
      return <BrainIcon {...props} />;
    case 'check':
      return <CheckCheckIcon {...props} />;
    case 'send':
      return <SendHorizontalIcon {...props} />;
    case 'file':
      return <FileTextIcon {...props} />;
    case 'api':
      return <WebhookIcon {...props} />;
    case 'brand':
      return <img className="wf-brand" src={brand} alt="" width={ICON_SIZE} height={ICON_SIZE} />;
    default:
      return null;
  }
}

const TileNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as TileData;
  const cls = d.tone === 'hub' ? 'wf-tile wf-tile--hub' : d.tone === 'tool' ? 'wf-tile wf-tile--tool' : 'wf-tile';

  return (
    <div className={cls}>
      <span className="wf-tile__icon">{renderIcon(d.icon, d.brand)}</span>
      {d.tone === 'hub' ? (
        <span className="wf-tile__label wf-tile__label--inside">
          {d.label}
          <span className="wf-tile__sub">orkestrasi tool</span>
        </span>
      ) : (
        <span className="wf-tile__label">{d.label}</span>
      )}

      <Handle type="target" position={Position.Left} className="wf-handle" />
      <Handle type="source" position={Position.Right} className="wf-handle" />
      {d.tone === 'hub' && (
        <>
          <Handle id="b1" type="source" position={Position.Bottom} className="wf-handle" style={{ left: '14%' }} />
          <Handle id="b2" type="source" position={Position.Bottom} className="wf-handle" style={{ left: '50%' }} />
          <Handle id="b3" type="source" position={Position.Bottom} className="wf-handle" style={{ left: '86%' }} />
        </>
      )}
      {d.tone === 'tool' && (
        <Handle id="in" type="target" position={Position.Top} className="wf-handle" />
      )}
    </div>
  );
});
TileNode.displayName = 'TileNode';

/* ---------------------------------------------------------------- edges --- */

const FlowEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) => {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  return <BaseEdge id={id} path={path} className="wf-edge" />;
});
FlowEdge.displayName = 'FlowEdge';

const nodeTypes = { tile: TileNode };
const edgeTypes = { flow: FlowEdge };

/* -------------------------------------------------------------- graph --- */

const NODE_W = 104;
const HUB_W = 152;
const TOOL_W = 96;
const GAP = 28;
const TOOL_GAP = 20;
const ROW2_Y = 196;

/* Kolom hub: node 1 dan 2 lebar NODE_W, jadi hub mulai di (NODE_W+GAP)*2. */
const HUB_X = (NODE_W + GAP) * 2;
const HUB_CX = HUB_X + HUB_W / 2;

/* Baris tool: berpusat di bawah hub, jarak TOOL_GAP, tanpa tumpang tindih.
   Tile tengah tepat di sumbu hub; kiri/kanan digeser satu lebar + jarak. */
const TOOL_MID_X = HUB_CX - TOOL_W / 2;
const TOOL_LEFT_X = TOOL_MID_X - TOOL_W - TOOL_GAP;
const TOOL_RIGHT_X = TOOL_MID_X + TOOL_W + TOOL_GAP;

const nodes: Node[] = [
  { id: 'trigger', type: 'tile', position: { x: 0, y: 0 }, data: { label: 'TRIGGER', icon: 'message', tone: 'node' } },
  {
    id: 'koleksi',
    type: 'tile',
    position: { x: NODE_W + GAP, y: 0 },
    data: { label: 'KOLEKSI', icon: 'database', tone: 'node' },
  },
  {
    id: 'agent',
    type: 'tile',
    position: { x: (NODE_W + GAP) * 2, y: 0 },
    data: { label: 'AI AGENT', icon: 'brain', tone: 'hub' },
    width: HUB_W,
  },
  {
    id: 'validasi',
    type: 'tile',
    position: { x: (NODE_W + GAP) * 2 + HUB_W + GAP, y: 0 },
    data: { label: 'VALIDASI', icon: 'check', tone: 'node' },
  },
  {
    id: 'kirim',
    type: 'tile',
    position: { x: (NODE_W + GAP) * 2 + HUB_W + GAP + NODE_W + GAP, y: 0 },
    data: { label: 'KIRIM', icon: 'send', tone: 'node' },
  },
  {
    id: 't-model',
    type: 'tile',
    position: { x: TOOL_LEFT_X, y: ROW2_Y },
    data: { label: 'MODEL LLM', icon: 'brand', tone: 'tool', brand: '/logos/openai.svg' },
  },
  {
    id: 't-dokumen',
    type: 'tile',
    position: { x: TOOL_MID_X, y: ROW2_Y },
    data: { label: 'DOKUMEN', icon: 'file', tone: 'tool' },
  },
  {
    id: 't-api',
    type: 'tile',
    position: { x: TOOL_RIGHT_X, y: ROW2_Y },
    data: { label: 'API', icon: 'api', tone: 'tool' },
  },
];

const edges: Edge[] = [
  { id: 'e1', source: 'trigger', target: 'koleksi', type: 'flow' },
  { id: 'e2', source: 'koleksi', target: 'agent', type: 'flow' },
  { id: 'e3', source: 'agent', target: 'validasi', type: 'flow' },
  { id: 'e4', source: 'validasi', target: 'kirim', type: 'flow' },
  { id: 'b1', source: 'agent', sourceHandle: 'b1', target: 't-model', targetHandle: 'in', type: 'flow' },
  { id: 'b2', source: 'agent', sourceHandle: 'b2', target: 't-dokumen', targetHandle: 'in', type: 'flow' },
  { id: 'b3', source: 'agent', sourceHandle: 'b3', target: 't-api', targetHandle: 'in', type: 'flow' },
];

export default function WorkflowCanvas() {
  const n = useMemo(() => nodes, []);
  const e = useMemo(() => edges, []);

  return (
    <div className="wf-canvas" aria-hidden="true">
      <ReactFlow
        nodes={n}
        edges={e}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.08, includeHiddenNodes: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
      />
    </div>
  );
}
