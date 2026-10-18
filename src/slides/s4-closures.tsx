import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { clamp01, pulse } from "./common";
import { SyntaxBox } from "./kit";
import { BalBox, CmdChip, DecChip } from "./bank";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

const Lock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x={5} y={11} width={14} height={10} rx={2} fill="none" stroke={color} strokeWidth={2} />
    <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" fill="none" stroke={color} strokeWidth={2} />
  </svg>
);

/** A function value with its captured environment shown as a sealed pocket. */
const ClosureCard: React.FC<{ x: number; y: number; w?: number; name: string; body: string; env: React.ReactNode; p: number; glow?: number; dim?: number }> = ({
  x,
  y,
  w = 420,
  name,
  body,
  env,
  p,
  glow = 0,
  dim = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      borderRadius: 18,
      border: `3px solid ${C.accentHi}`,
      background: C.panel,
      boxSizing: "border-box",
      overflow: "hidden",
      boxShadow: glow > 0.02 ? `0 0 ${30 * glow}px ${C.accentHi}` : undefined,
      opacity: clamp01(p) * (1 - 0.55 * dim),
      transform: `scale(${mix(0.8, 1, clamp01(p))})`,
    }}
  >
    <div style={{ padding: "14px 20px 10px", fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: C.accentHi }}>{name}</div>
    <div style={{ padding: "0 20px 14px", fontFamily: F.mono, fontSize: 24, color: C.dim, whiteSpace: "pre", fontVariantLigatures: "none" }}>{body}</div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        background: `${C.amber}14`,
        borderTop: `2px dashed ${C.amber}88`,
        fontFamily: F.mono,
        fontSize: 27,
        color: C.amber,
      }}
    >
      <Lock size={28} color={C.amber} />
      <span style={{ color: C.dim, fontSize: 20, fontFamily: F.body, fontWeight: 600 }}>оточення:</span>
      {env}
    </div>
  </div>
);

/* Замикання */
const Closure: React.FC = () => {
  const { s, t } = useSteps();
  const calls = [
    { arg: 10, res: 15 },
    { arg: 1, res: 6 },
  ];
  return (
    <Slide title="Замикання">
      <Lead>
        <A>Замикання</A> – функція разом із лексичним оточенням, у якому збережено потрібні зв’язування.
      </Lead>
      <SyntaxBox x={96} y={330} w={900} step={1} size={24} title="Нагадування" lines={["\\{x} -> {expr}   -- функція без імені", "-- {expr} може використовувати імена з оточення"]} />
      <Code
        x={96}
        y={490}
        size={30}
        step={1}
        delay={24}
        stagger={8}
        code={`
          add :: Int -> (Int -> Int)
          add n = \\x -> x + n
          add5 = add 5
          @3 add5 10   -- 15
          @3+20 add5 1    -- 6
        `}
      />
      <ClosureCard x={1220} y={340} w={480} name="add5" body={"\\x -> x + n"} env={<span>n = 5</span>} p={s(2, 0, POP)} glow={Math.max(...calls.map((_, i) => pulse(t(3, i * 20), 10, 14)))} />
      {calls.map((c, i) => {
        const p = s(3, i * 20, POP);
        const y = 600 + i * 90;
        return (
          <div key={i} style={{ position: "absolute", left: 1220, top: y, display: "flex", alignItems: "center", gap: 18, fontFamily: F.mono, fontSize: 30, ...appear(p) }}>
            <BalBox v={c.arg} size={26} color={C.lav} />
            <span style={{ color: C.faint }}>→ add5 →</span>
            <BalBox v={c.res} size={26} color={C.mint} />
          </div>
        );
      })}
      <At x={96} y={880} w={1720} step={4} size={30} weight={600}>
        Захоплене значення <M c={C.amber}>n = 5</M> не змінюється: кожен виклик <M>add5</M> використовує саме його.
      </At>
    </Slide>
  );
};

/* Замикання зберігає контекст */
const Account0: React.FC = () => {
  const { s, t } = useSteps();
  return (
    <Slide title="Замикання зберігає контекст">
      <Lead>Замикання може захопити баланс, з яким створено функцію.</Lead>
      <Code
        x={96}
        y={300}
        size={28}
        lh={42}
        step={1}
        stagger={8}
        code={`
          accountAt :: Balance -> Command -> (Decision, Balance)
          accountAt balance = \\command -> transition command balance
          account0 = accountAt 0
          @2 account0 (Deposit 50)   -- (Approved,50)
          @3 account0 (Deposit 50)   -- знову (Approved,50)
        `}
      />
      <ClosureCard x={96} y={560} w={660} name="account0" body={"\\command -> transition command balance"} env={<span>balance = 0</span>} p={s(1, 30, POP)} glow={Math.max(pulse(t(2, 0), 10, 14), pulse(t(3, 0), 10, 14))} />
      {[2, 3].map((st, i) => {
        const p = s(st, 14, POP);
        return (
          <div key={st} style={{ position: "absolute", left: 820, top: 590 + i * 110, display: "flex", alignItems: "center", gap: 16, fontFamily: F.mono, fontSize: 28, ...appear(p) }}>
            <span style={{ color: C.dim }}>{`виклик ${i + 1}:`}</span>
            <CmdChip cmd={{ kind: "Deposit", n: 50 }} size={22} />
            <span style={{ color: C.faint }}>→</span>
            <span style={{ color: C.dim }}>(</span>
            <DecChip ok size={22} />
            <span style={{ color: C.dim }}>,</span>
            <BalBox v={50} size={24} h={46} />
            <span style={{ color: C.dim }}>)</span>
          </div>
        );
      })}
      <At x={820} y={810} step={3} delay={30} size={24} weight={700} color={C.amber}>
        той самий результат: balance у замиканні досі 0
      </At>
      <At x={96} y={890} w={1720} step={4} size={30} weight={600}>
        У замиканні збережено значення <M c={C.amber}>balance = 0</M>; виклик не змінює його.
      </At>
    </Slide>
  );
};

/* Наступний стан – наступне замикання */
const NEXT = [
  { name: "account0", bal: 0 },
  { name: "account1", bal: 50 },
  { name: "account2", bal: 30 },
];

const NextClosure: React.FC = () => {
  const { s, t } = useSteps();
  const GAP = 50;
  return (
    <Slide title="Наступний стан – наступне замикання">
      <Lead>Для продовження обчислення створюється нове замикання з новим балансом.</Lead>
      <Code
        x={96}
        y={300}
        size={30}
        step={1}
        stagger={10}
        code={`
          (r1, b1) = account0 (Deposit 50)
          account1 = accountAt b1
          (r2, b2) = account1 (Withdraw 20)
          -- b2 == 30
        `}
      />
      {NEXT.map((n, i) => {
        const p = s(2, i * GAP, POP);
        const x = 110 + i * 600;
        return (
          <React.Fragment key={n.name}>
            <ClosureCard x={x} y={560} w={420} name={n.name} body={"\\command -> …"} env={<span>{`balance = ${n.bal}`}</span>} p={p} glow={pulse(t(2, i * GAP), 8, 16)} />
            {i < NEXT.length - 1 && (
              <>
                <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(2, i * GAP + 20)) }}>
                  <line x1={x + 430} y1={660} x2={x + 590} y2={660} stroke={C.dim} strokeWidth={3} />
                  <polygon points={`${x + 598},660 ${x + 584},652 ${x + 584},668`} fill={C.dim} />
                </svg>
                <div style={{ position: "absolute", left: x + 432, width: 160, top: 600, display: "flex", justifyContent: "center", ...appear(s(2, i * GAP + 20)) }}>
                  <CmdChip cmd={i === 0 ? { kind: "Deposit", n: 50 } : { kind: "Withdraw", n: 20 }} size={18} />
                </div>
              </>
            )}
          </React.Fragment>
        );
      })}
      <At x={110} y={790} w={600} step={3} size={26} weight={700} color={C.amber}>
        account0 досі починає з 0
      </At>
      <At x={96} y={880} w={1720} step={3} delay={14} size={30} weight={600}>
        Повторний виклик <M>account0</M> почнеться з балансу <M c={C.lav}>0</M>, а не 50: старе замикання <A>не запам’ятовує</A> свого попереднього виклику.
      </At>
    </Slide>
  );
};

/* Об’єкт і замикання */
const ObjVsClosure: React.FC = () => {
  const { s, t } = useSteps();
  const vals = [0, 50, 30];
  const cur = vals.reduce((acc, _, i) => (t(1, 20 + i * 30) >= 0 ? i : acc), 0);
  return (
    <Slide title="Об’єкт і замикання">
      <At x={96} y={220} step={1} size={26} weight={800} color={C.red} style={{ letterSpacing: 1 }}>
        ОБ’ЄКТ: ОДИН, ЩО ЗМІНЮЄТЬСЯ
      </At>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 280,
          width: 760,
          height: 300,
          borderRadius: 18,
          border: `3px solid ${C.red}`,
          background: `${C.red}10`,
          boxSizing: "border-box",
          padding: "26px 32px",
          ...appear(s(1, 0, POP)),
        }}
      >
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.red }}>account : Account</div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: F.mono, fontSize: 28, color: C.dim }}>balance =</span>
          <BalBox v={vals[cur]} color={C.red} size={40} w={160} h={84} />
        </div>
        <div style={{ marginTop: 26, fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.dim }}>метод змінює той самий об’єкт</div>
      </div>
      <At x={1004} y={220} step={2} size={26} weight={800} color={C.accentHi} style={{ letterSpacing: 1 }}>
        ЗАМИКАННЯ: ВЕРСІЇ КОНТЕКСТУ
      </At>
      {NEXT.map((n, i) => (
        <div key={n.name} style={{ position: "absolute", left: 1004 + i * 36, top: 280 + i * 92, ...appear(s(2, i * 14, POP)) }}>
          <div
            style={{
              width: 680,
              height: 76,
              borderRadius: 14,
              border: `3px solid ${C.accentHi}`,
              background: C.panel,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 22px",
              boxSizing: "border-box",
              fontFamily: F.mono,
              fontSize: 26,
            }}
          >
            <span style={{ color: C.accentHi, fontWeight: 700 }}>{n.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.amber }}>
              <Lock size={22} color={C.amber} />
              {`balance = ${n.bal}`}
            </span>
          </div>
        </div>
      ))}
      <At x={96} y={640} w={1720} step={3} size={30} weight={600}>
        В імперативному об’єкті метод змінює <A c={C.red}>один і той самий об’єкт</A>; у чистому підході кожну наступну версію треба <A>передати або зберегти окремо</A>.
      </At>
      <At x={96} y={760} w={1720} step={4} size={30} weight={600}>
        Замикання зручні для незмінної <A c={C.amber}>конфігурації, правил і параметрів</A>. Для довгої послідовності переходів краще відокремити функцію переходу від механізму передавання стану.
      </At>
      <At x={96} y={900} w={1720} step={5} size={30} weight={600} color={C.dim}>
        Як автоматизувати це передавання? Відповідь – абстракція <A>State</A>.
      </At>
    </Slide>
  );
};

export const s4Slides: SlideDef[] = [
  { id: "closure", title: "Замикання", steps: [40, 70, 50, 70, 70], C: Closure },
  { id: "account0", title: "Захоплений баланс", steps: [40, 60, 50, 70, 60], C: Account0 },
  { id: "next-closure", title: "Наступне замикання", steps: [40, 60, 3 * 50 + 30, 70], C: NextClosure },
  { id: "obj-vs-closure", title: "Об’єкт і замикання", steps: [20, 110, 60, 60, 70, 60], C: ObjVsClosure },
];
