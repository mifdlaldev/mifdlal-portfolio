'use client';

import { createContext, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { type IconHandle } from '@animateicons/react';
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

/* ── Sequence ctx: node/edge yang sedang aktif (alur kerja n8n-style) ── */
type Phase = { nodes: string[]; edges: string[]; ms: number };

/* Timeline eksekusi workflow: tiap langkah ~1 detik, seperti eksekusi
   workflow di n8n/Zapier. Node menyala → sinyal melintas edge → node
   berikut menyala. Durasi total ~15 detik sebelum loop ulang. */
const TIMELINE: Phase[] = [
  { nodes: ['trigger'], edges: [], ms: 1200 },          // PESAN MASUK menyala
  { nodes: [], edges: ['e1'], ms: 1000 },               // sinyal → KONTEKS PELANGGAN
  { nodes: ['koleksi'], edges: [], ms: 1200 },
  { nodes: [], edges: ['e2'], ms: 1000 },               // sinyal → AI AGENT
  /* Brain sticky: menyala di sini dan TETAP menyala sampai ketiga cabang
     selesai dan sinyalnya kembali. Tooltip ikut terbuka selama aktif. */
  { nodes: ['agent'], edges: [], ms: 2400 },            // brain menyala + tooltip
  { nodes: ['agent'], edges: ['b1', 'b2', 'b3'], ms: 1000 },        // fan-out, brain tetap
  { nodes: ['agent', 't-model', 't-dokumen', 't-api'], edges: [], ms: 1300 }, // tool bekerja
  { nodes: ['agent'], edges: ['r1', 'r2', 'r3'], ms: 1000 },        // cabang kembali ke brain
  { nodes: [], edges: ['e3'], ms: 1000 },               // brain → CEK KEBIJAKAN (padam)
  { nodes: ['validasi'], edges: [], ms: 1200 },
  { nodes: [], edges: ['e4'], ms: 1000 },               // sinyal → KIRIM BALASAN
  { nodes: ['kirim'], edges: [], ms: 1800 },            // output akhir
];
const PAUSE_MS = 2200; // jeda sebelum loop ulang

const SeqCtx = createContext({ nodes: new Set<string>(), edges: new Set<string>() });
const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- nodes --- */

type TileData = {
  label: string;
  icon: 'message' | 'database' | 'brain' | 'shield-check' | 'send' | 'chatgpt' | 'book' | 'headset';
  tone: 'node' | 'hub' | 'tool';
};

const ICON_SIZE = 38;

/* Ikon ikut "hidup" saat tile menyala: outline aktif → animasi ikon jalan.
   Animasi diputar lewat ref handle (startAnimation), bukan hover, karena
   pemicunya adalah fase timeline, bukan pointer. */
const TileIcon = memo(function TileIcon({
  kind,
  active,
}: {
  kind: TileData['icon'];
  active: boolean;
}) {
  const ref = useRef<IconHandle | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (active) ref.current.startAnimation();
    else ref.current.stopAnimation();
  }, [active, kind]);

  const base = { size: ICON_SIZE, strokeWidth: 1.5, color: 'var(--electric)' } as const;

  switch (kind) {
    case 'message':
      return <MessageSquareIcon ref={ref} {...base} />;
    case 'database':
      return <DatabaseIcon ref={ref} {...base} />;
    case 'brain':
      return <BrainIcon ref={ref} {...base} />;
    case 'shield-check':
      return <ShieldCheckIcon ref={ref} {...base} />;
    case 'send':
      return <SendHorizontalIcon ref={ref} {...base} />;
    case 'book':
      return <BookOpenIcon ref={ref} {...base} />;
    case 'headset':
      return <HeadsetIcon ref={ref} {...base} />;
    case 'chatgpt':
      return <ChatGptIcon ref={ref} size={ICON_SIZE} color="var(--electric)" />;
    default:
      return null;
  }
});

const TileNode = memo(({ id, data }: NodeProps) => {
  const d = data as unknown as TileData;
  const active = useContext(SeqCtx).nodes.has(id);
  const cls =
    d.tone === 'hub' ? 'wf-tile wf-tile--hub' : d.tone === 'tool' ? 'wf-tile wf-tile--tool' : 'wf-tile';

  // Stagger berdasarkan urutan node: tile kiri masuk duluan.
  const order = (d as any).order ?? 0;

  return (
    <motion.div
      className={`${cls}${active ? ' is-active' : ''}`}
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
        <span className="wf-tile__icon">
          <TileIcon kind={d.icon} active={active} />
        </span>
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
          {/* Titik masuk sinyal balik dari 3 tool — posisi identik dengan b1/b2/b3 */}
          <Handle id="rb1" type="target" position={Position.Bottom} className="wf-handle" style={{ left: '14%' }} />
          <Handle id="rb2" type="target" position={Position.Bottom} className="wf-handle" style={{ left: '50%' }} />
          <Handle id="rb3" type="target" position={Position.Bottom} className="wf-handle" style={{ left: '86%' }} />
        </>
      )}
      {d.tone === 'tool' && (
        <>
          <Handle id="in" type="target" position={Position.Top} className="wf-handle" />
          <Handle id="out" type="source" position={Position.Top} className="wf-handle" />
        </>
      )}
    </motion.div>
  );
});
TileNode.displayName = 'TileNode';

/* ---------------------------------------------------------------- edges --- */

const FlowEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  const active = useContext(SeqCtx).edges.has(id);
  // Edge balik (r1/r2/r3): garis dasar disembunyikan — tumpang tindih dengan
  // garis turun b1/b2/b3 yang geometrinya identik terbalik.
  const isReturn = Boolean((data as { ret?: boolean } | undefined)?.ret);

  return (
    <>
      {!isReturn && <BaseEdge id={id} path={path} className="wf-edge" />}
      {active && (
        <g className="wf-signal" key={id}>
          {/* Garis terang yang "menggambar" diri dari sumber ke tujuan */}
          <path d={path} className="wf-edge-signal" pathLength={1} />
          {/* Ekor sinyal (elektrik) + kepala (lemon) meluncur menyusur jalur */}
          <path d={path} className="wf-comet wf-comet--tail" pathLength={1} />
          <path d={path} className="wf-comet wf-comet--head" pathLength={1} />
        </g>
      )}
    </>
  );
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
  // Edge balik: 3 tool → brain. Garis dasar disembunyikan (tumpang tindih
  // dengan b1/b2/b3 turun), sinyal draw + comet tetap jalan naik ke brain.
  { id: 'r1', source: 't-model', sourceHandle: 'out', target: 'agent', targetHandle: 'rb1', type: 'flow', data: { ret: true } },
  { id: 'r2', source: 't-dokumen', sourceHandle: 'out', target: 'agent', targetHandle: 'rb2', type: 'flow', data: { ret: true } },
  { id: 'r3', source: 't-api', sourceHandle: 'out', target: 'agent', targetHandle: 'rb3', type: 'flow', data: { ret: true } },
];

export default function WorkflowCanvas() {
  const n = useMemo(() => nodes, []);
  const e = useMemo(() => edges, []);
  const [phase, setPhase] = useState(-1);

  /* Mesin alur: jalankan timeline berulang. Setiap fase menyalakan node
     atau mengirim sinyal lewat edge, lalu lanjut ke fase berikutnya.
     Fase terakhir diikuti jeda panjang sebelum loop ulang. */
  useEffect(() => {
    if (reduceMotion()) return;
    let i = 0;
    let timer = 0;

    const step = () => {
      const isPause = i === TIMELINE.length;
      setPhase(isPause ? -1 : i);
      const dur = isPause ? PAUSE_MS : TIMELINE[i].ms;
      i = (i + 1) % (TIMELINE.length + 1);
      timer = window.setTimeout(step, dur);
    };

    // Tunggu animasi masuk tile selesai dulu.
    timer = window.setTimeout(step, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const seq = useMemo(() => {
    const p = phase >= 0 ? TIMELINE[phase] : { nodes: [], edges: [] };
    return { nodes: new Set(p.nodes), edges: new Set(p.edges) };
  }, [phase]);

  return (
    <div className="wf-canvas" aria-hidden="true">
      <SeqCtx.Provider value={seq}>
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
        </SeqCtx.Provider>
    </div>
  );
}
