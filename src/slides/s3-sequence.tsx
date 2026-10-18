import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { clamp01, pulse } from "./common";
import { SyntaxBox } from "./kit";
import { BALANCES, BalBox, CmdChip, COMMANDS, DECISIONS, DecChip, Machine } from "./bank";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

/* Як передати стан далі? */
const CH_BOX = 110;
const CH_MACH = 240;
const CH_GAP = 93;
const CH_X0 = 100;
const chainX = (k: number) => CH_X0 + k * (CH_BOX + CH_MACH + 2 * CH_GAP);
const machX = (k: number) => chainX(k) + CH_BOX + CH_GAP;
const RUN = 40;

const Threading: React.FC = () => {
  const { s, t } = useSteps();
  const Y = 610;
  return (
    <Slide title="Як передати стан далі?">
      <Lead>Кожна наступна команда отримує баланс, повернутий попередньою.</Lead>
      <SyntaxBox x={1180} y={290} w={640} step={1} size={24} title="Зв’язування пари" lines={["({x}, {y}) = {expr}", "-- імена для обох елементів пари"]} />
      <Code
        x={96}
        y={300}
        size={30}
        step={1}
        delay={20}
        stagger={10}
        code={`
          (r1, s1) = transition (Deposit 50) 0
          (r2, s2) = transition (Withdraw 20) s1
          (r3, s3) = transition (Withdraw 100) s2
        `}
      />
      {BALANCES.map((v, k) => {
        const p = k === 0 ? s(2, 0, POP) : s(2, (k - 1) * RUN + 30, POP);
        return (
          <div key={k} style={{ position: "absolute", left: chainX(k), top: Y + 15, ...appear(p) }}>
            <BalBox v={v} w={CH_BOX} h={70} size={32} />
            <div style={{ marginTop: 8, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.dim }}>{`s${k}`}</div>
          </div>
        );
      })}
      {COMMANDS.map((c, k) => {
        const tt = t(2, k * RUN);
        const run = clamp01(tt / 30);
        const x0 = chainX(k) + CH_BOX;
        const x1 = chainX(k + 1);
        const tokenX = mix(x0, x1 - 40, run);
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: machX(k), width: CH_MACH, top: Y - 64, display: "flex", justifyContent: "center", ...appear(s(2, k * RUN)) }}>
              <CmdChip cmd={c} size={22} />
            </div>
            <Machine x={machX(k)} y={Y} w={CH_MACH} h={100} p={s(2, k * RUN, POP)} label="transition" spin={tt > 0 && tt < 30 ? tt * 8 : 0} glow={pulse(tt, 14, 14)} size={24} />
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(2, k * RUN)) }}>
              {[
                [x0 + 6, machX(k) - 6],
                [machX(k) + CH_MACH + 6, x1 - 6],
              ].map(([a, b], i) => (
                <g key={i}>
                  <line x1={a} y1={Y + 50} x2={b - 8} y2={Y + 50} stroke={C.dim} strokeWidth={3} />
                  <polygon points={`${b},${Y + 50} ${b - 12},${Y + 43} ${b - 12},${Y + 57}`} fill={C.dim} />
                </g>
              ))}
              {run > 0 && run < 1 && <circle cx={tokenX + 20} cy={Y + 50} r={10} fill={C.lav} opacity={0.9} />}
            </svg>
            <div style={{ position: "absolute", left: machX(k), width: CH_MACH, top: Y + 130, display: "flex", justifyContent: "center", ...appear(s(2, k * RUN + 24, POP)) }}>
              <DecChip ok={DECISIONS[k]} size={22} />
            </div>
            <div style={{ position: "absolute", left: machX(k), width: CH_MACH, top: Y + 180, textAlign: "center", fontFamily: F.mono, fontSize: 22, color: C.dim, ...appear(s(2, k * RUN + 24)) }}>
              {`r${k + 1}`}
            </div>
          </React.Fragment>
        );
      })}
      <At x={96} y={870} w={1720} step={3} size={30} weight={600}>
        Результат: <M>(Approved, Approved, Declined)</M>, кінцевий стан <M c={C.lav}>30</M>. Схема однакова на кожному кроці – отже, її можна виразити <A>згорткою</A>.
      </At>
    </Slide>
  );
};

/* Згортка послідовності команд */
const FOLD_X = [110, 630, 1150, 1670];

const FoldSlide: React.FC = () => {
  const { s, t } = useSteps();
  const Y = 640;
  const STEP_GAP = 36;
  return (
    <Slide title="Згортка послідовності команд">
      <Lead>
        Повторювану схему передавання балансу можна описати через <M>foldl</M>.
      </Lead>
      <SyntaxBox x={1120} y={290} w={700} step={1} size={24} title="Нагадування" lines={["foldl {step} {z} {xs}   -- лекція 8", "snd ({a}, {b}) = {b}"]} />
      <Code
        x={96}
        y={300}
        size={28}
        lh={40}
        step={1}
        delay={20}
        stagger={8}
        code={`
          advance :: Balance -> Command -> Balance
          advance balance command =
            snd (transition command balance)
          commands = [Deposit 50, Withdraw 20, Withdraw 100]
          finalBalance = foldl advance 0 commands   -- 30
        `}
      />
      {BALANCES.map((v, k) => {
        const p = k === 0 ? s(2, 0, POP) : s(2, (k - 1) * STEP_GAP + 22, POP);
        return (
          <div key={k} style={{ position: "absolute", left: FOLD_X[k], top: Y, ...appear(p) }}>
            <BalBox v={v} w={130} h={76} size={34} glow={k === 3 ? s(3, 0) : 0} />
          </div>
        );
      })}
      {COMMANDS.map((c, k) => {
        const x0 = FOLD_X[k] + 140;
        const x1 = FOLD_X[k + 1] - 10;
        const tt = t(2, k * STEP_GAP);
        const draw = clamp01(tt / 18);
        const fall = clamp01((tt - 26) / 24);
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: x0, width: x1 - x0, top: Y - 56, display: "flex", justifyContent: "center", ...appear(s(2, k * STEP_GAP)) }}>
              <CmdChip cmd={c} size={22} />
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              <line x1={x0} y1={Y + 38} x2={mix(x0, x1 - 10, draw)} y2={Y + 38} stroke={C.dim} strokeWidth={3} />
              <polygon points={`${x1},${Y + 38} ${x1 - 12},${Y + 31} ${x1 - 12},${Y + 45}`} fill={C.dim} opacity={draw >= 1 ? 1 : 0} />
            </svg>
            {tt > 12 && (
              <div
                style={{
                  position: "absolute",
                  left: (x0 + x1) / 2 - 80,
                  width: 160,
                  top: Y + 70 + fall * 90,
                  display: "flex",
                  justifyContent: "center",
                  opacity: clamp01((tt - 12) / 8) * (1 - fall * 0.85),
                  transform: `rotate(${fall * (k % 2 ? 14 : -14)}deg)`,
                }}
              >
                <DecChip ok={DECISIONS[k]} size={20} />
              </div>
            )}
          </React.Fragment>
        );
      })}
      <At x={96} y={530} step={2} delay={3 * STEP_GAP + 20} size={24} weight={600} color={C.dim}>
        <M c={C.dim}>snd</M> відкидає рішення на кожному кроці
      </At>
      <At x={96} y={880} w={1720} step={3} size={30} weight={600}>
        <M>foldl</M> обчислює кінцевий стан, але <A>не зберігає рішення</A> щодо кожної команди.
      </At>
    </Slide>
  );
};

/* Історія станів через scanl */
const ROWS = [
  { k: "0", cmd: "Початковий стан", dec: "–", bal: 0 },
  { k: "1", cmd: "Deposit 50", dec: "Approved", bal: 50 },
  { k: "2", cmd: "Withdraw 20", dec: "Approved", bal: 30 },
  { k: "3", cmd: "Withdraw 100", dec: "Declined", bal: 30 },
];

const ScanSlide: React.FC = () => {
  const { s } = useSteps();
  const COLS = [130, 300, 760, 1160];
  const Y0 = 450;
  const RH = 76;
  const balHi = s(3, 0);
  const decDim = s(3, 0);
  return (
    <Slide title="Історія станів через scanl">
      <Lead>
        Якщо потрібні проміжні значення, використовується <M>scanl</M>.
      </Lead>
      <Code x={96} y={300} size={32} step={1} code={`balances = scanl advance 0 commands   -- [0,50,30,30]`} />
      {["Крок", "Команда", "Рішення", "Баланс після команди"].map((h, i) => (
        <At key={h} x={COLS[i]} y={Y0 - 50} step={2} size={22} weight={800} color={i === 3 ? C.lav : C.dim} style={{ letterSpacing: 1 }}>
          {h.toUpperCase()}
        </At>
      ))}
      {ROWS.map((r, i) => {
        const p = s(2, 8 + i * 14, POP);
        const y = Y0 + i * RH;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 96,
              top: y,
              width: 1400,
              height: RH - 14,
              borderRadius: 12,
              background: C.panel,
              borderLeft: `5px solid ${C.accent}`,
              ...appear(p, 14),
            }}
          >
            <div style={{ position: "absolute", left: COLS[0] - 96, top: 0, height: RH - 14, display: "flex", alignItems: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: C.dim }}>
              {r.k}
            </div>
            <div style={{ position: "absolute", left: COLS[1] - 96, top: 0, height: RH - 14, display: "flex", alignItems: "center", fontFamily: i ? F.mono : F.body, fontWeight: 700, fontSize: 27, color: i ? (i === 1 ? C.mint : C.amber) : C.text }}>
              {r.cmd}
            </div>
            <div
              style={{
                position: "absolute",
                left: COLS[2] - 96,
                top: 0,
                height: RH - 14,
                display: "flex",
                alignItems: "center",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 27,
                color: r.dec === "Declined" ? C.red : r.dec === "Approved" ? C.mint : C.faint,
                opacity: mix(1, 0.35, decDim),
              }}
            >
              {r.dec}
            </div>
            <div style={{ position: "absolute", left: COLS[3] - 96, top: 7, ...appear(1) }}>
              <BalBox v={r.bal} w={120} h={48} size={28} glow={balHi} />
            </div>
          </div>
        );
      })}
      <At x={1530} y={Y0 + 40} w={300} step={3} delay={10} size={26} weight={700} color={C.lav}>
        цей стовпець і є <M c={C.lav}>balances</M>
      </At>
      <At x={1530} y={Y0 + 160} w={300} step={3} delay={20} size={24} weight={600} color={C.dim}>
        рішень у списку немає
      </At>
      <At x={96} y={800} w={1720} step={4} size={30} weight={600}>
        Історія <M c={C.lav}>s₀, s₁, …, sₙ</M> – звичайний список, який можна відтворити й протестувати. Стан тут передається явно; далі – як зберегти його в <A>замиканні</A>.
      </At>
    </Slide>
  );
};

export const s3Slides: SlideDef[] = [
  { id: "threading", title: "Передавання стану", steps: [40, 70, 3 * RUN + 50, 70], C: Threading },
  { id: "foldl", title: "foldl", steps: [40, 70, 3 * 36 + 60, 70], C: FoldSlide },
  { id: "scanl", title: "scanl", steps: [40, 40, 80, 60, 70], C: ScanSlide },
];
