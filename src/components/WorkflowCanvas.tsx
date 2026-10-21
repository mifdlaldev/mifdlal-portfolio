'use client';

import { createContext, memo, useContext, useEffect, useMemo, useState } from 'react';
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
import { motion } from 'motion/react';
import {
  MessageSquareIcon,
  DatabaseIcon,
  BrainIcon,
  ShieldCheckIcon,
  SendHorizontalIcon,
  BookOpenIcon,
  HeadsetIcon,
} from '@animateicons/react/lucide';
import { ChatGptIcon } from '@animateicons/react/huge';
import '@xyflow/react/dist/style.css';
import './workflow-canvas.css';

/* ── Tick global: sinkronisasi replay animasi ikon ─────────── */
const TickCtx = createContext(0);
const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useIconTick(ms: number) {
  const tick = useContext(TickCtx);
  return tick;
}

/* ---------------------------------------------------------------- nodes --- */

type TileData = {
  label: string;
  icon: 'message' | 'database' | 'brain' | 'shield-check' | 'send' | 'chatgpt' | 'book' | 'headset';
  tone: 'node' | 'hub' | 'tool';
};

const ICON_SIZE = 38;
const ICON_MS = 4200; // replay animasi ikon tiap 4.2 detik

function renderIcon(kind: TileData['icon'], tick = 0) {
  const base = { size: ICON_SIZE, strokeWidth: 1.5 } as const;
  // Ikon trigger selalu animasi; sisanya statis (tidak mengganggu bacaan).
  if (kind === 'message') {
    return <MessageSquareIcon {...base} isAnimated duration={1.1} color="#fdfcf1" key={tick} />;
  }
  switch (kind) {
    case 'database':
      return <DatabaseIcon {...base} />;
    case 'brain':
      return <BrainIcon {...base} />;
    case 'shield-check':
      return <ShieldCheckIcon {...base} />;
    case 'send':
      return <SendHorizontalIcon {...base} />;
    case 'book':
      return <BookOpenIcon {...base} />;
    case 'headset':
      return <HeadsetIcon {...base} />;
    case 'chatgpt':
      return <ChatGptIcon size={ICON_SIZE} color="#fdfcf1" />;
    default:
      return null;
  }
}

const TileNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as TileData;
  const tick = useIconTick(ICON_MS);
  const cls =
    d.tone === 'hub' ? 'wf-tile wf-tile--hub' : d.tone === 'tool' ? 'wf-tile wf-tile--tool' : 'wf-tile';

  // Stagger berdasarkan urutan node: tile kiri masuk duluan.
  const order = (d as any).order ?? 0;

  return (
    <motion.div
      className={cls}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, delay: order * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Isi tile yang bergerak: transform di dalam tile, BUKAN di wrapper node.
          Kalau wrapper node ditransform, React Flow mengukur handle saat offset
          dan garis konektor meleset dari pusat tile. */}
      <motion.span
        className="wf-tile__inner"
        initial={{ y: 6, scale: 0.96 }}
        whileInView={{ y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: order * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
        tabIndex={d.tone === 'hub' ? 0 : undefined}
        role={d.tone === 'hub' ? 'button' : undefined}
        aria-label={d.tone === 'hub' ? `${d.label}, klasifikasi intent dan draf balasan` : undefined}
      >
        <span className="wf-tile__icon">{renderIcon(d.icon, tick)}</span>
      </motion.span>

      {/* Label di bawah tile untuk SEMUA tile — konsisten.
          Ikon tepat di tengah tile, konektor melintang menyeberang ikon. */}
      <span className="wf-tile__label">
        {d.label}
        {d.tone === 'hub' && <span className="wf-tile__sub">klasifikasi intent + draf balasan</span>}
      </span>

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
    </motion.div>
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

const NODE_W = 84;
const HUB_W = 116;
const TOOL_W = 80;
const GAP = 26;
const TOOL_GAP = 24;
const ROW2_Y = 150;

/* Kolom hub: node 1 dan 2 lebar NODE_W, jadi hub mulai di (NODE_W+GAP)*2. */
const HUB_X = (NODE_W + GAP) * 2;
const HUB_CX = HUB_X + HUB_W / 2;

/* Baris tool: berpusat di bawah hub, jarak TOOL_GAP, tanpa tumpang tindih.
   Tile tengah tepat di sumbu hub; kiri/kanan digeser satu lebar + jarak. */
const TOOL_MID_X = HUB_CX - TOOL_W / 2;
const TOOL_LEFT_X = TOOL_MID_X - TOOL_W - TOOL_GAP;
const TOOL_RIGHT_X = TOOL_MID_X + TOOL_W + TOOL_GAP;

const nodes: Node[] = [
  { id: 'trigger', type: 'tile', position: { x: 0, y: 0 }, data: { label: 'PESAN MASUK', icon: 'message', tone: 'node', order: 0 } },
  {
    id: 'koleksi',
    type: 'tile',
    position: { x: NODE_W + GAP, y: 0 },
    data: { label: 'KONTEKS PELANGGAN', icon: 'database', tone: 'node', order: 1 },
  },
  {
    id: 'agent',
    type: 'tile',
    position: { x: (NODE_W + GAP) * 2, y: 0 },
    data: { label: 'AI AGENT', icon: 'brain', tone: 'hub', order: 2 },
    width: HUB_W,
  },
  {
    id: 'validasi',
    type: 'tile',
    className: 'wf-node-2line',
    position: { x: (NODE_W + GAP) * 2 + HUB_W + GAP, y: 0 },
    data: { label: 'CEK KEBIJAKAN', icon: 'shield-check', tone: 'node', order: 3 },
  },
  {
    id: 'kirim',
    type: 'tile',
    className: 'wf-node-2line',
    position: { x: (NODE_W + GAP) * 2 + HUB_W + GAP + NODE_W + GAP, y: 0 },
    data: { label: 'KIRIM BALASAN', icon: 'send', tone: 'node', order: 4 },
  },
  {
    id: 't-model',
    type: 'tile',
    position: { x: TOOL_LEFT_X, y: ROW2_Y },
    data: { label: 'MODEL LLM', icon: 'chatgpt', tone: 'tool', order: 5 },
  },
  {
    id: 't-dokumen',
    type: 'tile',
    position: { x: TOOL_MID_X, y: ROW2_Y },
    data: { label: 'KNOWLEDGE BASE', icon: 'book', tone: 'tool', order: 6 },
  },
  {
    id: 't-api',
    type: 'tile',
    position: { x: TOOL_RIGHT_X, y: ROW2_Y },
    data: { label: 'CRM HELPDESK', icon: 'headset', tone: 'tool', order: 7 },
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
  const [tick, setTick] = useState(0);

  // Replay animasi ikon berkala; hormati prefers-reduced-motion.
  useEffect(() => {
    if (reduceMotion()) return;
    const id = window.setInterval(() => setTick((v) => v + 1), ICON_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="wf-canvas" aria-hidden="true">
      <TickCtx.Provider value={tick}>
        <ReactFlow
          nodes={n}
          edges={e}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          /* Zoom dikunci 1 (integer) — TIDAK ada transform scale pada viewport.
            fitView dihapus karena menghitung zoom pecahan (mis. 0.98) yang
            me-raster seluruh layer termasuk teks → burem. Posisi x/y
            dihitung manual agar graph pas di tengah frame tanpa penskalaan. */
          minZoom={1}
          maxZoom={1}
          defaultViewport={{ x: 34, y: 82, zoom: 1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        />
      </TickCtx.Provider>
    </div>
  );
}
