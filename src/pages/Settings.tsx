import React, { useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Badge, Btn, Card, Confirm, Field, I, PageHead, Select, Tabs, tdCls, TextInput, thCls, Toggle } from "../components/ui";
import { Logo } from "../components/shell";

const MODULES = ["Students", "Fees", "Exams", "HR", "Library", "Transport", "Reports"];
const ROLES_M = ["Admin", "Accountant", "Teacher", "Parent", "Student", "Librarian"];

export default function Settings() {
  const app = useApp();
  const [tab, setTab] = useState("school");
  const [school, setSchool] = useState(app.school);
  const [perm, setPerm] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    ROLES_M.forEach((r) => MODULES.forEach((mo) => (m[`${r}|${mo}`] = r === "Admin" ? true : !(r === "Parent" && mo === "HR") && !(r === "Student" && (mo === "HR" || mo === "Transport")))));
    return m;
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const canEdit = app.session?.role === "admin";

  return (
    <>
      <PageHead title="Settings & Branding" sub="White-label configuration · everything applies live, no code needed" />

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "school", label: "School Profile", icon: "building" },
        { id: "branding", label: "Branding & Theme", icon: "star" },
        { id: "academic", label: "Academics", icon: "cap" },
        { id: "roles", label: "Roles & Permissions", icon: "shield" },
        { id: "integrations", label: "Integrations", icon: "gear" },
        { id: "audit", label: "Audit Log", icon: "doc" },
      ]} />

      {tab === "school" && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Tenant identity</h3>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="School name"><TextInput value={school.name} disabled={!canEdit} onChange={(e) => setSchool({ ...school, name: e.target.value })} /></Field>
              <Field label="Short code"><TextInput value={school.short} disabled={!canEdit} onChange={(e) => setSchool({ ...school, short: e.target.value })} className="num" /></Field>
              <Field label="Tagline" className="sm:col-span-2"><TextInput value={school.tagline} disabled={!canEdit} onChange={(e) => setSchool({ ...school, tagline: e.target.value })} /></Field>
              <Field label="School code (login)"><TextInput value={school.code} disabled={!canEdit} onChange={(e) => setSchool({ ...school, code: e.target.value.toUpperCase() })} className="num" /></Field>
              <Field label="Academic session"><Select value={school.session} disabled={!canEdit} onChange={(e) => setSchool({ ...school, session: e.target.value })}><option>2025–26</option><option>2026–27</option></Select></Field>
              <Field label="Phone"><TextInput value={school.phone} disabled={!canEdit} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="num" /></Field>
              <Field label="Email"><TextInput value={school.email} disabled={!canEdit} onChange={(e) => setSchool({ ...school, email: e.target.value })} /></Field>
              <Field label="Address" className="sm:col-span-2"><TextInput value={school.address} disabled={!canEdit} onChange={(e) => setSchool({ ...school, address: e.target.value })} /></Field>
            </div>
            {canEdit && <Btn className="mt-4" icon="check" onClick={() => app.saveSchool(school)}>Save profile</Btn>}
            {!canEdit && <p className="mt-3 text-[12px] text-sub">Only the admin role can edit tenant settings.</p>}
          </Card>
          <div className="space-y-4 xl:col-span-5">
            <Card>
              <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Multi-tenant architecture</h3>
              {[["Tenant isolation", "Every school's data, users and settings are fully isolated"], ["Subdomain", "dareilm.markaz.app → CNAME ready"], ["Custom domain", "Available on Enterprise plan"], ["Plan", "Professional · 2 campuses · 1,000 students"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-linesoft py-2 text-[12.5px] last:border-0">
                  <span className="font-semibold text-ink">{k}</span><span className="num text-right text-sub">{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Feature toggles</h3>
              {[["Hostel module", false], ["Biometric attendance", true], ["Online payment (1Link)", true], ["Urdu interface", false]].map(([k, on]) => (
                <div key={k as string} className="flex items-center justify-between border-b border-linesoft py-2 last:border-0">
                  <span className="text-[12.5px] font-semibold text-ink">{k}</span>
                  <Toggle on={on as boolean} onChange={(v) => app.toast(`${k} ${v ? "enabled" : "disabled"} for this tenant`, "info")} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === "branding" && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <h3 className="mb-1 font-display text-[15px] font-extrabold text-ink">Brand theme</h3>
            <p className="mb-4 text-[12.5px] text-sub">Pick a palette — the entire ERP, portals, PDFs and challans re-skin instantly.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {S.THEMES.map((t) => {
                const active = app.school.themeId === t.id;
                return (
                  <button key={t.id} onClick={() => { app.setTheme(t.id); app.toast(`Theme "${t.label}" applied across the platform`); }}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${active ? "border-primary shadow-md" : "border-line hover:border-primary/40"}`}>
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full border-2 border-white shadow" style={{ background: t.primary }} />
                      <span className="h-7 w-7 rounded-full border-2 border-white shadow" style={{ background: t.accent }} />
                      <span className="h-7 w-10 rounded-md border border-line" style={{ background: t.side }} />
                      {active && <Badge tone="ok" dot>active</Badge>}
                    </div>
                    <div className="mt-2.5 font-display text-[14px] font-extrabold text-ink">{t.label}</div>
                    <div className="num text-[10.5px] text-sub">{t.primary} · {t.accent}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              <Field label="Portal title"><TextInput value={school.portalTitle} disabled={!canEdit} onChange={(e) => setSchool({ ...school, portalTitle: e.target.value })} /></Field>
              <Field label="Login background"><Select disabled={!canEdit} defaultValue="campus"><option value="campus">Campus photo</option><option value="pattern">Geometric pattern</option><option value="solid">Solid brand color</option></Select></Field>
            </div>
            {canEdit && <Btn className="mt-4" icon="check" onClick={() => app.saveSchool(school)}>Save branding</Btn>}
          </Card>
          <Card className="xl:col-span-5">
            <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Live preview</h3>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center gap-2.5 bg-side px-4 py-3">
                <Logo size={30} />
                <div>
                  <div className="font-display text-[12.5px] font-extrabold text-white">{app.school.name}</div>
                  <div className="text-[9px] uppercase tracking-widest text-accent">{app.school.portalTitle}</div>
                </div>
              </div>
              <div className="space-y-2.5 bg-paper p-4">
                <div className="rounded-lg border border-line bg-card p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sub">Collected · this month</div>
                  <div className="num font-display text-[19px] font-extrabold text-primarydeep">Rs 9.8L</div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-linesoft"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-white">Primary button</span>
                  <span className="rounded-md bg-accent px-3 py-1.5 text-[11px] font-bold text-[#221a05]">Accent</span>
                  <span className="rounded-md bg-primarysoft px-3 py-1.5 text-[11px] font-bold text-primarydeep">Soft</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] text-sub">Challan headers, report cards, ID cards and the public website all inherit these tokens.</p>
          </Card>
        </div>
      )}

      {tab === "academic" && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-6">
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Grading scheme</h3>
            <table className="w-full border-collapse text-[12.5px]">
              <thead><tr className="bg-paper"><th className={thCls}>Grade</th><th className={thCls}>Marks %</th><th className={thCls}>GPA</th><th className={thCls}>Remark</th></tr></thead>
              <tbody>
                {[["A+", "85 – 100", "4.0", "Outstanding"], ["A", "75 – 84", "4.0", "Excellent"], ["B", "65 – 74", "3.0", "Very good"], ["C", "50 – 64", "2.0", "Satisfactory"], ["D", "40 – 49", "1.0", "Needs effort"], ["F", "0 – 39", "0.0", "Fail"]].map((r) => (
                  <tr key={r[0]} className="border-t border-linesoft">
                    <td className={tdCls}><Badge tone={r[0] === "F" ? "danger" : r[0] === "D" || r[0] === "C" ? "warn" : "ok"}>{r[0]}</Badge></td>
                    <td className={`${tdCls} num`}>{r[1]}</td><td className={`${tdCls} num`}>{r[2]}</td><td className={`${tdCls} text-sub`}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="space-y-4 xl:col-span-6">
            <Card>
              <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Session structure</h3>
              {[["Academic year", "April 2025 – March 2026"], ["Terms", "Term 1 (Apr–Sep) · Term 2 (Oct–Mar)"], ["Working days", "Mon – Sat · 196 days"], ["Periods", "7 × 40 min + break"], ["Promotion rule", "≥40% aggregate, max 2 fails"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-linesoft py-2 text-[12.5px] last:border-0"><span className="font-semibold text-ink">{k}</span><span className="num text-sub">{v}</span></div>
              ))}
            </Card>
            <Card>
              <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Exam workflow approvals</h3>
              {[["Mark entry", "Class teacher"], ["Validation", "Coordinator"], ["Approval & lock", "Principal"], ["Re-open", "Principal + reason logged"]].map(([k, v], i) => (
                <div key={k} className="flex items-center gap-2.5 py-1.5 text-[12.5px]">
                  <span className="num flex h-5 w-5 items-center justify-center rounded-full bg-primarysoft text-[10px] font-extrabold text-primarydeep">{i + 1}</span>
                  <span className="font-semibold text-ink">{k}</span><span className="ml-auto text-sub">{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === "roles" && (
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft p-4">
            <div>
              <h3 className="font-display text-[15px] font-extrabold text-ink">Permission matrix</h3>
              <p className="text-[11.5px] text-sub">Module access by role — record-level and campus-level rules available on Enterprise.</p>
            </div>
            {canEdit && <Btn v="soft" sz="sm" icon="check" onClick={() => app.toast("Permission matrix saved · applied from next login")}>Save matrix</Btn>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-paper"><tr><th className={thCls}>Role \ Module</th>{MODULES.map((m) => <th key={m} className={`${thCls} text-center`}>{m}</th>)}</tr></thead>
              <tbody>
                {ROLES_M.map((r) => (
                  <tr key={r} className="border-t border-linesoft">
                    <td className={`${tdCls} font-bold`}>{r}</td>
                    {MODULES.map((m) => {
                      const k = `${r}|${m}`;
                      return (
                        <td key={m} className="px-3 py-2 text-center">
                          <button onClick={() => { if (!canEdit) return; setPerm({ ...perm, [k]: !perm[k] }); }}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${perm[k] ? "border-primary bg-primary text-white" : "border-line bg-card text-transparent hover:border-primary/40"}`}>
                            <I n="check" size={13} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "integrations" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            { n: "SMS — Telenor Business", d: "Outbound alerts & OTP", status: "Connected", tone: "ok", ic: "sms" },
            { n: "WhatsApp Cloud API", d: "Fee reminders, absence alerts", status: "Connected", tone: "ok", ic: "wa" },
            { n: "SMTP — SendGrid", d: "Receipts & statements", status: "Connected", tone: "ok", ic: "mail" },
            { n: "1Link Payment Gateway", d: "Online challan payment adapter", status: "Sandbox", tone: "warn", ic: "cash" },
            { n: "Biometric Device API", d: "Staff attendance (ZKTeco ready)", status: "Not configured", tone: "neutral", ic: "user" },
            { n: "GPS Transport Provider", d: "Live bus tracking adapter", status: "Not configured", tone: "neutral", ic: "bus" },
          ].map((it) => (
            <Card key={it.n}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primarysoft text-primarydeep"><I n={it.ic} size={18} /></span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-extrabold text-ink">{it.n}</div>
                  <div className="text-[11.5px] text-sub">{it.d}</div>
                  <div className="mt-2"><Badge tone={it.tone} dot>{it.status}</Badge></div>
                </div>
              </div>
            </Card>
          ))}
          <Card className="!border-dashed md:col-span-2 xl:col-span-3">
            <p className="text-[12.5px] text-sub"><I n="shield" size={14} className="mr-1.5 inline text-primary" /> All integrations sit behind provider adapters — credentials are stored encrypted, business logic never hard-codes a vendor, and every failed call retries gracefully with an audit entry.</p>
          </Card>
        </div>
      )}

      {tab === "audit" && (
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft p-4">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Audit trail</h3>
            <Badge tone="primary">tamper-evident · retained 7 years</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="bg-paper"><tr><th className={thCls}>When</th><th className={thCls}>User</th><th className={thCls}>Action</th><th className={thCls}>Module</th><th className={thCls}>Detail</th></tr></thead>
              <tbody>
                {app.audit.map((a) => (
                  <tr key={a.id} className="border-t border-linesoft transition hover:bg-linesoft/50">
                    <td className={`${tdCls} num text-sub`}>{S.timeAgo(a.ts)}</td>
                    <td className={`${tdCls} font-semibold`}>{a.user}</td>
                    <td className={tdCls}><Badge tone={a.action.includes("paid") || a.action.includes("Payment") ? "ok" : a.action.includes("waived") ? "warn" : "primary"}>{a.action}</Badge></td>
                    <td className={`${tdCls} text-sub`}>{a.module}</td>
                    <td className={`${tdCls} max-w-[300px] truncate text-sub`}>{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {canEdit && (
        <Card className="mt-4 !border-danger/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[14px] font-extrabold text-danger">Danger zone</h3>
              <p className="text-[12px] text-sub">Reset all demo data back to the original seed. Your changes (students, payments, attendance…) will be cleared.</p>
            </div>
            <Btn v="danger" sz="sm" icon="refresh" onClick={() => setConfirmReset(true)}>Reset demo data</Btn>
          </div>
        </Card>
      )}

      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} onYes={app.resetDemo} title="Reset all demo data?" yesLabel="Reset everything"
        body="This clears localStorage and reloads the original seed — new admissions, posted payments, saved attendance, announcements and payroll runs will be lost." />
    </>
  );
}
