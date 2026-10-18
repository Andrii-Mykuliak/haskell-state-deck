import React from "react";
import { C, F } from "../deck/theme";
import { mix } from "../deck/steps";
import { clamp01 } from "./common";

export type Cmd = { kind: "Deposit" | "Withdraw"; n: number };

export const COMMANDS: Cmd[] = [
  { kind: "Deposit", n: 50 },
  { kind: "Withdraw", n: 20 },
  { kind: "Withdraw", n: 100 },
];
export const BALANCES = [0, 50, 30, 30];
export const DECISIONS = [true, true, false];

export const cmdColor = (c: Cmd) => (c.kind === "Deposit" ? C.mint : C.amber);

/** A command value such as `Deposit 50`. */
export const CmdChip: React.FC<{ cmd: Cmd; size?: number; glow?: number; style?: React.CSSProperties }> = ({ cmd, size = 26, glow = 0, style }) => {
  const c = cmdColor(cmd);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${size * 0.28}px ${size * 0.5}px`,
        borderRadius: size * 0.4,
        border: `2.5px solid ${c}`,
        background: `${c}1c`,
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: size,
        color: c,
        whiteSpace: "pre",
        fontVariantLigatures: "none",
        boxShadow: glow > 0.02 ? `0 0 ${24 * glow}px ${c}` : undefined,
        ...style,
      }}
    >
      {`${cmd.kind} ${cmd.n}`}
    </span>
  );
};

/** `Approved` or `Declined`. */
export const DecChip: React.FC<{ ok: boolean; size?: number; label?: string; glow?: number }> = ({ ok, size = 24, label, glow = 0 }) => {
  const c = ok ? C.mint : C.red;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.3,
        padding: `${size * 0.25}px ${size * 0.5}px`,
        borderRadius: size,
        background: `${c}22`,
        border: `2px solid ${c}`,
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: size,
        color: c,
        whiteSpace: "nowrap",
        boxShadow: glow > 0.02 ? `0 0 ${22 * glow}px ${c}` : undefined,
      }}
    >
      <span>{ok ? "✓" : "✗"}</span>
      <span>{label ?? (ok ? "Approved" : "Declined")}</span>
    </span>
  );
};

/** A balance value in a box. */
export const BalBox: React.FC<{ v: React.ReactNode; size?: number; color?: string; w?: number; h?: number; glow?: number; dashed?: boolean }> = ({
  v,
  size = 34,
  color = C.lav,
  w,
  h,
  glow = 0,
  dashed,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: w ?? size * 2.6,
      height: h ?? size * 2,
      padding: "0 12px",
      borderRadius: 12,
      border: `3px ${dashed ? "dashed" : "solid"} ${color}`,
      background: `${color}1f`,
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: size,
      color,
      boxSizing: "border-box",
      boxShadow: glow > 0.02 ? `0 0 ${26 * glow}px ${color}` : undefined,
    }}
  >
    {v}
  </span>
);

/** Gear outline used to mark a computing box. */
export const Gear: React.FC<{ size: number; angle?: number; color?: string }> = ({ size, angle = 0, color = C.amber }) => {
  const teeth = 8;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? 0.36 : 0.48;
    const a1 = a - 0.14;
    const a2 = a + 0.14;
    pts.push(`${50 + Math.cos(a1) * r * 100},${50 + Math.sin(a1) * r * 100}`);
    pts.push(`${50 + Math.cos(a2) * r * 100},${50 + Math.sin(a2) * r * 100}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${angle}deg)` }}>
      <polygon points={pts.join(" ")} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={50} cy={50} r={13} fill="none" stroke={color} strokeWidth={6} />
    </svg>
  );
};

/** A transition machine: rounded box with a label and a turning gear. */
export const Machine: React.FC<{ x: number; y: number; w: number; h: number; p: number; label: React.ReactNode; spin?: number; glow?: number; color?: string; size?: number }> = ({
  x,
  y,
  w,
  h,
  p,
  label,
  spin = 0,
  glow = 0,
  color = C.amber,
  size = 34,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 20,
      border: `3px solid ${color}`,
      background: `linear-gradient(180deg, ${color}1a, ${C.panel})`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: size,
      color,
      fontVariantLigatures: "none",
      boxShadow: glow > 0.02 ? `0 0 ${34 * glow}px ${color}` : undefined,
      opacity: clamp01(p),
      transform: `scale(${mix(0.7, 1, clamp01(p))})`,
    }}
  >
    <Gear size={size * 1.3} angle={spin} color={color} />
    <span>{label}</span>
  </div>
);
