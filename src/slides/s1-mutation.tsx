import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Mark, Slide } from "../deck/ui";
import { clamp01, pulse } from "./common";
import { BalBox, CmdChip, COMMANDS, Machine } from "./bank";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

/* Задача: послідовні операції */
const TASK_X = [180, 700, 1220, 1740];
const TASK_OPS = [
  { label: "+50", ok: true, color: C.mint },
  { label: "−20", ok: true, color: C.amber },
  { label: "−100", ok: false, color: C.red },
];

const Task: React.FC = () => {
  const { s, t } = useSteps();
  const Y = 440;
  const BW = 150;
  const BH = 90;
  const both = s(4, 0);
  return (
    <Slide title="Задача: послідовні операції">
      <Lead>Баланс після кожної команди залежить від результату попередньої.</Lead>
      {[0, 50, 30, 30].map((v, i) => {
        const p = i === 0 ? s(1, 0, POP) : s(i, 34, POP);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: TASK_X[i] - 60, width: 120, top: Y - 44, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.dim, ...appear(p, 10) }}>
              {i === 0 ? "початок" : `після ${i}`}
            </div>
            <div style={{ position: "absolute", left: TASK_X[i] - BW / 2, top: Y, ...appear(p) }}>
              <BalBox v={v} w={BW} h={BH} size={40} glow={both * (0.6 + 0.4 * Math.sin(t(4, 0) / 8))} />
            </div>
          </React.Fragment>
        );
      })}
      {TASK_OPS.map((op, i) => {
        const st = i + 1;
        const x1 = TASK_X[i] + BW / 2 + 14;
        const x2 = TASK_X[i + 1] - BW / 2 - 14;
        const k = clamp01(t(st, 0) / 22);
        const tt = t(st, 0);
        const bounce = !op.ok && tt > 18 ? Math.sin(Math.min(1, (tt - 18) / 14) * Math.PI) * -60 : 0;
        const chipX = op.ok ? mix(x1, (x1 + x2) / 2, clamp01(tt / 18)) : mix(x1, (x1 + x2) / 2 + 40, clamp01(tt / 18)) + bounce;
        const dec = s(st, 26, POP);
        return (
          <React.Fragment key={i}>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              <line
                x1={x1}
                y1={Y + BH / 2}
                x2={mix(x1, x2 - 8, k)}
                y2={Y + BH / 2}
                stroke={op.ok ? C.dim : C.red}
                strokeWidth={3}
                strokeDasharray={op.ok ? undefined : "8 8"}
              />
              <polygon points={`${x2},${Y + BH / 2} ${x2 - 14},${Y + BH / 2 - 8} ${x2 - 14},${Y + BH / 2 + 8}`} fill={op.ok ? C.dim : C.red} opacity={k >= 1 ? 1 : 0} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: chipX - 60,
                top: Y - 70,
                width: 120,
                textAlign: "center",
                fontFamily: F.mono,
                fontWeight: 800,
                fontSize: 40,
                color: op.color,
                opacity: clamp01(s(st, 0)),
                textShadow: `0 0 16px ${op.color}66`,
              }}
            >
              {op.label}
            </div>
            <div style={{ position: "absolute", left: (x1 + x2) / 2 - 110, width: 220, top: Y + BH + 40, display: "flex", justifyContent: "center", ...appear(dec) }}>
              <span
                style={{
                  padding: "8px 18px",
                  borderRadius: 30,
                  border: `2px solid ${op.ok ? C.mint : C.red}`,
                  background: `${op.ok ? C.mint : C.red}22`,
                  fontFamily: F.body,
                  fontWeight: 700,
                  fontSize: 26,
                  color: op.ok ? C.mint : C.red,
                  boxShadow: both > 0.05 ? `0 0 ${20 * both}px ${op.ok ? C.mint : C.red}` : undefined,
                }}
              >
                {op.ok ? "✓ схвалено" : "✗ відмова"}
              </span>
            </div>
          </React.Fragment>
        );
      })}
      <At x={TASK_X[3] - 130} y={Y + BH + 46} w={260} step={3} delay={40} size={22} weight={600} color={C.dim} align="center">
        баланс не змінився
      </At>
      <At x={96} y={760} step={4} size={26} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        КОЖНА ОПЕРАЦІЯ ДАЄ ДВА РЕЗУЛЬТАТИ
      </At>
      <At x={96} y={810} w={1720} step={4} delay={8} size={32} weight={600}>
        Потрібно зберегти <A c={C.mint}>рішення</A> щодо операції та <A c={C.lav}>наступний баланс</A> – він стане входом для наступної команди.
      </At>
    </Slide>
  );
};

/* Імперативний спосіб: мутація */
const MUT_VALUES = [0, 50, 30, 30];

const Mutation: React.FC = () => {
  const { s, t } = useSteps();
  const CX = 1180;
  const CY = 400;
  const CW = 560;
  const CH = 170;
  const stepOf = (k: number) => k + 1;
  const cur = [1, 2, 3].reduce((acc, k) => (t(stepOf(k), 10) >= 0 ? k : acc), 0);
  const p = cur === 0 ? 1 : s(stepOf(cur), 10);
  const changed = cur > 0 && MUT_VALUES[cur] !== MUT_VALUES[cur - 1];
  const prev = cur === 0 ? null : MUT_VALUES[cur - 1];
  const shake = cur === 3 ? Math.sin(Math.max(0, t(4, 10)) * 1.4) * 10 * Math.max(0, 1 - t(4, 10) / 22) : 0;
  const lost = s(5, 0);
  return (
    <Slide title="Імперативний спосіб: мутація">
      <Lead>
        Метод об’єкта змінює поле <M>balance</M>. Наступний виклик використовує змінене значення.
      </Lead>
      <Code
        x={96}
        y={330}
        size={25}
        lh={35}
        step={1}
        stagger={3}
        code={`
          public class Account
          {
              private int balance = 0;
              public void Deposit(int amount)
              {
                  if (amount > 0) [[2@4~70|balance += amount]];
              }
              public bool Withdraw(int amount)
              {
                  if (amount <= 0 || amount > balance) [[4@4~70|return false]];
                  [[3@4~70|balance -= amount]];
                  return true;
              }
          }
        `}
      />
      <At x={CX} y={CY - 56} step={1} delay={20} size={24} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        ПОЛЕ ОБ’ЄКТА
      </At>
      <div
        style={{
          position: "absolute",
          left: CX,
          top: CY,
          width: CW,
          height: CH,
          borderRadius: 18,
          border: `3px solid ${C.red}`,
          background: `${C.red}12`,
          boxSizing: "border-box",
          overflow: "hidden",
          transform: `translateX(${shake}px)`,
          ...appear(s(1, 20, POP)),
        }}
      >
        <div style={{ position: "absolute", left: 26, top: 18, fontFamily: F.mono, fontSize: 26, color: C.dim }}>balance</div>
        {prev !== null && changed && (
          <div
            style={{
              position: "absolute",
              right: 40,
              top: 46,
              fontFamily: F.mono,
              fontWeight: 800,
              fontSize: 80,
              color: C.red,
              opacity: 1 - p,
              transform: `translateY(${-70 * p}px)`,
              textDecoration: "line-through",
            }}
          >
            {prev}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 46,
            fontFamily: F.mono,
            fontWeight: 800,
            fontSize: 80,
            color: C.text,
            opacity: changed ? p : 1,
            transform: `translateY(${changed ? 70 * (1 - p) : 0}px)`,
          }}
        >
          {MUT_VALUES[cur]}
        </div>
      </div>
      {[1, 2, 3].map((k) => (
        <div key={k} style={{ position: "absolute", left: CX, top: CY + CH + 30 + (k - 1) * 58, ...appear(s(stepOf(k), 0)) }}>
          <CmdChip cmd={COMMANDS[k - 1]} size={24} />
          <span style={{ marginLeft: 18, fontFamily: F.mono, fontSize: 24, color: k === 3 ? C.red : C.dim }}>{k === 3 ? "→ false, поле без змін" : `→ поле = ${MUT_VALUES[k]}`}</span>
        </div>
      ))}
      <Mark ok={false} x={CX + CW - 30} y={CY - 30} step={4} delay={10} size={48} />
      <div style={{ position: "absolute", left: 96, top: 885, width: 1720, ...appear(lost) }}>
        <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.text }}>
          Стан зберігається у <A c={C.red}>змінюваному об’єкті</A>: значення <M c={C.red}>0</M> і <M c={C.red}>50</M> перезаписано, попередніх версій більше немає.
        </span>
      </div>
    </Slide>
  );
};

/* Стан не тотожний мутації */
const VERSIONS = [0, 50, 30];

const NotMutation: React.FC = () => {
  const { s } = useSteps();
  const card = (x: number, color: string, title: string, text: string, p: number) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 300,
        width: 820,
        height: 190,
        borderRadius: 18,
        border: `3px solid ${color}`,
        background: C.panel,
        boxSizing: "border-box",
        padding: "26px 34px",
        ...appear(p, 24),
      }}
    >
      <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 40, color }}>{title}</div>
      <div style={{ marginTop: 14, fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.text, lineHeight: 1.3 }}>{text}</div>
    </div>
  );
  const at = (k: number) => 10 + k * 34;
  const curMut = VERSIONS.reduce((acc, _, k) => (s(3, at(k)) > 0.5 ? k : acc), 0);
  return (
    <Slide title="Стан не тотожний мутації">
      {card(96, C.lav, "Стан", "Інформація, необхідна для визначення результату наступної операції.", s(1, 0, POP))}
      {card(1004, C.red, "Мутація", "Зміна наявного об’єкта або комірки пам’яті.", s(2, 0, POP))}
      <At x={96} y={560} step={3} size={24} weight={800} color={C.red} style={{ letterSpacing: 1 }}>
        МУТАЦІЯ: ОДНА КОМІРКА
      </At>
      <div style={{ position: "absolute", left: 96, top: 610, ...appear(s(3, 0, POP)) }}>
        <BalBox v={VERSIONS[curMut]} color={C.red} w={200} h={110} size={52} />
      </div>
      <At x={330} y={644} w={540} step={3} delay={at(2) + 10} size={26} weight={600} color={C.dim}>
        нове значення стирає попереднє
      </At>
      <At x={1004} y={560} step={3} size={24} weight={800} color={C.lav} style={{ letterSpacing: 1 }}>
        НОВІ ЗНАЧЕННЯ: ЛАНЦЮЖОК ВЕРСІЙ
      </At>
      {VERSIONS.map((v, k) => {
        const p = s(3, at(k), POP);
        return (
          <React.Fragment key={k}>
            {k > 0 && (
              <div style={{ position: "absolute", left: 1004 + k * 270 - 64, top: 640, fontFamily: F.mono, fontSize: 40, color: C.faint, opacity: clamp01(p) }}>→</div>
            )}
            <div style={{ position: "absolute", left: 1004 + k * 270, top: 610, ...appear(p) }}>
              <BalBox v={v} w={180} h={110} size={52} />
              <div style={{ marginTop: 8, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.dim }}>{`s${"₀₁₂"[k]}`}</div>
            </div>
          </React.Fragment>
        );
      })}
      <At x={96} y={880} w={1720} step={4} size={34} weight={600}>
        Змінювати стан можна й <A>створенням нового значення</A>: старі версії лишаються такими, як були.
      </At>
    </Slide>
  );
};

/* Формальна модель переходу */
const Model: React.FC = () => {
  const { s, t } = useSteps();
  const MX = 790;
  const MY = 500;
  const MW = 340;
  const MH = 150;
  const feed = clamp01(t(2, 6) / 26);
  const e = feed * feed * (3 - 2 * feed);
  const out = s(2, 40, POP);
  const keep = s(3, 0);
  const spin = t(2, 0) > 0 && t(2, 0) < 60 ? t(2, 0) * 6 : 0;
  const busy = pulse(t(2, 0), 30, 30);
  return (
    <Slide title="Формальна модель переходу">
      <Lead>
        За командою <M c={C.amber}>c</M> і поточним станом <M c={C.lav}>s</M> обчислюються рішення <M>r</M> та наступний стан <M c={C.lav}>s′</M>.
      </Lead>
      <At x={0} y={300} w={1920} step={1} size={50} weight={700} font={F.mono} align="center" style={{ fontVariantLigatures: "none" }}>
        <span style={{ color: C.text }}>T : </span>
        <span style={{ color: C.amber }}>Command</span>
        <span style={{ color: C.dim }}> × </span>
        <span style={{ color: C.lav }}>State</span>
        <span style={{ color: C.dim }}> → </span>
        <span style={{ color: C.mint }}>Decision</span>
        <span style={{ color: C.dim }}> × </span>
        <span style={{ color: C.lav }}>State</span>
      </At>
      <Machine x={MX} y={MY} w={MW} h={MH} p={s(1, 20, POP)} label="T" spin={spin} glow={busy} size={52} />
      <div style={{ position: "absolute", left: 170, top: MY + 14, fontFamily: F.mono, fontSize: 28, color: C.dim, ...appear(s(1, 30)) }}>c =</div>
      <div style={{ position: "absolute", left: 250, top: MY + 6, ...appear(s(1, 30)) }}>
        <CmdChip cmd={{ kind: "Withdraw", n: 20 }} size={28} />
      </div>
      {feed > 0 && feed < 1 && (
        <div style={{ position: "absolute", left: mix(250, MX - 230, e), top: MY + 6, opacity: 0.85 * (1 - feed * 0.5) }}>
          <CmdChip cmd={{ kind: "Withdraw", n: 20 }} size={28} />
        </div>
      )}
      <div style={{ position: "absolute", left: 170, top: MY + 100, fontFamily: F.mono, fontSize: 28, color: C.dim, ...appear(s(1, 34)) }}>s =</div>
      <div style={{ position: "absolute", left: 250, top: MY + 86, ...appear(s(1, 34)) }}>
        <BalBox v={50} size={30} glow={keep} />
      </div>
      {feed > 0 && feed < 1 && (
        <div style={{ position: "absolute", left: mix(250, MX - 110, e), top: MY + 86, opacity: 0.85 * (1 - feed * 0.5) }}>
          <BalBox v={50} size={30} />
        </div>
      )}
      <At x={170} y={MY + 176} w={520} step={3} delay={6} size={26} weight={700} color={C.lav}>
        s лишився тим самим значенням
      </At>
      <div style={{ position: "absolute", left: MX + MW + 70, top: MY + 6, ...appear(out) }}>
        <span style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, marginRight: 14 }}>r =</span>
        <span
          style={{
            padding: "6px 16px",
            borderRadius: 24,
            border: `2px solid ${C.mint}`,
            background: `${C.mint}22`,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 28,
            color: C.mint,
          }}
        >
          Approved
        </span>
      </div>
      <div style={{ position: "absolute", left: MX + MW + 70, top: MY + 86, ...appear(s(2, 48, POP)) }}>
        <span style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, marginRight: 14 }}>s′ =</span>
        <BalBox v={30} size={30} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(1, 24)) }}>
        {[MY + 30, MY + 110].map((y, i) => (
          <g key={i}>
            <line x1={MX - 60} y1={y} x2={MX - 8} y2={y} stroke={C.dim} strokeWidth={3} />
            <polygon points={`${MX - 4},${y} ${MX - 16},${y - 7} ${MX - 16},${y + 7}`} fill={C.dim} />
            <line x1={MX + MW + 8} y1={y} x2={MX + MW + 56} y2={y} stroke={C.dim} strokeWidth={3} />
            <polygon points={`${MX + MW + 62},${y} ${MX + MW + 50},${y - 7} ${MX + MW + 50},${y + 7}`} fill={C.dim} />
          </g>
        ))}
      </svg>
      <At x={96} y={880} w={1720} step={4} size={32} weight={600}>
        Початкове значення <M c={C.lav}>s</M> залишається незмінним: <M>T</M> лише обчислює <A>нові</A> значення <M>r</M> і <M c={C.lav}>s′</M>.
      </At>
    </Slide>
  );
};

export const s1Slides: SlideDef[] = [
  { id: "task", title: "Задача", steps: [40, 60, 60, 80, 70], C: Task },
  { id: "mutation", title: "Мутація", steps: [40, 60, 70, 70, 70, 70], C: Mutation },
  { id: "not-mutation", title: "Стан і мутація", steps: [20, 50, 50, 120, 60], C: NotMutation },
  { id: "model", title: "Модель переходу", steps: [45, 60, 90, 60, 60], C: Model },
];
