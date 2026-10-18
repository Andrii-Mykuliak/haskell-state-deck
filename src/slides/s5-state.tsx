import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { clamp01, Num, pulse } from "./common";
import { SyntaxBox } from "./kit";
import { BALANCES, BalBox, CmdChip, COMMANDS, DECISIONS, DecChip, Gear } from "./bank";

const appear = (p: number, dy = 20): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * dy}px)` });

/* Чого бракує явному передаванню? */
const Missing: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Чого бракує явному передаванню?">
      <Lead>Велика програма багато разів виконує однакову операцію: отримати стан → обчислити новий → передати далі.</Lead>
      {[0, 1, 2, 3].map((k) => (
        <React.Fragment key={k}>
          <div style={{ position: "absolute", left: 120 + k * 300, top: 350, ...appear(s(1, k * 10, POP)) }}>
            <BalBox v={`s${"₀₁₂₃"[k]}`} w={150} h={76} size={34} />
          </div>
          <div style={{ position: "absolute", left: 120 + k * 300 + 180, top: 362, fontFamily: F.mono, fontSize: 40, color: C.faint, ...appear(s(1, k * 10 + 5)) }}>→</div>
        </React.Fragment>
      ))}
      <At x={120 + 4 * 300} y={360} step={1} delay={44} size={44} weight={800} color={C.faint}>
        …
      </At>
      <Code
        x={96}
        y={500}
        size={30}
        step={2}
        stagger={8}
        code={`
          ([[!3|r1]], [[!3|s1]]) = transition (Deposit 50) 0
          ([[!3@8|r2]], [[!3@8|s2]]) = transition (Withdraw 20) [[!3@8|s1]]
          ([[!3@16|r3]], [[!3@16|s3]]) = transition (Withdraw 100) [[!3@16|s2]]
          [[.2@30|…]]
          [[.2@30|(r99, s99) = transition c99 s98]]
        `}
      />
      <At x={1180} y={540} w={640} step={3} delay={24} size={28} weight={700} color={C.red}>
        кожен крок вимагає двох нових імен, і їх легко переплутати
      </At>
      <At x={96} y={880} w={1720} step={4} size={32} weight={600}>
        Бажано описувати <A>дії</A>, не вводячи вручну ім’я кожного проміжного стану.
      </At>
    </Slide>
  );
};

/* Абстракція State */
const Capsule: React.FC<{ x: number; y: number; w: number; label: string; p: number; open?: number; glow?: number }> = ({ x, y, w, label, p, open = 0, glow = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 120, ...appear(p) }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 22,
        border: `3px solid ${C.accentHi}`,
        background: "transparent",
        boxShadow: glow > 0.02 ? `0 0 ${30 * glow}px ${C.accentHi}` : undefined,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 120,
        borderRadius: 22,
        background: `linear-gradient(180deg, ${C.accent}, #5e5086)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: 30,
        color: C.text,
        transform: `translateY(${-open * 96}px) rotate(${-open * 4}deg)`,
        transformOrigin: "left bottom",
        opacity: 1 - open * 0.15,
      }}
    >
      {label}
    </div>
  </div>
);

const StateAbs: React.FC = () => {
  const { s, t } = useSteps();
  const open = s(2, 0);
  const inner = s(2, 16, POP);
  const chain = s(3, 0, POP);
  const wireT = Math.max(0, t(3, 10));
  return (
    <Slide title="Абстракція State">
      <Lead>
        <M c={C.accentHi}>State s a</M> – чисте обчислення зі станом типу <M c={C.lav}>s</M> і результатом типу <M>a</M>.
      </Lead>
      <SyntaxBox x={96} y={290} w={900} step={1} size={30} lines={["State {s} {a}   ≈   {s} -> ({a}, {s})"]} />
      <div style={{ position: "absolute", left: 1150, top: 470, width: 600, height: 120, ...appear(inner) }}>
        <div style={{ position: "absolute", left: 30, top: 34, display: "flex", alignItems: "center", gap: 14, fontFamily: F.mono, fontSize: 30 }}>
          <BalBox v="s" size={26} w={60} h={50} />
          <span style={{ color: C.faint }}>→</span>
          <Gear size={44} angle={t(2, 0) > 0 ? t(2, 0) * 4 : 0} />
          <span style={{ color: C.faint }}>→</span>
          <span style={{ color: C.dim }}>(</span>
          <BalBox v="a" size={26} w={60} h={50} color={C.mint} />
          <span style={{ color: C.dim }}>,</span>
          <BalBox v="s′" size={26} w={60} h={50} />
          <span style={{ color: C.dim }}>)</span>
        </div>
      </div>
      <Capsule x={1150} y={470} w={600} label="State Balance Decision" p={s(1, 20, POP)} open={open} />
      <At x={1150} y={610} w={600} step={2} delay={20} size={24} weight={600} color={C.dim} align="center">
        усередині – звичайна функція стану
      </At>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(chain) }}>
        <line x1={90} y1={738} x2={1110} y2={738} stroke={C.lav} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-wireT * 3} opacity={0.6} />
        {[0, 1, 2].map((i) => {
          const u = ((wireT / 60 + i / 3) % 1 + 1) % 1;
          return <circle key={i} cx={90 + u * 1020} cy={738} r={8} fill={C.lav} opacity={0.9} />;
        })}
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + i * 330, top: 700, ...appear(chain) }}>
          <div
            style={{
              width: 300,
              height: 76,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${C.accent}, #5e5086)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 24,
              color: C.text,
            }}
          >
            {`дія ${i + 1}`}
          </div>
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + i * 330, width: 300, top: 640, display: "flex", justifyContent: "center", ...appear(s(3, 20 + i * 12, POP), 10) }}>
          <BalBox v={`a${"₁₂₃"[i]}`} size={22} w={70} h={42} color={C.mint} />
        </div>
      ))}
      <At x={1150} y={716} w={680} step={3} delay={20} size={24} weight={600} color={C.lav}>
        стан тече всередині ланцюжка; ззовні видно лише результати
      </At>
      <At x={96} y={880} w={1720} step={4} size={32} weight={600}>
        State організовує передавання стану між діями; це <A>не глобальна змінна</A>.
      </At>
    </Slide>
  );
};

/* Трасування do-блоку: підсвічування рядка й значення праворуч. */
type TraceRow = { line: number; value?: React.ReactNode; state?: React.ReactNode; newState?: boolean };

const Trace: React.FC<{ y0: number; lh: number; step: number; gap: number; rows: TraceRow[]; vx: number; sx: number }> = ({ y0, lh, step, gap, rows, vx, sx }) => {
  const { s, t } = useSteps();
  const cur = rows.reduce((acc, _, i) => (t(step, i * gap) >= 0 ? i : acc), -1);
  return (
    <>
      {cur >= 0 && (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: y0 + rows[cur].line * lh - 4,
            width: 1760,
            height: lh,
            borderRadius: 10,
            background: "rgba(141,118,220,0.14)",
            borderLeft: `4px solid ${C.accentHi}`,
            opacity: 1 - clamp01(s(step + 1, 0)),
          }}
        />
      )}
      {rows.map((r, i) => {
        const p = s(step, i * gap + 6, POP);
        const y = y0 + r.line * lh;
        return (
          <React.Fragment key={i}>
            {r.value !== undefined && (
              <div style={{ position: "absolute", left: vx, top: y - 4, height: lh, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontSize: 26, color: C.text, ...appear(p, 8) }}>
                {r.value}
              </div>
            )}
            {r.state !== undefined && (
              <div style={{ position: "absolute", left: sx, top: y - 2, ...appear(p, 8) }}>
                <BalBox v={r.state} size={24} w={84} h={lh - 6} glow={r.newState ? pulse(t(step, i * gap + 6), 6, 16) : 0} dashed={!r.newState} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

/* get, put і runState */
const TICK_LH = 50;
const TICK_Y = 490;
const TICK_GAP = 34;

const GetPut: React.FC = () => (
  <Slide title="get, put і runState">
    <Lead>Три операції достатньо, щоб читати стан, задавати наступний і запускати обчислення.</Lead>
    <SyntaxBox
      x={96}
      y={290}
      w={1300}
      step={1}
      size={24}
      lines={["get         :: State {s} {s}    -- прочитати поточний стан", "put {new}   :: State {s} ()     -- задати наступний стан", "runState {m} {s0}               -- ({результат}, {кінцевий стан})"]}
    />
    <Code
      x={96}
      y={TICK_Y}
      size={30}
      lh={TICK_LH}
      step={2}
      stagger={6}
      code={`
        tick :: State Int Int
        tick = do
          n <- get
          put (n + 1)
          pure n
        runState tick 5   -- (5,6)
      `}
    />
    <At x={1020} y={TICK_Y + 6} step={3} size={22} weight={800} color={C.mint} style={{ letterSpacing: 1 }}>
      ЗНАЧЕННЯ
    </At>
    <At x={1500} y={TICK_Y + 6} step={3} size={22} weight={800} color={C.lav} style={{ letterSpacing: 1 }}>
      СТАН
    </At>
    <Trace
      y0={TICK_Y}
      lh={TICK_LH}
      step={3}
      gap={TICK_GAP}
      vx={1020}
      sx={1500}
      rows={[
        { line: 2, value: <span>n = <span style={{ color: C.mint }}>5</span></span>, state: 5 },
        { line: 3, value: <span style={{ color: C.dim }}>()</span>, state: 6, newState: true },
        { line: 4, value: <span>результат <span style={{ color: C.mint }}>5</span></span>, state: 6 },
        { line: 5, value: <span style={{ color: C.text }}>(<span style={{ color: C.mint }}>5</span>, <span style={{ color: C.lav }}>6</span>)</span> },
      ]}
    />
    <At x={96} y={880} w={1720} step={4} size={30} weight={600}>
      <M>put</M> не перезаписує 5: він задає <A>наступне</A> значення стану, а 5 лишається значенням, прочитаним раніше.
    </At>
  </Slide>
);

/* Команда як обчислення State */
const RC_Y = 420;
const RC_LH = 46;

const RunCommand: React.FC = () => (
  <Slide title="Команда як обчислення State">
    <Lead>
      <M>get</M> читає переданий стан; <M>put</M> задає наступний стан усередині обчислення.
    </Lead>
    <SyntaxBox x={96} y={290} w={1000} step={1} size={24} lines={["let {pattern} = {expr}   -- у do-блоці: локальне ім’я"]} />
    <Code
      x={96}
      y={RC_Y}
      size={28}
      lh={RC_LH}
      step={1}
      delay={20}
      stagger={6}
      code={`
        import Control.Monad.State.Strict
        runCommand :: Command -> State Balance Decision
        runCommand command = do
          balance <- get
          let (decision, next) = transition command balance
          put next
          pure decision
        @3 runState (runCommand (Withdraw 20)) 50   -- (Approved,30)
      `}
    />
    <At x={1080} y={RC_Y + 2 * RC_LH + 4} step={2} size={22} weight={800} color={C.mint} style={{ letterSpacing: 1 }}>
      ЗНАЧЕННЯ
    </At>
    <At x={1640} y={RC_Y + 2 * RC_LH + 4} step={2} size={22} weight={800} color={C.lav} style={{ letterSpacing: 1 }}>
      СТАН
    </At>
    <Trace
      y0={RC_Y}
      lh={RC_LH}
      step={2}
      gap={34}
      vx={1080}
      sx={1640}
      rows={[
        { line: 3, value: <span>balance = <span style={{ color: C.lav }}>50</span></span>, state: 50 },
        {
          line: 4,
          value: (
            <span>
              (<span style={{ color: C.mint }}>Approved</span>, <span style={{ color: C.lav }}>30</span>)
            </span>
          ),
          state: 50,
        },
        { line: 5, value: <span style={{ color: C.dim }}>()</span>, state: 30, newState: true },
        { line: 6, value: <span>результат <span style={{ color: C.mint }}>Approved</span></span>, state: 30 },
      ]}
    />
    <At x={96} y={880} w={1720} step={4} size={30} weight={600}>
      <M>get</M> і <M>put</M> не змінюють спільну пам’ять: вони описують <A>передавання значення</A> всередині обчислення.
    </At>
  </Slide>
);

/* Послідовність дій без ручних станів */
const MAPM_GAP = 40;

const MapM: React.FC = () => {
  const { s, t } = useSteps();
  const BX = [130, 730, 1330];
  const BW = 460;
  const BY = 690;
  const WY = 820;
  const tt = Math.max(0, t(2, 0));
  const tokenX = (() => {
    const segs = [
      [60, BX[0] + BW / 2],
      [BX[0] + BW / 2, BX[1] + BW / 2],
      [BX[1] + BW / 2, BX[2] + BW / 2],
      [BX[2] + BW / 2, 1860],
    ];
    const k = Math.min(3, Math.floor(tt / MAPM_GAP));
    const f = clamp01((tt - k * MAPM_GAP) / (MAPM_GAP * 0.8));
    return mix(segs[k][0], segs[k][1], f);
  })();
  const stateIdx = Math.min(3, Math.floor(tt / MAPM_GAP));
  return (
    <Slide title="Послідовність дій без ручних станів">
      <Lead>
        <M>mapM</M> з’єднує дії State у порядку команд і збирає їхні результати.
      </Lead>
      <SyntaxBox x={96} y={290} w={1100} step={1} size={24} lines={["mapM {action} [{x1}, {x2}, …]   -- дії по черзі, результати в список"]} />
      <Code
        x={96}
        y={410}
        size={30}
        lh={44}
        step={1}
        delay={20}
        stagger={8}
        code={`
          program :: State Balance [Decision]
          program = mapM runCommand commands
          runState program 0
          -- ([Approved,Approved,Declined],30)
        `}
      />
      {COMMANDS.map((c, i) => {
        const p = s(2, 0, POP);
        const hot = pulse(t(2, i * MAPM_GAP + MAPM_GAP * 0.8), 4, 14);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: BX[i],
                top: BY,
                width: BW,
                height: 84,
                borderRadius: 18,
                background: `linear-gradient(180deg, ${C.accent}, #5e5086)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 24,
                color: C.text,
                boxShadow: hot > 0.02 ? `0 0 ${30 * hot}px ${C.accentHi}` : undefined,
                ...appear(p),
              }}
            >
              runCommand <CmdChip cmd={c} size={20} />
            </div>
            <div style={{ position: "absolute", left: BX[i], width: BW, top: BY - 56, display: "flex", justifyContent: "center", ...appear(s(2, i * MAPM_GAP + MAPM_GAP * 0.8, POP), 14) }}>
              <DecChip ok={DECISIONS[i]} size={20} />
            </div>
          </React.Fragment>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(2, 0)) }}>
        <line x1={60} y1={WY} x2={1860} y2={WY} stroke={C.lav} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
        {BX.map((x, i) => (
          <line key={i} x1={x + BW / 2} y1={BY + 84} x2={x + BW / 2} y2={WY} stroke={C.lav} strokeWidth={2} opacity={0.4} />
        ))}
        <circle cx={tokenX} cy={WY} r={24} fill={C.lav} opacity={0.18} />
      </svg>
      <div style={{ position: "absolute", left: tokenX - 36, top: WY - 22, width: 72, height: 44, borderRadius: 12, border: `3px solid ${C.lav}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: C.lav, opacity: clamp01(s(2, 0)) }}>
        {BALANCES[stateIdx]}
      </div>
      <At x={60} y={WY + 34} step={2} delay={10} size={22} weight={600} color={C.lav}>
        стан передається між діями автоматично
      </At>
      <At x={96} y={900} w={1720} step={3} size={30} weight={600}>
        На відміну від <M>foldl</M>, зберігаються і рішення, і кінцевий стан, а проміжні стани не потребують <A>жодного імені</A>.
      </At>
    </Slide>
  );
};

/* Що State не робить */
const NotDo: React.FC = () => {
  const { s } = useSteps();
  const run = (y: number, st: number, label: string) => (
    <>
      <At x={96} y={y + 10} step={st} size={26} weight={700} color={C.dim}>
        {label}
      </At>
      {BALANCES.map((v, k) => (
        <React.Fragment key={k}>
          {k > 0 && <div style={{ position: "absolute", left: 520 + k * 170 - 46, top: y + 10, fontFamily: F.mono, fontSize: 30, color: C.faint, ...appear(s(st, 8 + k * 8)) }}>→</div>}
          <div style={{ position: "absolute", left: 520 + k * 170, top: y, ...appear(s(st, 8 + k * 8, POP)) }}>
            <BalBox v={v} w={110} h={62} size={28} glow={k === 0 ? s(st, 40) : 0} />
          </div>
        </React.Fragment>
      ))}
    </>
  );
  return (
    <Slide title="Що State не робить">
      <Lead>
        Повторний <M>runState program 0</M> знову почнеться з балансу <M c={C.lav}>0</M>.
      </Lead>
      {run(320, 1, "запуск 1")}
      {run(430, 2, "запуск 2")}
      <div style={{ position: "absolute", left: 1320, top: 300, display: "flex", gap: 60, ...appear(s(3, 0, POP)) }}>
        {["файл", "база даних"].map((label, i) => (
          <div key={label} style={{ position: "relative", width: 150, textAlign: "center" }}>
            <svg width={150} height={150} viewBox="0 0 100 100">
              {i === 0 ? (
                <path d="M25 10 H60 L78 28 V90 H25 Z M60 10 V28 H78" fill="none" stroke={C.dim} strokeWidth={4} strokeLinejoin="round" />
              ) : (
                <>
                  <ellipse cx={50} cy={22} rx={30} ry={10} fill="none" stroke={C.dim} strokeWidth={4} />
                  <path d="M20 22 V78 A30 10 0 0 0 80 78 V22" fill="none" stroke={C.dim} strokeWidth={4} />
                  <path d="M20 50 A30 10 0 0 0 80 50" fill="none" stroke={C.dim} strokeWidth={4} />
                </>
              )}
              <line x1={10} y1={90} x2={90} y2={10} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.dim }}>{label}</div>
          </div>
        ))}
      </div>
      <At x={96} y={620} w={1720} step={3} delay={10} size={32} weight={600}>
        State не записує зміну у файл чи базу даних і не зберігає її між <A>незалежними запусками</A>.
      </At>
      <At x={96} y={760} w={1720} step={4} size={30} weight={600} color={C.dim}>
        Зовнішнє зберігання стану – окрема відповідальність середовища виконання: файлу, бази даних або керівного циклу. Чисті правила переходу від неї відокремлені.
      </At>
    </Slide>
  );
};

/* Порівняння способів організації стану */
const COMPARE = [
  { how: "Змінюване поле", where: "у наявному об’єкті", next: "мутація того самого об’єкта", color: C.red },
  { how: "Явне передавання", where: "у значенні-аргументі", next: "як результат попередньої функції", color: C.lav },
  { how: "Згортка", where: "в акумуляторі", next: "крок повертає новий акумулятор", color: C.mint },
  { how: "Замикання", where: "у захопленому оточенні", next: "через створення нового замикання", color: C.amber },
  { how: "State", where: "у параметрі чистого обчислення", next: "послідовне зв’язування дій", color: C.accentHi },
];

const Compare: React.FC = () => {
  const { s } = useSteps();
  const COLS = [130, 520, 1080];
  const Y0 = 300;
  const RH = 104;
  return (
    <Slide title="Порівняння способів організації стану">
      {["Спосіб", "Де міститься стан", "Як переходить до наступної операції"].map((h, i) => (
        <At key={h} x={COLS[i]} y={Y0 - 60} step={0} delay={8} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
          {h.toUpperCase()}
        </At>
      ))}
      {COMPARE.map((r, i) => (
        <div
          key={r.how}
          style={{
            position: "absolute",
            left: 96,
            top: Y0 + i * RH,
            width: 1728,
            height: RH - 18,
            borderRadius: 12,
            background: C.panel,
            borderLeft: `6px solid ${r.color}`,
            ...appear(s(1, i * 12, POP), 14),
          }}
        >
          {[r.how, r.where, r.next].map((v, j) => (
            <div
              key={j}
              style={{
                position: "absolute",
                left: COLS[j] - 96,
                top: 0,
                height: RH - 18,
                display: "flex",
                alignItems: "center",
                fontFamily: F.body,
                fontWeight: j === 0 ? 800 : 600,
                fontSize: j === 0 ? 32 : 29,
                color: j === 0 ? r.color : C.text,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      ))}
      <At x={96} y={850} w={1720} step={2} size={32} weight={600}>
        Зміна стану й мутація – <A>різні поняття</A>: лише перший рядок змінює наявне значення.
      </At>
    </Slide>
  );
};

/* Підсумок */
const POINTS: React.ReactNode[] = [
  <>
    <A>Стан</A> – інформація, від якої залежить результат наступної операції; <A c={C.red}>мутація</A> – лише один зі способів його змінювати, а не
    обов’язкова умова.
  </>,
  <>
    Чиста функція <M>transition</M> за командою і станом обчислює рішення та новий стан, не змінюючи вхідних значень; тому кожен перехід можна
    перевірити окремо.
  </>,
  <>
    Послідовність станів описують згортки: <M>foldl</M> дає кінцевий стан, а <M>scanl</M> – усю історію станів, яку можна відтворити й
    перевірити.
  </>,
  <>
    <A c={C.amber}>Замикання</A> зберігає незмінну версію контексту; щоб продовжити обчислення з новим станом, створюють нове замикання.
  </>,
  <>
    <M c={C.accentHi}>State s a ≈ s -&gt; (a, s)</M> приховує передавання стану між діями, але не зберігає його між незалежними запусками програми.
  </>,
];

const Summary: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide>
      <At x={130} y={96} step={0} delay={4} size={72} weight={800} font={F.head}>
        Підсумок
      </At>
      <div
        style={{
          position: "absolute",
          left: 134,
          top: 196,
          height: 6,
          width: 360 * s(0, 10),
          borderRadius: 3,
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
        }}
      />
      {POINTS.map((p, i) => {
        const a = s(0, 16 + i * 10, POP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 134,
              top: 250 + i * 128,
              width: 1660,
              display: "flex",
              alignItems: "flex-start",
              gap: 30,
              opacity: clamp01(a),
              transform: `translateX(${(1 - a) * -30}px)`,
            }}
          >
            <Num n={i + 1} size={48} style={{ marginTop: 2 }} />
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 31, lineHeight: 1.4, color: C.text }}>{p}</div>
          </div>
        );
      })}
    </Slide>
  );
};

export const s5Slides: SlideDef[] = [
  { id: "missing", title: "Чого бракує", steps: [45, 50, 60, 60, 60], C: Missing },
  { id: "state", title: "Абстракція State", steps: [45, 60, 60, 120, 60], C: StateAbs },
  { id: "get-put", title: "get і put", steps: [40, 60, 50, 4 * TICK_GAP + 30, 60], C: GetPut },
  { id: "run-command", title: "runCommand", steps: [40, 70, 4 * 34 + 30, 50, 60], C: RunCommand },
  { id: "mapm", title: "mapM", steps: [40, 70, 4 * MAPM_GAP + 20, 70], C: MapM },
  { id: "not-do", title: "Що State не робить", steps: [40, 60, 60, 60, 70], C: NotDo },
  { id: "compare", title: "Порівняння", steps: [30, 90, 60], C: Compare },
];
export const summarySlide: SlideDef = { id: "summary", title: "Підсумок", steps: [110], C: Summary };
