import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { clamp01, pulse } from "./common";
import { SyntaxBox } from "./kit";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

const Box: React.FC<{ children: React.ReactNode; color?: string; w?: number; h?: number; size?: number; glow?: number; dashed?: boolean }> = ({
  children,
  color = C.lav,
  w = 110,
  h = 64,
  size = 28,
  glow = 0,
  dashed,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: w,
      height: h,
      borderRadius: 12,
      border: `3px ${dashed ? "dashed" : "solid"} ${color}`,
      background: `${color}1c`,
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: size,
      color,
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      boxShadow: glow > 0.02 ? `0 0 ${26 * glow}px ${color}` : undefined,
    }}
  >
    {children}
  </span>
);

/* Стан у потоках: той самий прийом */
const UNROLL = [0, 1, 2, 3];

const Unroll: React.FC = () => {
  const { s, t } = useSteps();
  const loopFade = mix(1, 0.25, s(2, 0));
  const spin = Math.max(0, t(1, 0)) * 3;
  const XS = 700;
  const GAPX = 330;
  const Y = 540;
  const examples = [
    { name: "Турнікет", tool: "scanl", color: C.amber },
    { name: "Рекорди", tool: "scanl1", color: C.mint },
    { name: "Випадкові числа", tool: "iterate", color: C.pink },
    { name: "Фібоначчі", tool: "iterate", color: C.accentHi },
  ];
  return (
    <Slide title="Стан у потоках: той самий прийом">
      <Lead>Стан – це значення, яке передається від одного кроку обробки до наступного. Так обробляють будь-які потоки, не лише банківські команди.</Lead>
      <div style={{ position: "absolute", left: 110, top: 430, width: 470, height: 300, opacity: clamp01(s(1, 0)) * loopFade }}>
        <svg width={470} height={300} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`rotate(${spin} 235 150)`}>
            <circle cx={235} cy={150} r={120} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="16 12" />
            <polygon points="355,150 343,128 367,128" fill={C.red} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 160, top: 112, width: 150, height: 76, borderRadius: 16, border: `3px solid ${C.red}`, background: C.panel, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body, fontWeight: 800, fontSize: 28, color: C.red }}>
          крок
        </div>
        <div style={{ position: "absolute", left: 0, top: 278, width: 470, textAlign: "center", fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.red }}>
          цикл, що змінює одну змінну
        </div>
      </div>
      {UNROLL.map((k) => {
        const p = s(2, k * 14, POP);
        const x = XS + k * GAPX;
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: x, top: Y, ...appear(p) }}>
              <Box w={130} h={80} size={34}>{`s${"₀₁₂₃"[k]}`}</Box>
            </div>
            {k < UNROLL.length - 1 && (
              <>
                <div style={{ position: "absolute", left: x + 160, top: Y + 12, ...appear(s(2, k * 14 + 7, POP)) }}>
                  <Box color={C.amber} w={140} h={56} size={26}>
                    крок
                  </Box>
                </div>
                <div style={{ position: "absolute", left: x + 214, top: Y - 70, fontFamily: F.mono, fontSize: 28, color: C.dim, ...appear(s(2, k * 14 + 7)) }}>
                  {`x${"₁₂₃"[k]}`}
                </div>
                <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(2, k * 14 + 7)) }}>
                  <line x1={x + 230} y1={Y - 30} x2={x + 230} y2={Y + 6} stroke={C.dim} strokeWidth={2.5} />
                  <line x1={x + 230} y1={Y + 74} x2={x + 230} y2={Y + 110} stroke={C.dim} strokeWidth={2.5} />
                </svg>
                <div style={{ position: "absolute", left: x + 214, top: Y + 114, fontFamily: F.mono, fontSize: 28, color: C.mint, ...appear(s(2, k * 14 + 10)) }}>
                  {`y${"₁₂₃"[k]}`}
                </div>
              </>
            )}
          </React.Fragment>
        );
      })}
      <At x={XS} y={Y + 180} w={1100} step={2} delay={50} size={28} weight={600} color={C.lav}>
        розгорнутий цикл: кожен стан – нове значення
      </At>
      {examples.map((e, i) => {
        const p = s(3, i * 8, POP);
        return (
          <div
            key={e.name}
            style={{
              position: "absolute",
              left: 96 + i * 435,
              top: 800,
              width: 405,
              height: 100,
              borderRadius: 16,
              border: `2px solid ${e.color}`,
              background: `${e.color}12`,
              boxSizing: "border-box",
              padding: "14px 22px",
              ...appear(p, 16),
            }}
          >
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 28, color: C.text }}>{`${i + 1}. ${e.name}`}</div>
            <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 24, color: e.color }}>{e.tool}</div>
          </div>
        );
      })}
    </Slide>
  );
};

/* Приклад 1: турнікет */
const EVENTS = ["Coin", "Push", "Push", "Coin", "Coin"] as const;
const TRACE = ["Locked", "Unlocked", "Locked", "Locked", "Unlocked", "Unlocked"];
const EV_GAP = 30;

const Turnstile: React.FC = () => {
  const { s, t } = useSteps();
  const curIdx = EVENTS.reduce((acc, _, i) => (t(2, i * EV_GAP + 14) >= 0 ? i + 1 : acc), 0);
  const cur = TRACE[curIdx];
  const LX = 1290;
  const UX = 1650;
  const CY = 470;
  const R = 82;
  const glowL = cur === "Locked" ? 1 : 0;
  const glowU = cur === "Unlocked" ? 1 : 0;
  const flash = Math.max(...EVENTS.map((_, i) => pulse(t(2, i * EV_GAP + 14), 4, 12)));
  const node = (x: number, label: string, color: string, g: number) => (
    <div
      style={{
        position: "absolute",
        left: x - R,
        top: CY - R,
        width: R * 2,
        height: R * 2,
        borderRadius: R,
        border: `3px solid ${color}`,
        background: g ? `${color}26` : C.panel,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: 26,
        color,
        boxShadow: g ? `0 0 ${18 + 26 * flash}px ${color}` : undefined,
        ...appear(s(1, 30, POP)),
      }}
    >
      {label}
    </div>
  );
  return (
    <Slide title="Приклад 1: турнікет">
      <Lead>
        Скінченний автомат: стан – <M c={C.red}>Locked</M> або <M>Unlocked</M>, подія – <M c={C.amber}>Coin</M> або <M c={C.lav}>Push</M>.
      </Lead>
      <Code
        x={96}
        y={300}
        size={28}
        lh={40}
        step={1}
        stagger={6}
        code={`
          data Turnstile = Locked | Unlocked deriving Show
          data Event = Coin | Push
          next :: Turnstile -> Event -> Turnstile
          next Locked   Coin = Unlocked
          next Unlocked Push = Locked
          next state    _    = state
          @2 scanl next Locked [Coin, Push, Push, Coin, Coin]
        `}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(1, 34)) }}>
        <path d={`M ${LX + 50} ${CY - 66} Q ${(LX + UX) / 2} ${CY - 170} ${UX - 50} ${CY - 66}`} fill="none" stroke={C.amber} strokeWidth={3} />
        <polygon points={`${UX - 46},${CY - 62} ${UX - 66},${CY - 68} ${UX - 54},${CY - 84}`} fill={C.amber} />
        <path d={`M ${UX - 50} ${CY + 66} Q ${(LX + UX) / 2} ${CY + 170} ${LX + 50} ${CY + 66}`} fill="none" stroke={C.lav} strokeWidth={3} />
        <polygon points={`${LX + 46},${CY + 62} ${LX + 66},${CY + 68} ${LX + 54},${CY + 84}`} fill={C.lav} />
        <path d={`M ${LX - 70} ${CY - 40} C ${LX - 170} ${CY - 90}, ${LX - 170} ${CY + 90}, ${LX - 70} ${CY + 40}`} fill="none" stroke={C.lav} strokeWidth={2.5} strokeDasharray="6 6" />
        <path d={`M ${UX + 70} ${CY - 40} C ${UX + 170} ${CY - 90}, ${UX + 170} ${CY + 90}, ${UX + 70} ${CY + 40}`} fill="none" stroke={C.amber} strokeWidth={2.5} strokeDasharray="6 6" />
      </svg>
      <At x={(LX + UX) / 2 - 130} y={CY - 168} w={260} step={1} delay={36} size={24} weight={700} color={C.amber} font={F.mono} align="center">
        Coin <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 20, color: C.dim }}>(монета)</span>
      </At>
      <At x={(LX + UX) / 2 - 130} y={CY + 130} w={260} step={1} delay={36} size={24} weight={700} color={C.lav} font={F.mono} align="center">
        Push <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 20, color: C.dim }}>(прохід)</span>
      </At>
      <At x={LX - 220} y={CY - 16} w={80} step={1} delay={36} size={20} weight={700} color={C.lav} font={F.mono}>
        Push
      </At>
      <At x={UX + 150} y={CY - 16} w={80} step={1} delay={36} size={20} weight={700} color={C.amber} font={F.mono}>
        Coin
      </At>
      {node(LX, "Locked", C.red, glowL)}
      {node(UX, "Unlocked", C.mint, glowU)}
      <At x={96} y={684} step={2} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        ПОДІЇ
      </At>
      <At x={96} y={784} step={2} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        СТАНИ
      </At>
      {EVENTS.map((e, i) => {
        const p = s(2, i * EV_GAP, POP);
        return (
          <div key={i} style={{ position: "absolute", left: 360 + i * 250 + 125, top: 670, ...appear(p) }}>
            <Box color={e === "Coin" ? C.amber : C.lav} w={130} h={52} size={24} glow={pulse(t(2, i * EV_GAP + 14), 4, 12)}>
              {e}
            </Box>
          </div>
        );
      })}
      {TRACE.map((st, i) => {
        const p = i === 0 ? s(2, 0, POP) : s(2, (i - 1) * EV_GAP + 14, POP);
        return (
          <div key={i} style={{ position: "absolute", left: 360 + i * 250, top: 770, ...appear(p) }}>
            <Box color={st === "Locked" ? C.red : C.mint} w={190} h={56} size={24}>
              {st}
            </Box>
          </div>
        );
      })}
      <At x={96} y={900} w={1720} step={3} size={30} weight={600}>
        <M>scanl</M> повертає <A>всю траєкторію</A> автомата: жоден стан не перезаписано, кожен можна переглянути й перевірити.
      </At>
    </Slide>
  );
};

/* Приклад 2: рекорди */
const READ = [3, 1, 4, 1, 5, 9, 2, 6];
const RUNMAX = READ.reduce<number[]>((acc, v) => [...acc, Math.max(acc[acc.length - 1] ?? -Infinity, v)], []);
const BAR_GAP = 26;

const Records: React.FC = () => {
  const { s, t } = useSteps();
  const X0 = 200;
  const P = 190;
  const W = 110;
  const BASE = 830;
  const U = 34;
  const lineUpTo = READ.reduce((acc, _, i) => (t(2, i * BAR_GAP + 8) >= 0 ? i : acc), -1);
  const pts: string[] = [];
  for (let i = 0; i <= lineUpTo; i++) {
    const y = BASE - RUNMAX[i] * U;
    pts.push(`${X0 + i * P - 20},${y}`, `${X0 + i * P + W + 20},${y}`);
  }
  return (
    <Slide title="Приклад 2: рекорди в потоці вимірювань">
      <Lead>Стан – найбільше значення, яке траплялося досі.</Lead>
      <SyntaxBox x={96} y={290} w={1060} step={1} size={26} lines={["scanl1 {f} [{x1}, {x2}, …]   -- як scanl, стан починається з {x1}"]} />
      <Code x={96} y={410} size={32} step={1} delay={20} code={`scanl1 max [3, 1, 4, 1, 5, 9, 2, 6]   -- [3,3,4,4,5,9,9,9]`} />
      {READ.map((v, i) => {
        const p = s(2, i * BAR_GAP, POP);
        const isRecord = i === 0 || v > RUNMAX[i - 1];
        const hot = isRecord ? pulse(t(2, i * BAR_GAP + 8), 6, 18) : 0;
        const h = v * U * clamp01(p);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: X0 + i * P,
                top: BASE - h,
                width: W,
                height: h,
                borderRadius: "10px 10px 0 0",
                background: isRecord ? `linear-gradient(180deg, ${C.amber}, ${C.amber}55)` : `linear-gradient(180deg, ${C.lav}aa, ${C.lav}33)`,
                boxShadow: hot > 0.02 ? `0 0 ${40 * hot}px ${C.amber}` : undefined,
              }}
            />
            <div style={{ position: "absolute", left: X0 + i * P, width: W, top: BASE + 10, textAlign: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: C.text, opacity: clamp01(p) }}>
              {v}
            </div>
            {isRecord && (
              <div
                style={{
                  position: "absolute",
                  left: X0 + i * P - 20,
                  width: W + 40,
                  top: BASE - v * U - 46,
                  textAlign: "center",
                  fontFamily: F.body,
                  fontWeight: 800,
                  fontSize: 20,
                  color: C.amber,
                  letterSpacing: 1,
                  ...appear(s(2, i * BAR_GAP + 10, POP), 10),
                }}
              >
                РЕКОРД
              </div>
            )}
          </React.Fragment>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {pts.length > 0 && <polyline points={pts.join(" ")} fill="none" stroke={C.mint} strokeWidth={4} strokeDasharray="10 6" strokeLinejoin="round" />}
        <line x1={X0 - 40} y1={BASE} x2={X0 + 7 * P + W + 40} y2={BASE} stroke={C.line} strokeWidth={3} />
      </svg>
      <At x={X0 + 7 * P + W + 50} y={BASE - 9 * U - 16} step={2} delay={7 * BAR_GAP + 20} size={24} weight={700} color={C.mint}>
        стан: max досі
      </At>
      <At x={96} y={910} w={1720} step={3} size={30} weight={600}>
        Жодної змінної «поточний максимум»: кожне значення стану – <A>окремий елемент</A> нового списку.
      </At>
    </Slide>
  );
};

/* Приклад 3: псевдовипадкові числа */
const SEQ = [7, 6, 1, 8, 11, 10, 5, 12];
const HOP = 26;

const Random: React.FC = () => {
  const { s, t } = useSteps();
  const CX = 1440;
  const CY = 600;
  const R = 220;
  const pos = (n: number, r = R) => {
    const a = (n / 16) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
  };
  const visited = SEQ.map((_, i) => t(2, i * HOP) >= 0);
  return (
    <Slide title="Приклад 3: псевдовипадкові числа">
      <Lead>Зерно генератора (seed) – це стан, який передається від числа до числа.</Lead>
      <SyntaxBox x={96} y={290} w={900} step={1} size={24} title="Нагадування" lines={["iterate {f} {x} = [{x}, {f} {x}, {f} ({f} {x}), …]"]} />
      <Code
        x={96}
        y={410}
        size={30}
        step={1}
        delay={20}
        stagger={8}
        code={`
          next :: Int -> Int
          next seed = (5 * seed + 3) \`mod\` 16
          take 8 (iterate next 7)
          -- [7,6,1,8,11,10,5,12]
        `}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(1, 10)) }}>
        <circle cx={CX} cy={CY} r={R + 40} fill="none" stroke={C.line} strokeWidth={2} />
        {SEQ.slice(1).map((n, i) => {
          const a = pos(SEQ[i], R - 30);
          const b = pos(n, R - 30);
          const k = clamp01(t(2, (i + 1) * HOP - 14) / 14);
          if (k <= 0) {
            return null;
          }
          const mx = (a.x + b.x) / 2 + (CX - (a.x + b.x) / 2) * 0.5;
          const my = (a.y + b.y) / 2 + (CY - (a.y + b.y) / 2) * 0.5;
          const qx = mix(mix(a.x, mx, k), mix(mx, b.x, k), k);
          const qy = mix(mix(a.y, my, k), mix(my, b.y, k), k);
          return (
            <g key={i}>
              <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke={C.pink} strokeWidth={2.5} opacity={0.55} strokeDasharray={k < 1 ? `${k * 600} 600` : undefined} />
              {k < 1 && <circle cx={qx} cy={qy} r={9} fill={C.pink} />}
            </g>
          );
        })}
      </svg>
      {Array.from({ length: 16 }, (_, n) => {
        const p = pos(n);
        const order = SEQ.indexOf(n);
        const on = order >= 0 && visited[order];
        const hot = order >= 0 ? pulse(t(2, order * HOP), 4, 14) : 0;
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: p.x - 30,
              top: p.y - 30,
              width: 60,
              height: 60,
              borderRadius: 30,
              border: `2.5px solid ${on ? C.pink : C.line}`,
              background: on ? `${C.pink}2a` : C.panel,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 24,
              color: on ? C.text : C.faint,
              boxShadow: hot > 0.02 ? `0 0 ${30 * hot}px ${C.pink}` : undefined,
              transform: `scale(${1 + 0.25 * hot})`,
              opacity: clamp01(s(1, 10 + n)),
            }}
          >
            {n}
          </div>
        );
      })}
      <At x={CX - 100} y={CY - 20} w={200} step={1} delay={30} size={24} weight={700} color={C.dim} align="center" font={F.mono}>
        mod 16
      </At>
      {SEQ.map((v, i) => (
        <div key={i} style={{ position: "absolute", left: 96 + i * 102, top: 640, ...appear(s(2, i * HOP, POP)) }}>
          <Box color={C.pink} w={86} h={56} size={26}>
            {v}
          </Box>
        </div>
      ))}
      <At x={96} y={712} step={2} delay={10} size={22} weight={600} color={C.dim}>
        кожне число – наступне зерно
      </At>
      <At x={96} y={880} w={1060} step={3} size={30} weight={600}>
        Те саме зерно – та сама послідовність: результат <A>відтворюваний</A> і легко тестується.
      </At>
    </Slide>
  );
};

/* Приклад 4: Фібоначчі з парою-станом */
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
const FIB_GAP = 24;

const Fib: React.FC = () => {
  const { s, t } = useSteps();
  const X0 = 140;
  const P = 166;
  const W = 120;
  const Y = 640;
  const u = Math.max(0, t(2, 0)) / FIB_GAP;
  const k = Math.min(8, Math.floor(u));
  const started = t(2, 0) >= 0;
  const frac = k >= 8 ? 1 : clamp01(((u - k) * FIB_GAP) / 10);
  const winX = X0 - 14 + (k === 0 ? 0 : k - 1 + frac) * P;
  return (
    <Slide title="Приклад 4: Фібоначчі з парою-станом">
      <Lead>Якщо стан складається з кількох значень, їх об’єднують у пару.</Lead>
      <SyntaxBox x={96} y={290} w={1000} step={1} size={26} title="Лямбда з розбором пари" lines={["\\({a}, {b}) -> {expr}   -- аргумент-пара одразу розбирається"]} />
      <Code
        x={96}
        y={410}
        size={30}
        step={1}
        delay={20}
        stagger={10}
        code={`
          fibs = map fst (iterate (\\(a, b) -> (b, a + b)) (0, 1))
          take 10 fibs   -- [0,1,1,2,3,5,8,13,21,34]
        `}
      />
      {FIB.map((v, i) => {
        const born = i < 2 ? s(2, 0, POP) : s(2, (i - 2) * FIB_GAP + 14, POP);
        const isFst = i <= k && started;
        return (
          <div key={i} style={{ position: "absolute", left: X0 + i * P, top: Y, ...appear(born) }}>
            <Box color={C.accentHi} w={W} h={70} size={30}>
              {v}
            </Box>
            <div
              style={{
                marginTop: 10,
                height: 5,
                borderRadius: 3,
                background: C.mint,
                opacity: isFst ? 1 : 0,
              }}
            />
          </div>
        );
      })}
      {started && (
        <div
          style={{
            position: "absolute",
            left: winX,
            top: Y - 14,
            width: P + W + 28,
            height: 98,
            borderRadius: 18,
            border: `3px solid ${C.amber}`,
            boxShadow: `0 0 22px ${C.amber}66`,
            pointerEvents: "none",
          }}
        />
      )}
      {started && (
        <div
          style={{
            position: "absolute",
            left: winX,
            width: P + W + 28,
            top: Y - 64,
            textAlign: "center",
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 26,
            color: C.amber,
          }}
        >
          {`(a, b) = (${FIB[k]}, ${FIB[k + 1]})`}
        </div>
      )}
      <At x={96} y={770} step={2} delay={30} size={24} weight={600} color={C.mint}>
        зелена риска – fst кожної пари, тобто вихідний потік
      </At>
      <At x={96} y={880} w={1720} step={3} size={30} weight={600}>
        Стан <M c={C.amber}>(a, b)</M> щоразу будується заново; <M>map fst</M> бере з кожної пари перший елемент.
      </At>
    </Slide>
  );
};

/* Спільна схема */
const TABLE = [
  { task: "Рахунок", state: "баланс", step: "transition", tool: "foldl, scanl, mapAccumL", color: C.lav },
  { task: "Турнікет", state: "Locked / Unlocked", step: "next", tool: "scanl", color: C.amber },
  { task: "Рекорди", state: "максимум досі", step: "max", tool: "scanl1", color: C.mint },
  { task: "Генератор", state: "зерно", step: "next", tool: "iterate", color: C.pink },
  { task: "Фібоначчі", state: "пара (a, b)", step: "(b, a + b)", tool: "iterate", color: C.accentHi },
];

const Common: React.FC = () => {
  const { s } = useSteps();
  const COLS = [130, 480, 900, 1250];
  const Y0 = 300;
  const RH = 92;
  return (
    <Slide title="Спільна схема">
      {["Задача", "Стан", "Крок", "Засіб"].map((h, i) => (
        <At key={h} x={COLS[i]} y={Y0 - 60} step={0} delay={8} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
          {h.toUpperCase()}
        </At>
      ))}
      {TABLE.map((r, i) => {
        const p = s(1, i * 10, POP);
        return (
          <div
            key={r.task}
            style={{
              position: "absolute",
              left: 96,
              top: Y0 + i * RH,
              width: 1728,
              height: RH - 16,
              borderRadius: 12,
              background: C.panel,
              borderLeft: `6px solid ${r.color}`,
              ...appear(p, 14),
            }}
          >
            {[r.task, r.state, r.step, r.tool].map((v, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: COLS[j] - 96,
                  top: 0,
                  height: RH - 16,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: j >= 2 ? F.mono : F.body,
                  fontWeight: 700,
                  fontSize: j === 0 ? 30 : 27,
                  color: j === 0 ? C.text : j === 1 ? r.color : j === 2 ? C.amber : C.mint,
                  whiteSpace: "pre",
                  fontVariantLigatures: "none",
                }}
              >
                {v}
              </div>
            ))}
          </div>
        );
      })}
      <At x={96} y={790} w={1720} step={2} size={32} weight={600}>
        Усюди стан передається <A>явно</A> – як аргумент кроку і як його результат; змінюваних змінних немає.
      </At>
      <At x={96} y={870} w={1720} step={3} size={30} weight={600} color={C.dim}>
        Далі: як зберегти контекст усередині самої функції – <A>замикання</A>.
      </At>
    </Slide>
  );
};

export const s3bSlides: SlideDef[] = [
  { id: "unroll", title: "Стан у потоках", steps: [45, 60, 90, 70], C: Unroll },
  { id: "turnstile", title: "Турнікет", steps: [40, 70, EVENTS.length * EV_GAP + 50, 70], C: Turnstile },
  { id: "records", title: "Рекорди", steps: [40, 60, READ.length * BAR_GAP + 50, 70], C: Records },
  { id: "random", title: "Випадкові числа", steps: [40, 70, SEQ.length * HOP + 40, 70], C: Random },
  { id: "fib", title: "Фібоначчі", steps: [40, 60, 9 * FIB_GAP + 30, 70], C: Fib },
  { id: "common", title: "Спільна схема", steps: [30, 80, 60, 60], C: Common },
];
