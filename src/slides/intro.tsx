import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { At, HaskellLogo, Slide } from "../deck/ui";
import { AuthorBlock } from "../deck/Author";
import { clamp01, useClock } from "./common";
import { Gear } from "./bank";

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

/* Epigraph: moving parts hidden inside an object vs. a chain of values with no moving parts. */
const PANEL_Y = 318;
const PANEL_H = 330;
const OO_X = 110;
const FP_X = 1010;
const PANEL_W = 800;
const CHAIN = [0, 50, 30, 30];
const CHAIN_AT = 40;
const CHAIN_GAP = 26;
const QUOTE_STOP = CHAIN_AT + CHAIN.length * CHAIN_GAP + 60;

const MovingParts: React.FC = () => {
  const { s, frame, fps } = useSteps();
  const clock = useClock();
  const time = Math.max(frame / fps, clock);
  const oo = s(0, 20, POP);
  const fp = s(0, 30, POP);
  const tick = Math.floor(time * 1.4);
  const shown = [0, 50, 30, 80, 10, 60][tick % 6];
  const flick = 1 - ((time * 1.4) % 1);
  const gears = [
    { x: 150, y: 150, size: 150, speed: 70, color: C.amber },
    { x: 270, y: 210, size: 100, speed: -105, color: C.orange },
    { x: 250, y: 80, size: 80, speed: 130, color: C.amber },
  ];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: OO_X,
          top: PANEL_Y,
          width: PANEL_W,
          height: PANEL_H,
          borderRadius: 22,
          border: `3px solid ${C.amber}`,
          background: `linear-gradient(180deg, ${C.amber}12, ${C.panel})`,
          boxSizing: "border-box",
          overflow: "hidden",
          opacity: clamp01(oo),
          transform: `translateY(${(1 - oo) * 30}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 28, top: 20, fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.amber }}>OO: account : Account</div>
        <div style={{ position: "absolute", left: 28, top: 80, width: 380, height: 220, borderRadius: 16, background: "#10131c", border: `2px solid ${C.line}` }}>
          {gears.map((g, i) => (
            <div key={i} style={{ position: "absolute", left: g.x - g.size / 2 + 40, top: g.y - g.size / 2 - 40 }}>
              <Gear size={g.size} angle={time * g.speed} color={g.color} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 450, top: 110, fontFamily: F.mono, fontSize: 26, color: C.dim }}>balance =</div>
        <div
          style={{
            position: "absolute",
            left: 450,
            top: 152,
            width: 300,
            height: 110,
            borderRadius: 16,
            border: `3px solid ${C.red}`,
            background: `${C.red}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.mono,
            fontWeight: 800,
            fontSize: 64,
            color: C.text,
            boxShadow: `0 0 ${22 * flick}px ${C.red}`,
          }}
        >
          <span style={{ opacity: 0.4 + 0.6 * (1 - flick * 0.6) }}>{shown}</span>
        </div>
        <div style={{ position: "absolute", left: 450, top: 276, fontFamily: F.body, fontWeight: 600, fontSize: 22, color: C.red }}>значення перезаписується</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: FP_X,
          top: PANEL_Y,
          width: PANEL_W,
          height: PANEL_H,
          borderRadius: 22,
          border: `3px solid ${C.mint}`,
          background: `linear-gradient(180deg, ${C.mint}10, ${C.panel})`,
          boxSizing: "border-box",
          opacity: clamp01(fp),
          transform: `translateY(${(1 - fp) * 30}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 28, top: 20, fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.mint }}>FP: scanl advance 0 commands</div>
        {CHAIN.map((v, k) => {
          const p = s(0, CHAIN_AT + k * CHAIN_GAP, POP);
          return (
            <React.Fragment key={k}>
              {k > 0 && (
                <div style={{ position: "absolute", left: 40 + k * 190 - 52, top: 150, fontFamily: F.mono, fontSize: 40, color: C.faint, opacity: clamp01(p) }}>→</div>
              )}
              <div
                style={{
                  position: "absolute",
                  left: 40 + k * 190,
                  top: 128,
                  width: 130,
                  height: 100,
                  borderRadius: 16,
                  border: `3px solid ${C.lav}`,
                  background: `${C.lav}1c`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontWeight: 800,
                  fontSize: 44,
                  color: C.lav,
                  opacity: clamp01(p),
                  transform: `scale(${mix(0.6, 1, clamp01(p))})`,
                }}
              >
                {v}
              </div>
              <div style={{ position: "absolute", left: 40 + k * 190, width: 130, top: 238, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.dim, opacity: clamp01(p) }}>
                {`s${"₀₁₂₃"[k]}`}
              </div>
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", left: 40, top: 276, fontFamily: F.body, fontWeight: 600, fontSize: 22, color: C.mint, opacity: clamp01(s(0, CHAIN_AT + CHAIN.length * CHAIN_GAP)) }}>
          кожне значення лишається незмінним
        </div>
      </div>
    </>
  );
};

const QuoteSlide: React.FC = () => {
  const { s } = useSteps();
  const words = (str: string, base: number, color?: string) =>
    str.split(" ").map((w, i) => {
      const p = s(0, base + i * 3, POP);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)`, color }}>
          {w + " "}
        </span>
      );
    });
  return (
    <Slide>
      <MovingParts />
      <div style={{ position: "absolute", left: 110, top: 100, width: 1760, fontFamily: F.head, fontWeight: 800, fontSize: 50, lineHeight: 1.25, color: C.text, whiteSpace: "nowrap" }}>
        <div>
          {words("OO makes code understandable by", 4)}
          {words("encapsulating", 22, C.amber)}
          {words("moving parts.", 25)}
        </div>
        <div>
          {words("FP makes code understandable by", 34)}
          {words("minimizing", 52, C.mint)}
          {words("moving parts.", 55)}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 704,
          height: 6,
          width: mix(0, 420, s(1, 0)),
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
          borderRadius: 3,
        }}
      />
      <At x={110} y={730} w={1720} step={1} delay={6} size={40} weight={600} color={C.text}>
        ООП робить код зрозумілим, інкапсулюючи рухомі частини. ФП робить код зрозумілим, мінімізуючи рухомі частини.
      </At>
      <At x={110} y={880} step={1} delay={24} size={34} weight={400} color={C.dim} font={F.mono}>
        Michael Feathers
      </At>
      <At x={110} y={930} w={1600} step={1} delay={36} size={30} weight={400} color={C.dim}>
        Twitter, 3 листопада 2010
      </At>
    </Slide>
  );
};

const AGENDA = [
  "Стан і мутація",
  "Чиста функція переходу",
  "Послідовність команд",
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
