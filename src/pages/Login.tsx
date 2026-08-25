import { useEffect, useState } from "react";
import { useApp } from "../store";
import { OPERATORS, timeAgo } from "../data/seed";
import { I } from "../components/ui";

const DEMO_PW = "markaz-ops";

export default function Login() {
  const app = useApp();
  const [opId, setOpId] = useState("op1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const locked = tries >= 3;
  const op = OPERATORS.find((o) => o.id === opId) ?? OPERATORS[0];

  const uptimeSec = 14 * 86400 + 6 * 3600 + 41 * 60 + (tick % 86400);
  const d = Math.floor(uptimeSec / 86400);
  const hh = String(Math.floor((uptimeSec % 86400) / 3600)).padStart(2, "0");
  const mi = String(Math.floor((uptimeSec % 3600) / 60)).padStart(2, "0");
  const se = String(uptimeSec % 60).padStart(2, "0");
  const queue = 3 + (tick % 7);
  const latency = 198 + ((tick * 13) % 41);

  const services = [
    { name: "API gateway", ok: true, meta: `${latency}ms p95` },
    { name: "License service", ok: true, meta: "healthy" },
    { name: "Notification pipeline", ok: true, meta: `${queue} queued` },
    { name: "SMS gateway adapter", ok: false, meta: "degraded · 1.2s" },
  ];

  const activity = app.db.ownerAudit.slice(0, 4);
  const cycle = tick % Math.max(1, activity.length);

  const submit = () => {
    if (busy || locked) return;
    if (pw !== DEMO_PW) {
      const t = tries + 1;
      setTries(t);
      setErr(t >= 3 ? "Account locked after 3 failed attempts. A security event was logged — contact the Super Owner to unlock." : `Invalid operator password. ${3 - t} attempt${3 - t === 1 ? "" : "s"} remaining before lockout.`);
      return;
    }
    setErr("");
    setBusy(true);
    setTimeout(() => app.login("owner", op.name, op.role), 850);
  };

  return (
    <div className="relative flex min-h-screen items-stretch overflow-hidden bg-night text-canvas">
      {/* ambient layers */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(900px 480px at 12% -10%, rgba(201,154,46,0.13), transparent 60%), radial-gradient(800px 500px at 105% 110%, rgba(12,107,88,0.32), transparent 60%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />

      {/* ============ LEFT — platform pulse ============ */}
      <div className="relative hidden flex-1 flex-col justify-between p-10 lg:flex xl:p-14">
        <div className="anim-up">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-night shadow-lg shadow-accent/25"><I n="cpu" size={21} /></span>
            <div>
              <p className="display text-[17px] font-bold leading-tight text-white">Markaz Cloud</p>
              <p className="text-[10px] font-bold tracking-[0.22em] text-accent">OPERATOR CONSOLE</p>
            </div>
            <span className="num ml-4 rounded-md border border-white/12 px-2 py-1 text-[10px] tracking-widest text-canvas/50">v2.4.1 · ap-south-1</span>
          </div>

          <h1 className="display mt-12 max-w-xl text-[40px] font-bold leading-[1.06] text-white xl:text-[46px]">
            The control plane behind <span className="text-accent">every school</span> you run.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-canvas/60">
            Tenants, trials, licenses, plans, modules, quotas, billing and security for the whole platform —
            without ever touching a school's operational records.
          </p>
        </div>

        <div className="anim-up grid max-w-xl gap-3" style={{ animationDelay: "120ms" }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-canvas/45">Platform status</p>
              <p className="num text-[11px] text-canvas/50">uptime <b className="text-white">{d}d {hh}:{mi}:{se}</b></p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
              {services.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "dot-live bg-ok" : "bg-warn"}`} />
                  <span className="flex-1 truncate text-[12px] text-canvas/80">{s.name}</span>
                  <span className={`num text-[10.5px] ${s.ok ? "text-canvas/45" : "text-warn"}`}>{s.meta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-canvas/45">
              <span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" /> Recent privileged activity
            </p>
            <div className="mt-2.5 space-y-1.5">
              {activity.map((a, i) => (
                <p key={a.id} className={`flex items-baseline gap-2 text-[11.5px] transition-all duration-500 ${i === cycle ? "text-white" : "text-canvas/45"}`}>
                  <span className={`h-1 w-1 shrink-0 translate-y-[-2px] rounded-full ${a.risk === "elevated" ? "bg-danger" : "bg-accent/70"}`} />
                  <span className="truncate"><b>{a.action}</b> · {a.target}</span>
                  <span className="num ml-auto shrink-0 text-[10px] text-canvas/35">{timeAgo(a.time)}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="anim-up mt-8 flex max-w-xl items-start gap-2 text-[11px] leading-relaxed text-canvas/40" style={{ animationDelay: "200ms" }}>
          <I n="shield" size={13} className="mt-0.5 shrink-0 text-accent/80" />
          Data boundary: this console sees commercial metadata and aggregated usage only. Student, parent and teacher records remain inside each tenant environment. Support access is explicit, reason-logged and time-limited.
        </p>
      </div>

      {/* ============ RIGHT — operator sign-in ============ */}
      <div className="relative flex w-full flex-col justify-center border-l border-white/8 bg-night2/60 px-6 py-10 backdrop-blur-md sm:px-12 lg:w-[480px] lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-night"><I n="cpu" size={19} /></span>
              <div>
                <p className="display text-[15px] font-bold text-white">Markaz Cloud</p>
                <p className="text-[9.5px] font-bold tracking-[0.2em] text-accent">OPERATOR CONSOLE</p>
              </div>
            </div>
          </div>

          <div className="anim-pop">
            <div className="flex items-center gap-2">
              <h2 className="display text-[22px] font-bold text-white">Operator sign-in</h2>
              <span className="ml-auto flex items-center gap-1 rounded-md border border-ok/30 bg-ok/10 px-2 py-1 text-[10px] font-bold text-ok"><I n="lock" size={11} /> 2FA ENFORCED</span>
            </div>
            <p className="mt-1 text-[12px] text-canvas/50">Internal accounts only. Every session is recorded to the audit log.</p>

            <p className="mt-6 mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-canvas/45">Select operator account</p>
            <div className="space-y-1.5">
              {OPERATORS.slice(0, 5).map((o) => (
                <button key={o.id} onClick={() => { setOpId(o.id); setErr(""); }}
                  className={`focus-ring flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${opId === o.id ? "border-accent/70 bg-accent/10 shadow-lg shadow-accent/5" : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${opId === o.id ? "bg-accent text-night" : "bg-white/10 text-canvas/70"}`}>
                    {o.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-white">{o.name}</span>
                    <span className="block truncate text-[10.5px] text-canvas/45">{o.email}</span>
                  </span>
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${opId === o.id ? "bg-accent/20 text-accent" : "bg-white/8 text-canvas/50"}`}>{o.role}</span>
                </button>
              ))}
            </div>

            <p className="mt-5 mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-canvas/45">Password</p>
            <div className={`flex items-center gap-2 rounded-xl border bg-white/[0.04] px-3 py-2.5 transition ${err ? "border-danger/60" : "border-white/12 focus-within:border-accent/60"}`}>
              <I n="lock" size={15} className="text-canvas/40" />
              <input type="password" value={pw} disabled={locked || busy}
                onChange={(e) => { setPw(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Operator password"
                className="flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-canvas/30 disabled:opacity-50" />
            </div>
            <button onClick={() => setPw(DEMO_PW)} className="mt-1.5 text-[10.5px] text-canvas/40 underline decoration-dotted underline-offset-2 transition hover:text-accent">
              demo password: <span className="num">{DEMO_PW}</span> — tap to fill
            </button>

            {err && (
              <p className={`anim-pop mt-3 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[11.5px] leading-snug ${locked ? "border-danger/50 bg-danger/15 text-danger" : "border-warn/40 bg-warn/10 text-warn"}`}>
                <I n={locked ? "lock" : "alert"} size={14} className="mt-0.5 shrink-0" /> {err}
              </p>
            )}

            <button onClick={submit} disabled={locked || busy}
              className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[13.5px] font-bold text-night shadow-lg shadow-accent/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? (<><I n="refresh" size={15} className="animate-spin" /> Verifying credentials + 2FA…</>) : locked ? (<><I n="lock" size={15} /> Account locked</>) : (<><I n="logout" size={15} /> Enter console</>)}
            </button>
            {locked && (
              <button onClick={() => { setTries(0); setErr(""); setPw(""); }} className="mt-2 w-full text-center text-[11px] text-canvas/45 underline decoration-dotted underline-offset-2 transition hover:text-accent">
                Reset demo lockout
              </button>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-[10.5px] text-canvas/35">
              <span className="flex items-center gap-1.5"><span className="dot-live h-1.5 w-1.5 rounded-full bg-ok" /> All regions operational</span>
              <span className="num">{OPERATORS.length} operator accounts · 2FA on {OPERATORS.filter((o) => o.twoFA).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
