import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, F } from "../deck/theme";
import { POP, SlideDef, useSteps } from "../deck/steps";
import { clamp01, useClock } from "./common";

const rnd = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/* A commit graph of balances: main grows every tick, side branches fork from older commits. */
type Commit = { k: number; lane: number; parent: number; bal: number; amt: number; dep: boolean; ok: boolean; branch: number };

const LANE_Y = [560, 400, 720, 260, 860];
const LANE_COLOR = [C.accentHi, C.pink, C.amber, C.mint, C.orange];
const TICKS = 3000;

const COMMITS: Commit[] = [];
const FIRST_AT: number[] = [];
const MAIN_AT: number[] = [];
(() => {
  const lanes = LANE_Y.map((_, i) => ({ active: i === 0, head: -1, until: i === 0 ? Infinity : -1, freeFrom: 0, branch: 0 }));
  let branchNo = 0;
  const add = (k: number, lane: number, parent: number, branch: number, seed: number) => {
    const before = parent >= 0 ? COMMITS[parent].bal : 0;
    const dep = parent < 0 || before < 20 || rnd(seed * 3.3) < 0.55;
    const amt = parent < 0 ? 0 : 10 + Math.floor(rnd(seed * 7.1) * 6) * 10;
    const ok = dep || amt <= before;
    const bal = parent < 0 ? 0 : ok ? (dep ? before + amt : before - amt) : before;
    COMMITS.push({ k, lane, parent, bal, amt, dep, ok, branch });
    return COMMITS.length - 1;
  };
  for (let k = 0; k <= TICKS; k++) {
    FIRST_AT[k] = COMMITS.length;
    lanes[0].head = add(k, 0, lanes[0].head, 0, k * 5 + 1);
    MAIN_AT[k] = lanes[0].head;
    for (let l = 1; l < lanes.length; l++) {
      const ln = lanes[l];
      if (ln.active && k <= ln.until && ln.head >= 0 && COMMITS[ln.head].k < k) {
        ln.head = add(k, l, ln.head, ln.branch, k * 5 + l + 2);
      }
      if (ln.active && k > ln.until) {
        ln.active = false;
        ln.freeFrom = k + 3;
      }
    }
    if (k >= 2 && k % 2 === 0) {
      const free = lanes.findIndex((ln, i) => i > 0 && !ln.active && k >= ln.freeFrom);
      if (free > 0 && rnd(k * 1.7) < 0.7) {
        const back = 1 + Math.floor(rnd(k * 2.9) * 3);
        const parent = MAIN_AT[Math.max(0, k - back)];
        branchNo += 1;
        const ln = lanes[free];
        ln.active = true;
        ln.branch = branchNo;
        ln.until = k + 2 + Math.floor(rnd(k * 4.3) * 3);
        ln.head = add(k, free, parent, branchNo, k * 5 + free + 3);
      }
    }
  }
  FIRST_AT[TICKS + 1] = COMMITS.length;
})();

const T = 0.95;
const START = 0.8;
const SPACING = 150;
const X_HEAD = 1700;
const X_FADE = 820;
const R = 25;

const DUST = Array.from({ length: 90 }, (_, i) => ({
  x: rnd(i + 1000) * 1920,
  y: rnd(i + 2000) * 1080,
  r: 0.6 + rnd(i + 3000) * 1.8,
  ph: rnd(i + 4000) * 6.28,
  c: [C.lav, C.accentHi, C.mint, C.amber, C.pink][i % 5],
}));

const Outro: React.FC = () => {
  const { s, frame: f, fps } = useSteps();
  const clock = useClock();
  const t = Math.max(f / fps, clock);
  const credit = s(0, 90);
  const sweep = interpolate(f, [100, 150], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene = s(0, 24);

  const letters = (str: string, base: number) =>
    str.split("").map((ch, i) => {
      const p = s(0, base + i * 2, POP);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 50}px)` }}>
          {ch}
        </span>
      );
    });

  const now = (t - START) / T;
  const K = Math.max(-1, Math.min(TICKS, Math.floor(now)));
  const xAt = (k: number) => X_HEAD - (now - k) * SPACING;
  const fadeAt = (x: number) => clamp01((x - X_FADE) / 200);

  const edges: React.ReactNode[] = [];
  const flows: React.ReactNode[] = [];
  const nodes: React.ReactNode[] = [];
  const fx: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const laneHead: Record<number, number> = {};

  if (K >= 0) {
    const k0 = Math.max(0, K - 9);
    for (let i = FIRST_AT[k0]; i < FIRST_AT[K + 1]; i++) {
      const c = COMMITS[i];
      const age = now - c.k;
      const x = xAt(c.k);
      const y = LANE_Y[c.lane];
      const fade = fadeAt(x);
      const pop = clamp01(age / 0.22);
      const col = LANE_COLOR[c.lane];
      laneHead[c.lane] = i;
      if (c.parent >= 0) {
        const p = COMMITS[c.parent];
        const px = xAt(p.k);
        const py = LANE_Y[p.lane];
        const grow = clamp01(age / 0.3);
        const same = p.lane === c.lane;
        const d = same
          ? `M ${px + R} ${py} L ${px + R + (x - R - px - R) * grow} ${y}`
          : `M ${px} ${py} C ${px + 70} ${py}, ${x - 80} ${y}, ${px + (x - R - px) * grow} ${py + (y - py) * grow}`;
        const ef = Math.min(fade, fadeAt(px) * 0.6 + 0.4);
        edges.push(<path key={`eg${i}`} d={d} fill="none" stroke={col} strokeWidth={12} opacity={0.08 * ef} strokeLinecap="round" />);
        edges.push(<path key={`e${i}`} d={d} fill="none" stroke={col} strokeWidth={3} opacity={0.75 * ef} strokeLinecap="round" />);
        if (grow >= 1) {
          for (let j = 0; j < 2; j++) {
            const u = (((t * 0.9 + j * 0.5 + rnd(i)) % 1) + 1) % 1;
            const fx2 = same ? px + R + (x - R - px - R) * u : px + (x - px) * u;
            const fy2 = same ? y : py + (y - py) * (u * u * (3 - 2 * u));
            flows.push(<circle key={`f${i}-${j}`} cx={fx2} cy={fy2} r={3.5} fill={col} opacity={0.9 * ef} />);
          }
        }
        const mx = same ? (px + x) / 2 : px + (x - px) * 0.62;
        const my = same ? y - 30 : py + (y - py) * 0.62 - 26;
        const lc = !c.ok ? C.red : c.dep ? C.mint : C.amber;
        labels.push(
          <div
            key={`l${i}`}
            style={{
              position: "absolute",
              left: mx - 50,
              top: my - 14,
              width: 100,
              textAlign: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 19,
              color: lc,
              opacity: fadeAt(mx) * clamp01((age - 0.15) / 0.2),
              whiteSpace: "nowrap",
            }}
          >
            {`${c.dep ? "+" : "−"}${c.amt}${c.ok ? "" : " ✗"}`}
          </div>,
        );
        if (!same && age < 0.8) {
          const q = age / 0.8;
          fx.push(<circle key={`fk${i}`} cx={px} cy={py} r={R + 30 * q} fill="none" stroke={col} strokeWidth={3 * (1 - q)} opacity={0.9 * (1 - q)} />);
        }
      }
      if (age < 0.7) {
        const q = age / 0.7;
        fx.push(<circle key={`b${i}`} cx={x} cy={y} r={R + 46 * q} fill="none" stroke={col} strokeWidth={3 * (1 - q)} opacity={0.8 * (1 - q) * fade} />);
        for (let j = 0; j < 8; j++) {
          const a = (j / 8) * Math.PI * 2 + rnd(i * 3 + j);
          const dd = R + 60 * q;
          fx.push(<circle key={`bs${i}-${j}`} cx={x + Math.cos(a) * dd} cy={y + Math.sin(a) * dd} r={2.6 * (1 - q)} fill={col} opacity={(1 - q) * fade} />);
        }
      }
      nodes.push(
        <g key={`n${i}`} opacity={fade}>
          <circle cx={x} cy={y} r={R + 12} fill={col} opacity={0.1 + 0.3 * clamp01(1 - age)} />
          <circle cx={x} cy={y} r={R * (0.5 + 0.5 * pop)} fill={C.panel} stroke={col} strokeWidth={3} strokeDasharray={c.ok ? undefined : "5 4"} />
        </g>,
      );
      labels.push(
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            left: x - 40,
            top: y - 13,
            width: 80,
            textAlign: "center",
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: c.bal >= 1000 ? 15 : 18,
            lineHeight: "26px",
            color: C.text,
            opacity: fade * pop,
          }}
        >
          {c.bal}
        </div>,
      );
    }
    Object.entries(laneHead).forEach(([laneStr, idx]) => {
      const lane = Number(laneStr);
      const c = COMMITS[idx];
      if (now - c.k > 1.4 && lane !== 0) {
        return;
      }
      const x = xAt(c.k);
      const y = LANE_Y[lane];
      const col = LANE_COLOR[lane];
      labels.push(
        <div
          key={`tag${lane}`}
          style={{
            position: "absolute",
            left: x + R + 14,
            top: y - 15,
            padding: "2px 10px",
            borderRadius: 8,
            border: `2px solid ${col}`,
            background: `${col}22`,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 17,
            color: col,
            whiteSpace: "nowrap",
            opacity: fadeAt(x),
          }}
        >
          {lane === 0 ? "HEAD → main" : `alt-${c.branch}`}
        </div>,
      );
    });
  }

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 900,
          top: 80,
          width: 1100,
          height: 920,
          borderRadius: 460,
          background: "radial-gradient(ellipse at center, rgba(141,118,220,0.14) 0%, rgba(178,95,168,0.06) 40%, rgba(24,28,40,0) 70%)",
          opacity: scene,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: scene }}>
        {DUST.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={0.08 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.5 + d.ph))} />
        ))}
        {LANE_Y.map((y, i) => (
          <line key={i} x1={X_FADE} y1={y} x2={1900} y2={y} stroke={C.line} strokeWidth={1} strokeDasharray="2 12" opacity={0.6} />
        ))}
        <line x1={X_HEAD + 60} y1={180} x2={X_HEAD + 60} y2={940} stroke={C.accentHi} strokeWidth={2} strokeDasharray="4 8" opacity={0.35} />
        <defs>
          <linearGradient id="graphFade" gradientUnits="userSpaceOnUse" x1={X_FADE - 40} y1={0} x2={X_FADE + 160} y2={0}>
            <stop offset="0%" stopColor="#000000" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <mask id="graphMask">
            <rect x={0} y={0} width={1920} height={1080} fill="url(#graphFade)" />
          </mask>
        </defs>
        <g mask="url(#graphMask)">
          {edges}
          {flows}
          {nodes}
          {fx}
        </g>
      </svg>
      <div style={{ position: "absolute", left: X_HEAD + 30, top: 140, fontFamily: F.mono, fontSize: 18, color: C.dim, opacity: scene }}>зараз</div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: scene }}>{labels}</div>

      <div style={{ position: "absolute", left: 90, top: 150, fontFamily: F.head, fontWeight: 800, fontSize: 104, lineHeight: 1.12, color: C.text }}>
        <div>{letters("Дякую", 6)}</div>
        <div>{letters("за увагу!", 18)}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 430,
          height: 6,
          width: 440 * s(0, 36),
          borderRadius: 3,
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 480,
          width: 640,
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.3,
          color: C.dim,
          opacity: clamp01(s(0, 50)),
          transform: `translateY(${(1 - s(0, 50)) * 20}px)`,
        }}
      >
        Стан <span style={{ color: C.accentHi }}>змінюється</span>.
        <br />
        Значення залишаються <span style={{ color: C.mint }}>незмінними</span>.
      </div>

      <div style={{ position: "absolute", left: 96, top: 900, opacity: credit, transform: `translateY(${(1 - credit) * 16}px)` }}>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 2,
            backgroundImage: `linear-gradient(100deg, ${C.dim} 0%, ${C.dim} ${sweep - 12}%, #ffffff ${sweep}%, ${C.dim} ${sweep + 12}%, ${C.dim} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          made with Claude Opus 5.5
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const outroSlide: SlideDef = { id: "thanks", title: "Дякую за увагу", steps: [300], C: Outro };
