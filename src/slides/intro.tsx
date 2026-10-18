import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { At, HaskellLogo, Slide } from "../deck/ui";
import { AuthorBlock } from "../deck/Author";
import { clamp01, useClock } from "./common";

const TITLE_STATES = [0, 50, 30, 30];

const TitleSlide: React.FC = () => {
  const { s } = useSteps();
  const lines = ["Стан", "без мутації"];
  const letters = (str: string, base: number) =>
    str.split("").map((ch, i) => {
      const p = s(0, base + i * 1.4);
      return (
        <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 60}px)`, whiteSpace: "pre" }}>
          {ch}
        </span>
      );
    });
  return (
    <Slide>
      <div style={{ position: "absolute", right: 60, top: 70 }}>
        <HaskellLogo size={680} p1={s(0, 4, POP)} p2={s(0, 12, POP)} p3={s(0, 22, POP)} />
      </div>
      <At x={116} y={190} step={0} delay={8} size={60} weight={800} color={C.pink}>
        Лекція 9
      </At>
      <div style={{ position: "absolute", left: 110, top: 300, fontFamily: F.head, fontWeight: 800, fontSize: 112, lineHeight: 1.1, color: C.text }}>
        {lines.map((l, i) => (
          <div key={i}>{letters(l, 14 + i * 10)}</div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 566,
          height: 6,
          width: mix(0, 520, s(0, 50)),
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
          borderRadius: 3,
        }}
      />
      <div style={{ position: "absolute", left: 116, top: 612, display: "flex", alignItems: "center", gap: 18 }}>
        {TITLE_STATES.map((v, i) => {
          const p = s(0, 58 + i * 10, POP);
          return (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ fontFamily: F.mono, fontSize: 34, color: C.faint, opacity: clamp01(p) }}>→</span>}
              <span
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: clamp01(p),
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                <span
                  style={{
                    minWidth: 86,
                    height: 62,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: `3px solid ${C.lav}`,
                    background: `${C.lav}1f`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.mono,
                    fontWeight: 700,
                    fontSize: 32,
                    color: C.lav,
                    boxSizing: "border-box",
                  }}
                >
                  {v}
                </span>
                <span style={{ marginTop: 6, fontFamily: F.mono, fontSize: 22, color: C.dim }}>{`s${"₀₁₂₃"[i]}`}</span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <AuthorBlock />
    </Slide>
  );
};

/* Epigraph: a river that never stops, and snapshots of it that never change. */
const RIVER_Y = 560;
const CAP0 = 64;
const CAP_GAP = 30;
const SLOTS = 6;
const SLOT_W = 190;
const SLOT_GAP = 30;
const SLOT_X0 = (1920 - (SLOTS * SLOT_W + (SLOTS - 1) * SLOT_GAP)) / 2;
const SLOT_Y = 300;
const SLOT_H = 124;
const RISE = 22;
const QUOTE_STOP = CAP0 + (SLOTS - 1) * CAP_GAP + RISE + 40;
const WAVES = [
  { dy: -54, amp: 16, k: 0.011, w: 1.5, color: C.accent, op: 0.55 },
  { dy: -18, amp: 22, k: 0.008, w: 1.1, color: C.lav, op: 0.7 },
  { dy: 18, amp: 18, k: 0.013, w: 1.8, color: C.accentHi, op: 0.5 },
  { dy: 54, amp: 12, k: 0.016, w: 2.3, color: C.mint, op: 0.35 },
];

const waveY = (wv: (typeof WAVES)[number], x: number, time: number) =>
  RIVER_Y + wv.dy + wv.amp * Math.sin(wv.k * x - wv.w * time) + 6 * Math.sin(0.004 * x + 0.7 * time);

const wavePath = (wv: (typeof WAVES)[number], time: number, x0: number, x1: number, dx = 0, dy = 0, scale = 1) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 12) {
    pts.push(`${(x - x0) * scale + dx},${(waveY(wv, x, time) - RIVER_Y) * scale + dy}`);
  }
  return `M ${pts.join(" L ")}`;
};

const River: React.FC = () => {
  const { s, frame, fps } = useSteps();
  const clock = useClock();
  const time = Math.max(frame / fps, clock);
  const on = clamp01(s(0, 8));
  const drops = Array.from({ length: 34 }, (_, i) => {
    const speed = 90 + ((i * 37) % 60);
    const x = ((i * 211 + time * speed) % 2100) - 90;
    const wv = WAVES[i % WAVES.length];
    return { x, y: waveY(wv, x, time) + ((i * 13) % 20) - 10, r: 2 + (i % 3), c: wv.color };
  });
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: on }}>
        <defs>
          <linearGradient id="riverBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity={0} />
            <stop offset="50%" stopColor={C.accent} stopOpacity={0.12} />
            <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={RIVER_Y - 110} width={1920} height={220} fill="url(#riverBand)" />
        {WAVES.map((wv, i) => (
          <path key={i} d={wavePath(wv, time, -20, 1940, -20, RIVER_Y)} fill="none" stroke={wv.color} strokeWidth={3} opacity={wv.op} strokeLinecap="round" />
        ))}
        {drops.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={0.55} />
        ))}
      </svg>
      {Array.from({ length: SLOTS }, (_, k) => {
        const capAt = CAP0 + k * CAP_GAP;
        const capTime = capAt / fps;
        const x = SLOT_X0 + k * (SLOT_W + SLOT_GAP);
        const cx = x + SLOT_W / 2;
        const since = frame - capAt;
        const flash = since >= 0 && since < 18 ? 1 - since / 18 : 0;
        const rise = s(0, capAt, POP);
        const y = mix(RIVER_Y - SLOT_H / 2, SLOT_Y, clamp01(rise));
        const shown = since >= 0;
        return (
          <React.Fragment key={k}>
            {flash > 0 && (
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                <circle cx={cx} cy={RIVER_Y} r={30 + 90 * (1 - flash)} fill="none" stroke="#ffffff" strokeWidth={4 * flash} opacity={flash} />
                <circle cx={cx} cy={RIVER_Y} r={40 * flash} fill="#ffffff" opacity={0.35 * flash} />
              </svg>
            )}
            <div
              style={{
                position: "absolute",
                left: SLOT_X0 + k * (SLOT_W + SLOT_GAP),
                top: SLOT_Y,
                width: SLOT_W,
                height: SLOT_H,
                borderRadius: 14,
                border: `2px dashed ${C.line}`,
                boxSizing: "border-box",
                opacity: on * (shown ? 0 : 0.6),
              }}
            />
            {shown && (
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: SLOT_W,
                  height: SLOT_H,
                  borderRadius: 14,
                  border: `3px solid ${C.lav}`,
                  background: C.panel,
                  boxSizing: "border-box",
                  overflow: "hidden",
                  boxShadow: `0 0 ${24 * flash}px #ffffff`,
                  transform: `scale(${mix(0.6, 1, clamp01(rise))})`,
                }}
              >
                <svg width={SLOT_W} height={SLOT_H} style={{ position: "absolute", left: 0, top: 0 }}>
                  {WAVES.map((wv, i) => (
                    <path
                      key={i}
                      d={wavePath(wv, capTime, cx - 150, cx + 150, 0, SLOT_H / 2 - 8, SLOT_W / 300)}
                      fill="none"
                      stroke={wv.color}
                      strokeWidth={2}
                      opacity={wv.op}
                    />
                  ))}
                </svg>
                <div style={{ position: "absolute", left: 10, bottom: 6, fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: C.text }}>{`s${"₀₁₂₃₄₅"[k]}`}</div>
                <div style={{ position: "absolute", right: 10, bottom: 8, fontFamily: F.mono, fontSize: 18, color: C.dim }}>{`t${"₀₁₂₃₄₅"[k]}`}</div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const QuoteSlide: React.FC = () => {
  const { s } = useSteps();
  const words = (str: string, base: number, color?: string) =>
    str.split(" ").map((w, i) => {
      const p = s(0, base + i * 3.5, POP);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)`, color }}>
          {w + " "}
        </span>
      );
    });
  return (
    <Slide>
      <River />
      <div style={{ position: "absolute", left: 110, top: 92, width: 1720, fontFamily: F.head, fontWeight: 800, fontSize: 60, lineHeight: 1.22, color: C.text }}>
        <div>{words("All things are in motion and nothing at rest;", 4)}</div>
        <div>
          {words("you cannot go into the", 34)}
          {words("same water", 52, C.accentHi)}
          {words("twice.", 60)}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 724,
          height: 6,
          width: mix(0, 420, s(1, 0)),
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
          borderRadius: 3,
        }}
      />
      <At x={110} y={752} w={1700} step={1} delay={6} size={42} weight={600} color={C.text}>
        Усе рухається, і ніщо не стоїть на місці: у ту саму воду не можна ввійти двічі.
      </At>
      <At x={110} y={850} step={1} delay={24} size={34} weight={400} color={C.dim} font={F.mono}>
        Heraclitus
      </At>
      <At x={110} y={900} w={1600} step={1} delay={36} size={30} weight={400} color={C.dim}>
        у переказі Платона, «Кратил», 402a; пер. Б. Джоуетта
      </At>
    </Slide>
  );
};

const AGENDA = [
  "Стан і мутація",
  "Чиста функція переходу",
  "Послідовність команд і стан у потоках",
  "Замикання і збережений контекст",
  "Абстракція State",
];

const Agenda: React.FC<{ active?: number }> = ({ active }) => {
  const { s } = useSteps();
  const full = active === undefined;
  const Y0 = 230;
  const GAP = 126;
  const hl = full ? 0 : s(0, 6);
  return (
    <Slide title="План">
      {AGENDA.map((item, i) => {
        const p = full ? s(0, 8 + i * 5, POP) : 1;
        const on = full ? 1 : i === active ? s(0, 10) : 0;
        const dim = full ? 1 : i === active ? 1 : 0.35;
        const isActive = !full && i === active;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 84,
              top: Y0 + i * GAP,
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "12px 34px 12px 20px",
              opacity: p * dim,
              transform: `translateX(${(1 - p) * -40}px)`,
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 14,
                  background: "rgba(141,118,220,0.13)",
                  border: `2px solid rgba(141,118,220,${0.5 * hl})`,
                  clipPath: `inset(0 ${(1 - hl) * 100}% 0 0 round 14px)`,
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                width: 76,
                height: 64,
                borderRadius: 8,
                background: i % 2 ? "#5e5086" : C.pink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 40,
                color: C.text,
                flexShrink: 0,
                boxShadow: on ? `0 0 ${30 * on}px rgba(178,95,168,${0.6 * on})` : undefined,
                transform: `scale(${1 + 0.12 * on})`,
              }}
            >
              {i + 1}
            </div>
            <div style={{ position: "relative", fontFamily: F.body, fontSize: 48, fontWeight: on ? 700 : 400, color: C.text, whiteSpace: "nowrap" }}>
              {item}
            </div>
          </div>
        );
      })}
    </Slide>
  );
};

export const introSlides: SlideDef[] = [
  { id: "title", title: "Титул", steps: [110], C: TitleSlide },
  { id: "quote", title: "Епіграф", steps: [QUOTE_STOP, 120], C: QuoteSlide },
  { id: "agenda", title: "План", steps: [60], C: () => <Agenda /> },
];

export const agendaSlide = (active: number): SlideDef => ({
  id: `agenda-${active + 1}`,
  title: `План ${active + 1}`,
  steps: [40],
  C: () => <Agenda active={active} />,
});
