import React, { useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Btn, I, TextInput } from "../components/ui";
import { Logo } from "../components/shell";

const ROLES: { id: S.Role; label: string; icon: string; desc: string }[] = [
  { id: "admin", label: "Admin / Principal", icon: "building", desc: "Full executive access" },
  { id: "teacher", label: "Teacher", icon: "cap", desc: "Classes, marks, attendance" },
  { id: "student", label: "Student", icon: "book", desc: "Timetable, fees, results" },
  { id: "parent", label: "Parent", icon: "user", desc: "Children, dues, alerts" },
  { id: "developer", label: "Software Owner", icon: "code", desc: "Developer panel access" },
];

export default function Login() {
  const app = useApp();
  const [role, setRole] = useState<S.Role>("admin");
  const [code, setCode] = useState("DIA-2026");
  const [user, setUser] = useState(S.CREDENTIALS.admin.u);
  const [pass, setPass] = useState(S.CREDENTIALS.admin.p);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (r: S.Role) => {
    setRole(r);
    setUser(S.CREDENTIALS[r].u);
    setPass(S.CREDENTIALS[r].p);
    setErr("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() !== app.school.code) {
      setErr("Invalid school code — demo tenant uses DIA-2026");
      return;
    }
    if (!user.trim() || !pass.trim()) {
      setErr("Username and password are required");
      return;
    }
    setErr("");
    setBusy(true);
    setTimeout(() => app.login(role), 750);
  };

  return (
    <div className="flex min-h-screen bg-paper">
      {/* brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-side p-10 text-sidetext lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border-[36px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full border-[30px] border-white/[0.04]" />
        <div className="relative flex items-center gap-3">
          <Logo size={42} />
          <div>
            <div className="font-display text-lg font-extrabold text-white">{app.school.portalTitle}</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-sidetext/70">School Management ERP</div>
          </div>
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sideline bg-white/5 px-3 py-1 text-[11px] font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" /> Tenant: {app.school.name}
          </div>
          <h1 className="font-display text-[42px] font-black leading-[1.04] tracking-tight text-white">
            The complete operating system for your school.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-sidetext">
            Admissions, students, attendance, fee challans, exams, payroll, library, transport,
            parent & student portals — one white-label platform, branded for {app.school.short}.
          </p>
          <ul className="mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px]">
            {["Multi-tenant & white-label", "Role-based portals", "Challan & receipt engine", "PKR-ready finance", "Exam & result workflow", "SMS · WhatsApp · Email"].map((f) => (
              <li key={f} className="flex items-center gap-2"><I n="check" size={13} className="text-accent" />{f}</li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-8 text-[12px]">
          <div><span className="num font-display text-xl font-extrabold text-white">594</span><span className="block text-sidetext/70">students</span></div>
          <div><span className="num font-display text-xl font-extrabold text-white">48</span><span className="block text-sidetext/70">staff</span></div>
          <div><span className="num font-display text-xl font-extrabold text-white">2</span><span className="block text-sidetext/70">campuses</span></div>
          <div className="ml-auto num text-[10.5px] text-sidetext/50">v2.1.0 · build 2602</div>
        </div>
      </div>

      {/* form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Logo size={38} />
            <div>
              <div className="font-display text-[16px] font-extrabold text-ink">{app.school.portalTitle}</div>
              <div className="text-[11px] text-sub">{app.school.name}</div>
            </div>
          </div>
          <h2 className="font-display text-[26px] font-extrabold tracking-tight text-ink">Sign in to {app.school.short} Portal</h2>
          <p className="mt-1 text-[13px] text-sub">Single gateway — your role decides your dashboard.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">School code</span>
              <div className="relative">
                <I n="shield" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
                <TextInput value={code} onChange={(e) => setCode(e.target.value)} className="num pl-9" placeholder="e.g. DIA-2026" />
              </div>
            </label>

            <div>
              <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">I am a…</span>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button type="button" key={r.id} onClick={() => pick(r.id)}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all ${role === r.id ? "border-primary bg-primarysoft shadow-sm" : "border-line bg-card hover:border-primary/40"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${role === r.id ? "bg-primary text-white" : "bg-linesoft text-sub"}`}>
                      <I n={r.icon} size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[12.5px] font-bold ${role === r.id ? "text-primarydeep" : "text-ink"}`}>{r.label}</span>
                      <span className="block truncate text-[10.5px] text-sub">{r.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Username</span>
                <TextInput value={user} onChange={(e) => setUser(e.target.value)} className="num" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Password</span>
                <TextInput type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="num" />
              </label>
            </div>

            {err && (
              <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-dangersoft px-3 py-2 text-[12px] font-semibold text-danger anim-pop">
                <I n="alert" size={14} />{err}
              </div>
            )}

            <Btn type="submit" disabled={busy} className="w-full !py-2.5 text-[14px]">
              {busy ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Verifying…</>) : (<>Sign in securely <I n="arrowR" size={15} /></>)}
            </Btn>

            <div className="flex items-center justify-between pt-1 text-[12px]">
              <button type="button" className="font-semibold text-primarydeep underline-offset-2 hover:underline" onClick={() => app.toast("Password reset link sent to your registered email (demo)", "info")}>Forgot password?</button>
              <button type="button" className="font-semibold text-primarydeep underline-offset-2 hover:underline" onClick={() => app.go("site")}>View public website →</button>
            </div>
          </form>

          <div className="mt-6 rounded-lg border border-line bg-card p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sub"><I n="star" size={12} className="text-accent" /> Demo credentials (auto-filled)</div>
            <div className="num grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px] text-sub">
              {ROLES.map((r) => (
                <span key={r.id}>{r.id} · <span className="text-ink">{S.CREDENTIALS[r.id].u}</span> / {S.CREDENTIALS[r.id].p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
