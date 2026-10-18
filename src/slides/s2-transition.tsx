import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Mark, Slide } from "../deck/ui";
import { clamp01, pulse } from "./common";
import { SyntaxBox } from "./kit";
import { BalBox, CmdChip, DecChip, Machine } from "./bank";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

const TypeCard: React.FC<{ x: number; y: number; w: number; title: string; p: number; children: React.ReactNode }> = ({ x, y, w, title, p, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      borderRadius: 16,
      border: `2px solid ${C.line}`,
      background: C.panel,
      boxSizing: "border-box",
      padding: "16px 22px 20px",
      ...appear(p, 24),
    }}
  >
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: C.lav, marginBottom: 14 }}>{title}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>{children}</div>
  </div>
);

/* Типи даних Haskell */
const Types: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Типи даних Haskell">
      <Lead>Команди та рішення описуються значеннями алгебраїчних типів.</Lead>
      <SyntaxBox
        x={96}
        y={290}
        w={900}
        step={1}
        size={26}
        lines={["type {Name} = {Type}   -- нове ім’я наявного типу", "data {Type} = {Con1} {Field} | {Con2} {Field}"]}
      />
      <Code
        x={96}
        y={460}
        size={32}
        step={1}
        delay={24}
        stagger={8}
        code={`
          type Balance = Int
          data Command = Deposit Int | Withdraw Int
            deriving (Eq, Show)
          data Decision = Approved | Declined
            deriving (Eq, Show)
        `}
      />
      <TypeCard x={1080} y={290} w={740} title="Balance = Int" p={s(2, 0, POP)}>
        {[0, 50, 30].map((v) => (
          <BalBox key={v} v={v} size={26} />
        ))}
      </TypeCard>
      <TypeCard x={1080} y={470} w={740} title="Command" p={s(2, 12, POP)}>
        <CmdChip cmd={{ kind: "Deposit", n: 50 }} size={24} />
        <CmdChip cmd={{ kind: "Withdraw", n: 20 }} size={24} />
        <CmdChip cmd={{ kind: "Withdraw", n: 100 }} size={24} />
      </TypeCard>
      <TypeCard x={1080} y={650} w={740} title="Decision" p={s(2, 24, POP)}>
        <DecChip ok size={24} />
        <DecChip ok={false} size={24} />
      </TypeCard>
      <At x={96} y={880} w={1720} step={3} size={32} weight={600}>
        Правила виконання міститимуться в <A>одній функції</A> <M>transition</M>: вона отримує команду й баланс.
      </At>
    </Slide>
  );
};

/* Чиста функція переходу */
const Deposit: React.FC = () => {
  const { s, t } = useSteps();
  const MX = 800;
  const MY = 650;
  const MW = 330;
  const MH = 120;
  const feed = clamp01(t(2, 4) / 24);
  const e = feed * feed * (3 - 2 * feed);
  const out = s(2, 36, POP);
  const spin = t(2, 0) > 0 && t(2, 0) < 50 ? t(2, 0) * 7 : 0;
  return (
    <Slide title="Чиста функція переходу">
      <Lead>Результат визначається лише командою та початковим балансом.</Lead>
      <SyntaxBox x={1180} y={290} w={640} step={1} size={24} title="Пара значень" lines={["({x}, {y}) :: ({A}, {B})", "-- два значення, повернені разом"]} />
      <Code
        x={96}
        y={300}
        size={30}
        step={1}
        delay={20}
        stagger={8}
        code={`
          transition :: Command -> Balance
                     -> (Decision, Balance)
          transition (Deposit amount) balance
            | amount > 0 = (Approved, balance + amount)
            | otherwise  = (Declined, balance)
        `}
      />
      <Machine x={MX} y={MY} w={MW} h={MH} p={s(2, 0, POP)} label="transition" spin={spin} glow={pulse(t(2, 0), 30, 24)} size={30} />
      <div style={{ position: "absolute", left: mix(200, MX - 250, e), top: MY + 10, opacity: feed < 1 ? clamp01(s(2, 0)) : 0.25 }}>
        <CmdChip cmd={{ kind: "Deposit", n: 50 }} size={26} />
      </div>
      <div style={{ position: "absolute", left: mix(200, MX - 140, e), top: MY + 66, opacity: feed < 1 ? clamp01(s(2, 0)) : 0.25 }}>
        <BalBox v={0} size={24} h={44} />
      </div>
      <div style={{ position: "absolute", left: MX + MW + 50, top: MY + 30, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontSize: 40, color: C.dim, ...appear(out) }}>
        <span>(</span>
        <DecChip ok size={26} />
        <span>,</span>
        <BalBox v={50} size={28} h={50} />
        <span>)</span>
      </div>
      <At x={96} y={880} w={1720} step={3} size={32} weight={600}>
        Функція <A>повертає нове значення</A> замість зміни поля об’єкта; вхідний баланс <M c={C.lav}>0</M> лишається <M c={C.lav}>0</M>.
      </At>
    </Slide>
  );
};

/* Правило зняття коштів */
const SCALE = 3.2;
const BASE = 850;

const Bars: React.FC<{ x: number; balance: number; amount: number; step: number }> = ({ x, balance, amount, step }) => {
  const { s, t } = useSteps();
  const pb = s(step, 0, POP);
  const pa = clamp01(t(step, 14) / 22);
  const ok = amount > 0 && amount <= balance;
  const verdict = s(step, 44, POP);
  const hb = balance * SCALE;
  const ha = amount * SCALE * pa;
  const over = Math.max(0, ha - hb);
  const color = ok ? C.mint : C.red;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <rect x={x} y={BASE - hb * clamp01(pb)} width={110} height={hb * clamp01(pb)} rx={8} fill={`${C.lav}33`} stroke={C.lav} strokeWidth={3} />
        <rect x={x + 150} y={BASE - Math.min(ha, hb)} width={110} height={Math.min(ha, hb)} rx={8} fill={`${C.amber}33`} stroke={C.amber} strokeWidth={3} />
        {over > 0 && <rect x={x + 150} y={BASE - ha} width={110} height={over} rx={8} fill={`${C.red}40`} stroke={C.red} strokeWidth={3} />}
        <line x1={x - 20} y1={BASE - hb} x2={x + 290} y2={BASE - hb} stroke={C.lav} strokeWidth={2} strokeDasharray="8 6" opacity={clamp01(pb)} />
        <line x1={x - 30} y1={BASE} x2={x + 300} y2={BASE} stroke={C.line} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: x - 20, width: 150, top: BASE + 10, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.lav, ...appear(pb) }}>
        {`баланс ${balance}`}
      </div>
      <div style={{ position: "absolute", left: x + 130, width: 150, top: BASE + 10, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.amber, ...appear(s(step, 14)) }}>
        {`зняття ${amount}`}
      </div>
      <div style={{ position: "absolute", left: x + 330, top: BASE - 120, ...appear(verdict) }}>
        <DecChip ok={ok} size={26} />
        <div style={{ marginTop: 14, fontFamily: F.mono, fontSize: 28, color: C.text }}>
          {"→ баланс "}
          <span style={{ color: color }}>{ok ? balance - amount : balance}</span>
        </div>
      </div>
    </>
  );
};

const Withdraw: React.FC = () => (
  <Slide title="Правило зняття коштів">
    <Lead>Зняття схвалюється, якщо сума додатна й не перевищує баланс.</Lead>
    <Code
      x={96}
      y={290}
      size={30}
      step={1}
      stagger={8}
      code={`
        transition (Withdraw amount) balance
          | amount > 0 && amount <= balance
                      = (Approved, balance - amount)
          | otherwise  = (Declined, balance)
      `}
    />
    <Bars x={200} balance={50} amount={20} step={2} />
    <Bars x={1080} balance={30} amount={100} step={3} />
    <At x={96} y={922} w={1720} step={4} size={29} weight={600}>
      <A>Інваріант</A> – властивість, що зберігається під час усіх переходів: якщо початковий баланс невід’ємний, то й кожен наступний невід’ємний.
    </At>
  </Slide>
);

/* Переходи перевіряються як значення */
const PROPS = Array.from({ length: 24 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 91.7 + n * 13.3) * 43758.5453;
    return v - Math.floor(v);
  };
  const b = Math.floor(r(1) * 100);
  const dep = r(2) < 0.45;
  const amt = 1 + Math.floor(r(3) * 110);
  const ok = dep || amt <= b;
  const next = !ok ? b : dep ? b + amt : b - amt;
  return { b, dep, amt, next };
});

const Testable: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Переходи перевіряються як значення">
      <Lead>
        Поведінку <M>transition</M> можна перевірити без вводу-виводу та без змінюваних об’єктів.
      </Lead>
      <Code
        x={96}
        y={290}
        size={32}
        step={1}
        stagger={10}
        code={`
          transition (Deposit 50) 0      -- (Approved,50)
          transition (Withdraw 20) 50    -- (Approved,30)
          transition (Withdraw 100) 30   -- (Declined,30)
        `}
      />
      {[0, 1, 2].map((i) => (
        <Mark key={i} ok x={1110} y={286 + i * 46} step={1} delay={30 + i * 12} size={40} />
      ))}
      <At x={96} y={480} step={2} size={24} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        ІНВАРІАНТ НА ВИПАДКОВИХ ВХОДАХ: БАЛАНС ≥ 0 ПІСЛЯ ПЕРЕХОДУ
      </At>
      {PROPS.map((pr, i) => {
        const p = s(2, 6 + i * 3, POP);
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 96 + col * 290,
              top: 530 + row * 74,
              width: 270,
              height: 58,
              borderRadius: 12,
              border: `2px solid ${C.mint}55`,
              background: `${C.mint}10`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              fontFamily: F.mono,
              fontSize: 21,
              color: C.text,
              whiteSpace: "pre",
              ...appear(p, 10),
            }}
          >
            <span>
              <span style={{ color: pr.dep ? C.mint : C.amber }}>{`${pr.dep ? "+" : "−"}${pr.amt}`.padEnd(5)}</span>
              <span style={{ color: C.lav }}>{pr.b}</span>
              <span style={{ color: C.faint }}>{" → "}</span>
              <span style={{ color: C.lav }}>{pr.next}</span>
            </span>
            <span style={{ color: C.mint, fontWeight: 800 }}>✓</span>
          </div>
        );
      })}
      <At x={96} y={880} w={1720} step={3} size={30} weight={600}>
        Однакові аргументи завжди дають однаковий результат, тому кожен перехід перевіряється окремо. Залишилось виконати <A>цілу послідовність</A> команд.
      </At>
    </Slide>
  );
};

export const s2Slides: SlideDef[] = [
  { id: "types", title: "Типи даних", steps: [40, 60, 70, 60], C: Types },
  { id: "deposit", title: "Функція переходу", steps: [40, 60, 80, 60], C: Deposit },
  { id: "withdraw", title: "Зняття коштів", steps: [40, 60, 80, 80, 60], C: Withdraw },
  { id: "testable", title: "Перевірка переходів", steps: [40, 80, 100, 70], C: Testable },
];
