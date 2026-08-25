import { useState } from "react";
import { useApp } from "../store";
import { ROLE_META, SCHOOL, THEMES } from "../data/seed";
import type { Role } from "../data/seed";
import { Btn, I } from "../components/ui";

const ROLE_ICONS: Record<Role, string> = { admin: "shield", teacher: "exam", student: "student", parent: "users", owner: "cpu" };

export default function Login() {
  const app = useApp();
  const [code, setCode] = useState(SCHOOL.code);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (r: Role) => {
    setRole(r);
    setUser(ROLE_META[r].user);
    setPass(ROLE_META[r].pass);
    setErr("");
  };

  const submit = () => {
    if (!role) { setErr("Select a portal role to continue."); return; }
    if (code.trim().toUpperCase() !== SCHOOL.code && role !== "owner") { setErr(`School code not recognised — use ${SCHOOL.code} for this demo.`); return; }
    if (user !== ROLE_META[role].user || pass !== ROLE_META[role].pass) { setErr("Credentials don't match this demo directory."); return; }
    setErr(""); setBusy(true);
    setTimeout(() => app.login(role), 650);
  };

  return (
    <div className="flex min-h-screen">
      {/* ===== left brand panel ===== */}
      <div className="paper-grid relative hidden w-[42%] flex-col justify-between overflow-hidden bg-night p-10 text-canvas lg:flex">
        <div className="absolute inset-0 opacity-[0.35]" style={{ background: "radial-gradient(700px 420px at 15% -10%, color-mix(in srgb, var(--color-primary) 55%, transparent), transparent), radial-gradient(600px 400px at 110% 110%, color-mix(in srgb, var(--color-accent) 25%, transparent), transparent)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-night"><I n="student" size={22} /></span>
            <div>
              <p className="display text-[19px] font-bold text-white">Markaz ERP</p>
              <p className="text-[11px] tracking-wide text-canvas/55">SCHOOL OPERATING SYSTEM · WHITE-LABEL</p>
            </div>
          </div>
          <h1 className="display mt-12 max-w-md text-[34px] font-bold leading-[1.12] text-white">
            One platform runs the <span style={{ color: "var(--color-accent)" }}>whole school</span>.
          </h1>
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-canvas/70">
            Admissions, students, attendance, fees &amp; challans, exams, payroll, portals,
            communication and reports — branded as your own school's software.
          </p>
          <ul className="mt-8 space-y-2.5">
            {["Fee challan → payment → receipt in under a minute", "Parent alerts on absence, dues & results", "Role portals: owner, teacher, student, parent", "Software-owner control plane with trial & license engine"].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[12.5px] text-canvas/80">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-ok/25 text-ok" style={{ width: 18, height: 18 }}><I n="check" size={11} /></span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[12.5px] italic leading-relaxed text-canvas/85">"We replaced four separate registers and two Excel files with one dashboard. Fee day went from chaos to a queue of receipts."</p>
            <p className="mt-2 text-[11px] font-semibold text-accent">Ch. Muhammad Owais — Director, {SCHOOL.name}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-widest text-canvas/45">Live theme</span>
            <div className="flex gap-1.5">
              {THEMES.map((t) => (
                <button key={t.id} title={t.name} onClick={() => app.applyTheme(t.id)}
                  className={`focus-ring h-5 w-5 rounded-full border-2 transition ${app.branding.themeId === t.id ? "scale-110 border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
                  style={{ background: t.primary }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== right login panel ===== */}
      <div className="flex flex-1 items-center justify-center bg-canvas p-6">
        <div className="anim-up w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><I n="student" size={20} /></span>
            <p className="display text-[17px] font-bold text-ink">Markaz ERP</p>
          </div>

          <h2 className="display text-[24px] font-bold text-ink">Sign in to {app.branding.schoolName}</h2>
          <p className="mt-1 text-[12.5px] text-sub">Single gateway · role is detected from your credentials.</p>

          <div className="mt-5">
            <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">School code</label>
            <div className="relative">
              <I n="building" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub/70" />
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-[13.5px] font-semibold tracking-widest text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>

          <p className="mb-2 mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-sub">Choose a demo portal</p>
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "teacher", "student", "parent"] as Role[]).map((r) => (
              <button key={r} onClick={() => pick(r)}
                className={`focus-ring group rounded-xl border p-3 text-left transition-all ${role === r ? "border-primary bg-primarysoft shadow-sm" : "border-line bg-surface hover:border-primary/40"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${role === r ? "bg-primary text-white" : "bg-canvas text-sub group-hover:text-primarydark"}`}><I n={ROLE_ICONS[r]} size={16} /></span>
                <span className="mt-2 block text-[12.5px] font-bold text-ink">{ROLE_META[r].label}</span>
                <span className="block text-[10.5px] text-sub">{ROLE_META[r].desc}</span>
              </button>
            ))}
          </div>

          {/* software owner strip */}
          <button onClick={() => pick("owner")}
            className={`focus-ring mt-2 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${role === "owner" ? "border-accent bg-accentsoft shadow-sm" : "border-dashed border-line bg-canvas/60 hover:border-accent/60"}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${role === "owner" ? "bg-night text-accent" : "bg-night/85 text-canvas"}`}><I n="cpu" size={17} /></span>
            <span className="flex-1">
              <span className="block text-[12.5px] font-bold text-ink">Software Owner · Control Plane</span>
              <span className="block text-[10.5px] text-sub">Manage tenant schools, trials, licenses, billing & audits — no access to school records</span>
            </span>
            {role === "owner" && <I n="check" size={15} className="text-warn" />}
          </button>

          {role && (
            <div className="anim-pop mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Username</label>
                  <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 pr-9 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                    <button onClick={() => setShowPass((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sub/70 hover:text-ink"><I n={showPass ? "eyeOff" : "eye"} size={15} /></button>
                  </div>
                </div>
              </div>
              <p className="rounded-lg border border-line bg-surface px-3 py-2 text-[11px] text-sub">
                Signed in as <b className="text-ink">{ROLE_META[role].person}</b> · demo credentials auto-filled · remember device enabled
              </p>
            </div>
          )}

          {err && (
            <div className="anim-pop mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-dangersoft px-3 py-2.5 text-[12.5px] font-medium text-danger">
              <I n="alert" size={15} /> {err}
            </div>
          )}

          <Btn className="mt-5 w-full" onClick={submit} disabled={busy} icon={busy ? undefined : "arrowR"}>
            {busy ? "Verifying credentials…" : role ? "Sign in" : "Select a role to continue"}
          </Btn>

          <div className="mt-4 flex items-center justify-between text-[11.5px] text-sub">
            <button className="focus-ring font-semibold text-primarydark hover:underline" onClick={() => { app.toast("Password reset link sent to your registered email & SMS", "info"); }}>Forgot password?</button>
            <button className="focus-ring font-semibold text-primarydark hover:underline" onClick={() => app.go("website")}>Visit public website →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
