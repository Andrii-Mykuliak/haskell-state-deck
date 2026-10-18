import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, F } from "../deck/theme";
import { POP, SlideDef, useSteps } from "../deck/steps";
import { clamp01, useClock } from "./common";

const rnd = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const N = 4000;
const KIND: boolean[] = [];
const AMT: number[] = [];
const OK: boolean[] = [];
const BAL: number[] = [0];
for (let k = 1; k <= N; k++) {
  const dep = rnd(k * 3.1) < 0.58;
  const amt = dep ? 10 + Math.floor(rnd(k * 5.7) * 6) * 10 : 10 + Math.floor(rnd(k * 9.3) * 6) * 10;
  const ok = dep || amt <= BAL[k - 1];
  KIND[k] = dep;
  AMT[k] = amt;
  OK[k] = ok;
  BAL[k] = ok ? (dep ? BAL[k - 1] + amt : BAL[k - 1] - amt) : BAL[k - 1];
}

const PERIOD = 0.85;
const FLY = 0.8;
const START = 0.9;
const CX = 1330;
const CY = 540;
const VISIBLE = 22;
const BURST = 0.7;

const posAt = (age: number, time: number) => {
  const r = 80 + 44 * age;
  const th = -Math.PI / 2 + age * 0.55 + time * 0.07;
  return { x: CX + Math.cos(th) * r, y: CY + Math.sin(th) * r * 0.86 };
};

const DUST = Array.from({ length: 110 }, (_, i) => ({
  x: rnd(i + 1000) * 1920,
  y: rnd(i + 2000) * 1080,
  r: 0.6 + rnd(i + 3000) * 2,
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

  const K = Math.max(0, Math.min(N, Math.floor((t - START) / PERIOD)));
  const live = t >= START;
  const k0 = Math.max(0, K - VISIBLE);
  const nodes: React.ReactNode[] = [];
  const arm: React.ReactNode[] = [];
  const fx: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  let centerKick = 0;
  const hub = posAt(0, t);

  if (live) {
    for (let k = k0; k <= K; k++) {
      const born = START + k * PERIOD;
      const age = (t - born) / PERIOD;
      const p = posAt(age, t);
      const fade = age < 10 ? 1 : Math.max(0, 1 - (age - 10) / 6);
      const pop = clamp01(age / 0.25);
      const r = (31 - Math.min(age, 16) * 1.2) * (0.4 + 0.6 * pop);
      const declined = k > 0 && !OK[k];
      const col = k === 0 ? C.lav : declined ? C.red : KIND[k] ? C.mint : C.amber;
      nodes.push(
        <g key={`n${k}`} opacity={fade}>
          <circle cx={p.x} cy={p.y} r={r + 22} fill={col} opacity={0.14 + 0.4 * (1 - clamp01(age))} />
          <circle cx={p.x} cy={p.y} r={r} fill={C.panel} stroke={col} strokeWidth={3} strokeDasharray={declined ? "6 5" : undefined} />
        </g>,
      );
      if (age < 12 && r > 12) {
        labels.push(
          <div
            key={`t${k}`}
            style={{
              position: "absolute",
              left: p.x - 50,
              top: p.y - 14,
              width: 100,
              textAlign: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: Math.max(12, r * 0.72),
              lineHeight: "28px",
              color: C.text,
              opacity: fade * pop,
            }}
          >
            {BAL[k]}
          </div>,
        );
      }
      const since = t - born;
      if (k > 0 && since >= 0 && since < BURST) {
        const q = since / BURST;
        centerKick = Math.max(centerKick, 1 - q);
        fx.push(<circle key={`flash${k}`} cx={hub.x} cy={hub.y} r={70 * (1 - q) + 10} fill="#ffffff" opacity={0.35 * (1 - q) * (1 - q)} />);
        fx.push(<circle key={`ring${k}`} cx={hub.x} cy={hub.y} r={30 + 200 * q} fill="none" stroke={col} strokeWidth={4 * (1 - q)} opacity={0.85 * (1 - q)} />);
        fx.push(<circle key={`ring2${k}`} cx={hub.x} cy={hub.y} r={20 + 120 * q} fill="none" stroke="#ffffff" strokeWidth={2 * (1 - q)} opacity={0.5 * (1 - q)} />);
        for (let j = 0; j < 22; j++) {
          const a = (j / 22) * Math.PI * 2 + rnd(k * 11 + j) * 0.6;
          const d = 40 + 230 * (1 - (1 - q) * (1 - q)) * (0.5 + 0.7 * rnd(k * 13 + j));
          fx.push(<circle key={`sp${k}-${j}`} cx={hub.x + Math.cos(a) * d} cy={hub.y + Math.sin(a) * d} r={3.2 * (1 - q) + 0.5} fill={j % 3 ? col : "#ffffff"} opacity={1 - q} />);
          if (j % 2 === 0) {
            fx.push(<line key={`st${k}-${j}`} x1={hub.x + Math.cos(a) * d * 0.7} y1={hub.y + Math.sin(a) * d * 0.7} x2={hub.x + Math.cos(a) * d} y2={hub.y + Math.sin(a) * d} stroke={col} strokeWidth={2} opacity={0.6 * (1 - q)} />);
          }
        }
      }
    }
    const maxAge = Math.min(16, (t - (START + k0 * PERIOD)) / PERIOD);
    const pts: { x: number; y: number }[] = [];
    for (let a = 0; a <= maxAge; a += 0.1) {
      pts.push(posAt(a, t));
    }
    for (let i = 0; i + 1 < pts.length; i += 3) {
      const seg = pts.slice(i, i + 4);
      const a = i * 0.1;
      const fade = a < 10 ? 1 : Math.max(0, 1 - (a - 10) / 6);
      const d = `M ${seg.map((q) => `${q.x},${q.y}`).join(" L ")}`;
      arm.push(<path key={`ag${i}`} d={d} fill="none" stroke={C.accentHi} strokeWidth={16} opacity={0.07 * fade} strokeLinecap="round" />);
      arm.push(<path key={`ac${i}`} d={d} fill="none" stroke={C.lav} strokeWidth={2.5} opacity={0.45 * fade} strokeLinecap="round" />);
    }
    if (pts.length > 1) {
      arm.push(
        <path
          key="flow"
          d={`M ${pts.map((q) => `${q.x},${q.y}`).join(" L ")}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={3}
          strokeDasharray="2 16"
          strokeDashoffset={-t * 60}
          opacity={0.45}
          strokeLinecap="round"
        />,
      );
    }
    for (let k = Math.max(1, K - 1); k <= Math.min(N, K + 2); k++) {
      const born = START + k * PERIOD;
      const u = (t - (born - FLY)) / FLY;
      if (u < 0 || u >= 1) {
        continue;
      }
      const phi = rnd(k * 7.7) * Math.PI * 2;
      const R0 = 560;
      const head = (v: number) => {
        const e = v * v;
        return { x: hub.x + Math.cos(phi) * R0 * (1 - e), y: hub.y + Math.sin(phi) * R0 * 0.8 * (1 - e) };
      };
      const col = !OK[k] ? C.red : KIND[k] ? C.mint : C.amber;
      const hd = head(u);
      for (let j = 16; j >= 1; j--) {
        const v = Math.max(0, u - j * 0.02);
        const q = head(v);
        fx.push(<circle key={`c${k}-${j}`} cx={q.x} cy={q.y} r={9 * (1 - j / 17)} fill={col} opacity={0.6 * (1 - j / 17)} />);
      }
      fx.push(
        <g key={`ch${k}`}>
          <circle cx={hd.x} cy={hd.y} r={30} fill={col} opacity={0.2} />
          <circle cx={hd.x} cy={hd.y} r={10} fill={col} />
          <circle cx={hd.x} cy={hd.y} r={4} fill="#ffffff" />
        </g>,
      );
      labels.push(
        <div
          key={`cl${k}`}
          style={{
            position: "absolute",
            left: hd.x + 16,
            top: hd.y - 36,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 26,
            color: col,
            textShadow: `0 0 12px ${col}`,
            opacity: clamp01(u * 4) * clamp01((1 - u) * 6),
            whiteSpace: "nowrap",
          }}
        >
          {`${KIND[k] ? "+" : "−"}${AMT[k]}`}
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: CX - 560,
          top: CY - 560,
          width: 1120,
          height: 1120,
          borderRadius: 560,
          background: `radial-gradient(circle, rgba(141,118,220,${0.2 + 0.12 * centerKick}) 0%, rgba(178,95,168,0.08) 35%, rgba(24,28,40,0) 68%)`,
          opacity: scene,
        }}
      />
      {[
        { x: CX + 260 + 120 * Math.sin(t * 0.17), y: CY - 180 + 90 * Math.cos(t * 0.21), c: "178,95,168", a: 0.16 },
        { x: CX - 260 + 140 * Math.cos(t * 0.13 + 1), y: CY + 200 + 80 * Math.sin(t * 0.19), c: "134,224,168", a: 0.09 },
        { x: CX + 120 + 100 * Math.cos(t * 0.11 + 2), y: CY + 260 + 70 * Math.sin(t * 0.15 + 1), c: "242,193,125", a: 0.08 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - 480,
            top: b.y - 480,
            width: 960,
            height: 960,
            borderRadius: 480,
            background: `radial-gradient(circle, rgba(${b.c},${b.a}) 0%, rgba(${b.c},0) 62%)`,
            opacity: scene,
          }}
        />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: scene }}>
        {DUST.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={0.1 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.5 + d.ph))} />
        ))}
        <ellipse cx={CX} cy={CY} rx={470} ry={404} fill="none" stroke={C.line} strokeWidth={1.5} strokeDasharray="4 16" transform={`rotate(${t * 4} ${CX} ${CY})`} />
        <ellipse cx={CX} cy={CY} rx={300} ry={258} fill="none" stroke={C.line} strokeWidth={1.2} strokeDasharray="2 12" transform={`rotate(${-t * 6} ${CX} ${CY})`} />
        {arm}
        {nodes}
        {fx}
      </svg>
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
