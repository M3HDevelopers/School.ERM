import { useEffect, useMemo, useState } from "react";
import { useApp, downloadCSV, printDoc, docHead } from "../store";
import type { OwnerTenant, TenantStatus } from "../data/seed";
import { TENANT_STATUS_META, MODULE_REGISTRY, PLANS, ADDONS, dayKey, fmtDate, fmtPKR, timeAgo } from "../data/seed";
import { Badge, Bars, Btn, Card, Confirm, Donut, Drawer, Field, HBars, I, Kpi, LineChart, Modal, PageHead, Progress, QRBox, SearchInput, Select, Spark, StatusDot, Tabs, Tbl, Textarea, TextInput, Toggle, tdCls, thCls, EmptyState } from "../components/ui";

// ---------- shared helpers (used by OwnerOps too) ----------
export const planOf = (t: OwnerTenant) => PLANS.find((p) => p.id === t.planId) ?? null;
export const mrrOf = (t: OwnerTenant) => {
  if (t.status !== "active_paid") return 0;
  const plan = planOf(t);
  const base = plan ? (plan.interval === "monthly" ? plan.price : 0) : 0;
  const addons = t.addons.reduce((a, x) => a + (ADDONS.find((ad) => ad.id === x.id)?.kind === "monthly" ? (ADDONS.find((ad) => ad.id === x.id)?.price ?? x.price) : 0), 0);
  return base + addons;
};
export const statusKeyOf = (t: OwnerTenant): string => {
  if (t.status === "trial" && t.trialDaysLeft !== null) {
    if (t.trialDaysLeft <= 0) return "expired";
    if (t.trialDaysLeft <= 7) return "trial_expiring";
  }
  return t.status;
};
export const StatusBadge = ({ t }: { t: OwnerTenant }) => {
  const k = statusKeyOf(t);
  const m = TENANT_STATUS_META[k];
  return <Badge className={m.cls}>{k === "trial" || k === "trial_expiring" ? <I n="clock" size={10} /> : null}{m.label}{k === "trial" || k === "trial_expiring" ? ` · ${t.trialDaysLeft}d` : ""}</Badge>;
};

// ================= CONTROL ROOM DASHBOARD =================
export function OwnerDashboard() {
  const app = useApp();
  const tenants = app.db.ownerTenants;
  const activePaid = tenants.filter((t) => t.status === "active_paid");
  const trials = tenants.filter((t) => t.status === "trial");
  const expiring = trials.filter((t) => (t.trialDaysLeft ?? 99) <= 7);
  const mrr = activePaid.reduce((a, t) => a + mrrOf(t), 0);
  const renewals = tenants.filter((t) => t.license.expiresOn && t.license.expiresOn <= dayKey(45) && t.status === "active_paid");
  const atRisk = tenants.filter((t) => ["grace", "suspended", "expired"].includes(t.status));

  const moduleAdoption = useMemo(() => {
    const counts = MODULE_REGISTRY.map((m) => ({ label: m.label, v: tenants.filter((t) => t.modules.includes(m.key)).length })).sort((a, b) => b.v - a.v).slice(0, 8);
    return counts;
  }, [tenants]);

  return (
    <>
      <PageHead title="Control Room" sub="Commercial control plane for Markaz Cloud — every school you sell to, one screen"
        actions={<>
          <Btn v="outline" sz="sm" icon="history" onClick={() => app.go("security")}>Audit log</Btn>
          <Btn sz="sm" icon="plus" onClick={() => app.go("tenants", { new: "1" })}>Add school / institute</Btn>
        </>} />

      {/* data boundary banner */}
      <div className="anim-up mb-4 flex items-start gap-3 rounded-xl border border-primary/25 bg-primarysoft/70 p-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white"><I n="shield" size={17} /></span>
        <div className="text-[12px] leading-relaxed text-primarydark">
          <b>Data boundary in force:</b> this panel manages <b>tenant accounts, licenses, billing and aggregated usage only</b>. Student, parent,
          teacher, marks and fee records stay inside each school's tenant environment and are never listed here. Support access to tenant data
          requires an explicit, reason-logged, time-limited session (see Support Desk).
        </div>
      </div>

      <div className="anim-up grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Schools onboarded" value={tenants.length} spark={[4, 5, 5, 6, 7, 7, 8, tenants.length]} sub={`${tenants.filter((t) => t.createdAt >= dayKey(-30)).length} new this month`} onClick={() => app.go("tenants")} />
        <Kpi label="Active paid" value={activePaid.length} tone="var(--color-ok)" sub={`incl. ${activePaid.filter((t) => t.planId === "permanent").length} permanent license`} onClick={() => app.go("tenants", { f: "active_paid" })} />
        <Kpi label="Trials running" value={trials.length} tone="var(--color-warn)" sub={<span className="font-bold text-warn">{expiring.length} expiring ≤ 7 days</span>} onClick={() => app.go("licenses")} />
        <Kpi label="Monthly revenue" value={mrr} prefix="Rs " spark={[18, 22, 24, 27, 27, 31, 33, Math.round(mrr / 1000)]} sub="+ add-ons & SMS packs" onClick={() => app.go("billing")} />
        <Kpi label="Renewals due ≤ 45d" value={renewals.length} sub={renewals[0] ? `${renewals[0].shortName} · ${renewals[0].license.expiresOn ? fmtDate(renewals[0].license.expiresOn) : ""}` : "—"} onClick={() => app.go("licenses")} />
        <Kpi label="At-risk accounts" value={atRisk.length} tone="var(--color-danger)" sub="grace · suspended · expired" onClick={() => app.go("tenants", { f: "risk" })} />
      </div>

      {/* quick actions */}
      <div className="anim-up mt-4 flex flex-wrap gap-2">
        {[
          { ic: "plus", l: "Create trial", fn: () => app.go("licenses") },
          { ic: "key", l: "Issue paid license", fn: () => app.go("licenses") },
          { ic: "card", l: "Generate invoice", fn: () => app.go("billing") },
          { ic: "clock", l: "Extend a trial", fn: () => app.go("licenses") },
          { ic: "wa", l: "Send renewal reminders", fn: () => { app.notify({ title: "Renewal reminders sent", body: `${renewals.length + atRisk.length} commercial reminder emails dispatched with invoices attached.`, icon: "card", forRole: ["owner"] }); app.toast(`${renewals.length + atRisk.length} renewal reminders sent via email adapter`, "info"); } },
          { ic: "server", l: "System health", fn: () => app.go("system") },
          { ic: "life", l: "Support queue", fn: () => app.go("support") },
        ].map((a) => (
          <Btn key={a.l} v="outline" sz="sm" icon={a.ic} onClick={a.fn}>{a.l}</Btn>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Revenue trend" sub="Monthly recurring + add-on revenue · PKR thousands" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("billing")}>Billing</Btn>}>
            <LineChart data={[18, 21, 22, 25, 27, 30, 33, Math.round(mrr / 1000)].map((v, i) => ({ label: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Now"][i], value: v }))} fmt={(v) => `Rs ${v}k`} />
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Plan distribution" sub="Active & trial tenants">
              <Donut centerLabel="tenants" size={132} data={[
                { label: "Professional", value: tenants.filter((t) => t.planId === "professional").length, color: "var(--color-primary)" },
                { label: "Starter", value: tenants.filter((t) => t.planId === "starter").length, color: "#1d7a4f" },
                { label: "Enterprise", value: tenants.filter((t) => t.planId === "enterprise").length, color: "var(--color-accent)" },
                { label: "Permanent", value: tenants.filter((t) => t.planId === "permanent").length, color: "#9a6511" },
                { label: "Trial / none", value: tenants.filter((t) => !t.planId).length, color: "#c9c5b6" },
              ]} />
            </Card>
            <Card title="Trial funnel" sub="Last 90 days">
              <HBars data={[
                { label: "Leads contacted", v: 24, tone: "#c9c5b6" },
                { label: "Trials started", v: 14, tone: "var(--color-accent)" },
                { label: "Converted to paid", v: 9, tone: "var(--color-primary)" },
                { label: "Still retained", v: 8, tone: "#1d7a4f" },
              ]} />
            </Card>
          </div>
          <Card title="Module adoption across tenants" sub="Which features customers actually use" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("billing")}>Compare plans</Btn>}>
            <HBars data={moduleAdoption} fmt={(v) => `${v} tenants`} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Security alerts" sub="From the fraud & isolation engine" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("security")}>All</Btn>}>
            <div className="space-y-2">
              {app.db.securityEvents.slice(0, 3).map((e) => (
                <div key={e.id} className={`rounded-lg border p-2.5 ${e.severity === "critical" ? "border-danger/30 bg-dangersoft/50" : e.severity === "warn" ? "border-warn/30 bg-warnsoft/50" : "border-line bg-canvas/60"}`}>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink"><StatusDot tone={e.severity === "critical" ? "danger" : e.severity === "warn" ? "warn" : "ok"} /> {e.type}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-sub">{e.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Ticket queue" sub="Needs action" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("support")}>Desk</Btn>}>
            {app.db.tickets.filter((t) => t.status !== "resolved").map((t) => {
              const tn = tenants.find((x) => x.id === t.tenantId);
              return (
                <div key={t.id} className="mb-2 flex items-center gap-2.5 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.priority === "high" ? "bg-dangersoft text-danger" : "bg-warnsoft text-warn"}`}><I n="life" size={13} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink">{t.subject}</p><p className="text-[10.5px] text-sub">{tn?.name ?? "Internal"} · {t.priority}</p></div>
                </div>
              );
            })}
          </Card>

          <Card title="System health" sub="Live service status" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("system")}>Ops</Btn>}>
            <div className="flex items-center gap-3">
              <span className="num display text-[26px] font-bold text-ok">{app.db.services.filter((s) => s.status === "operational").length}/{app.db.services.length}</span>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-ink">services operational</p>
                <p className="text-[10.5px] text-warn">SMS gateway degraded — 1.2s latency</p>
              </div>
              <span className="flex gap-1">{app.db.services.map((s) => <span key={s.name} title={s.name} className={`h-5 w-1.5 rounded-full ${s.status === "operational" ? "bg-ok" : s.status === "degraded" ? "bg-warn" : "bg-danger"}`} />)}</span>
            </div>
            <p className="mt-2 text-[10.5px] text-sub">{app.db.jobs.filter((j) => j.status === "failed").length} failed background jobs awaiting retry</p>
          </Card>

          <Card title="Recent owner activity" sub="Privileged actions — immutable">
            <div className="space-y-1.5">
              {app.db.ownerAudit.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-[11.5px]">
                  <I n={a.risk === "elevated" ? "shield" : "history"} size={12} className={`mt-0.5 shrink-0 ${a.risk === "elevated" ? "text-danger" : "text-sub"}`} />
                  <p className="leading-snug text-sub"><b className="text-ink">{a.action}</b> · {a.target} <span className="text-sub/70">— {timeAgo(a.time)}</span></p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// ================= TENANTS =================
export function TenantsPage() {
  const app = useApp();
  const [f, setF] = useState(app.nav.params?.f ?? "all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(app.nav.params?.open ?? null);
  const [wizard, setWizard] = useState(app.nav.params?.new === "1");

  const list = useMemo(() => app.db.ownerTenants.filter((t) => {
    const k = statusKeyOf(t);
    if (f === "trial" && !["trial", "trial_expiring"].includes(k)) return false;
    if (f === "active_paid" && k !== "active_paid") return false;
    if (f === "risk" && !["grace", "suspended", "expired", "revoked"].includes(k)) return false;
    if (f === "other" && !["pending", "cancelled", "archived"].includes(k)) return false;
    if (q && !(t.name + t.code + t.owner.name + t.owner.email + t.license.id + t.accountNo).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [app.db.ownerTenants, f, q]);

  const selTenant = app.db.ownerTenants.find((t) => t.id === sel) ?? null;

  return (
    <>
      <PageHead title="Schools & Tenants" sub="Commercial accounts only — operational school records are never shown here"
        actions={<>
          <Btn v="outline" sz="sm" icon="download" onClick={() => { downloadCSV("tenants", list.map((t) => ({ code: t.code, account: t.accountNo, name: t.name, type: t.type, status: statusKeyOf(t), plan: planOf(t)?.name ?? "trial", mrr: mrrOf(t), students: t.usage.students, users: t.usage.users, manager: t.manager, created: t.createdAt }))); app.toast("Commercial tenant list exported"); }}>Export CSV</Btn>
          <Btn sz="sm" icon="plus" onClick={() => setWizard(true)}>New School / Institute</Btn>
        </>} />

      <div className="anim-up mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, code, owner, license ID…" className="w-full sm:w-80" />
        {[["all", "All"], ["trial", "Trials"], ["active_paid", "Active Paid"], ["risk", "At Risk"], ["other", "Pending / Closed"]].map(([id, l]) => (
          <button key={id} onClick={() => setF(id)} className={`focus-ring rounded-lg border px-3 py-1.5 text-[12px] font-bold transition ${f === id ? "border-primary bg-primarysoft text-primarydark" : "border-line bg-surface text-sub hover:text-ink"}`}>{l}</button>
        ))}
      </div>

      <Card pad={false}>
        <Tbl head={["School / Institute", "Plan", "Status", "License / Expiry", "Usage (students · users)", "MRR", "Manager", "Health", ""]}>
          {list.map((t) => (
            <tr key={t.id} className="tbl-row cursor-pointer" onClick={() => setSel(t.id)}>
              <td className={tdCls}>
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-night font-bold text-accent">{t.shortName.slice(0, 2)}</span>
                  <span><b className="block leading-tight">{t.name}</b><span className="num text-[10.5px] text-sub">{t.code} · {t.accountNo} · {t.type}</span></span>
                </span>
              </td>
              <td className={tdCls}>{planOf(t) ? <Badge tone="primary">{planOf(t)?.name}</Badge> : <Badge tone="neutral">Trial pkg</Badge>}</td>
              <td className={tdCls}><StatusBadge t={t} /></td>
              <td className={tdCls}><span className="num block text-[11.5px] font-bold">{t.license.id}</span><span className="text-[10.5px] text-sub">{t.license.type === "permanent" ? "No expiry" : t.license.expiresOn ? `exp ${fmtDate(t.license.expiresOn)}` : "—"}</span></td>
              <td className={tdCls}>
                <span className="block w-28"><Progress pct={(t.usage.students / t.limits.students) * 100} tone={t.usage.students / t.limits.students > 0.85 ? "warn" : "primary"} /></span>
                <span className="num text-[10.5px] text-sub">{t.usage.students}/{t.limits.students} · {t.usage.users}/{t.limits.users} users</span>
              </td>
              <td className={`${tdCls} num font-bold`}>{mrrOf(t) ? fmtPKR(mrrOf(t)) : t.planId === "permanent" ? "Lifetime" : "—"}</td>
              <td className={`${tdCls} text-sub`}>{t.manager}</td>
              <td className={tdCls}><span className={`num font-bold ${t.health >= 85 ? "text-ok" : t.health >= 60 ? "text-warn" : "text-danger"}`}>{t.health}</span></td>
              <td className={tdCls}><Btn v="ghost" sz="xs" icon="chevR" onClick={() => setSel(t.id)}>Open</Btn></td>
            </tr>
          ))}
        </Tbl>
        {list.length === 0 && <EmptyState icon="building" title="No tenants match" body="Adjust the filters or onboard a new school." />}
      </Card>

      <TenantDrawer t={selTenant} onClose={() => setSel(null)} />
      <NewTenantWizard open={wizard} onClose={() => setWizard(false)} />
    </>
  );
}

function NewTenantWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [mode, setMode] = useState<"trial" | "paid">("trial");
  const [days, setDays] = useState(14);
  const [planId, setPlanId] = useState("professional");
  const [f, setF] = useState({ name: "", type: "School (K-10)", ownerName: "", ownerEmail: "", ownerPhone: "" });
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<{ tn: OwnerTenant; user: string; pass: string } | null>(null);

  const create = () => {
    if (!f.name || !f.ownerName || !f.ownerEmail) { setErr("Institution name, owner name and owner email are required."); return; }
    setErr("");
    const tn = app.createOwnerTenant({ ...f, planId: mode === "paid" ? planId : null, trialDays: days });
    const pass = `Mkz-${Math.random().toString(36).slice(2, 8)}!`;
    const user = f.ownerEmail.split("@")[0];
    setCreated({ tn, user, pass });
  };

  return (
    <Modal open={open} onClose={() => { onClose(); setCreated(null); }} wide title="Onboard a new school" sub="Provisioning wizard — tenant, owner account, license & module package in one flow"
      footer={created ? <Btn icon="check" onClick={() => { onClose(); setCreated(null); }}>Finish</Btn> : <><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="zap" onClick={create}>Create tenant & credentials</Btn></>}>
      {created ? (
        <div className="anim-pop space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-ok/30 bg-oksoft/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ok text-white"><I n="check" size={20} /></span>
            <div><p className="display text-[15px] font-bold text-ink">{created.tn.name} provisioned</p>
              <p className="text-[11.5px] text-sub">{created.tn.code} · {created.tn.accountNo} · license {created.tn.license.id} · {created.tn.trialDaysLeft ? `${created.tn.trialDaysLeft}-day trial running` : `${planOf(created.tn)?.name} active`}</p></div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-warn/50 bg-warnsoft/60 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-warn"><I n="key" size={12} /> Initial credentials — shown exactly once</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-surface px-3 py-2"><p className="text-[10px] font-bold uppercase text-sub">Owner username</p><p className="num text-[14px] font-bold text-ink">{created.user}</p></div>
              <div className="rounded-lg bg-surface px-3 py-2"><p className="text-[10px] font-bold uppercase text-sub">Temporary password</p><p className="num text-[14px] font-bold text-ink">{created.pass}</p></div>
            </div>
            <p className="mt-2 text-[10.5px] text-warn">Force password change on first login is enabled. This password is never stored in plain text and can never be viewed again — only reset.</p>
          </div>
          <p className="text-[11.5px] text-sub">Activation instructions with a secure sign-in link (72h expiry) were emailed to {created.tn.owner.email}. Module package, quotas and default notification templates are pre-configured.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            {([["trial", "Start a free trial", "clock"], ["paid", "Paid license", "key"]] as const).map(([m, l, ic]) => (
              <button key={m} onClick={() => setMode(m)} className={`focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-[12.5px] font-bold transition ${mode === m ? "border-primary bg-primarysoft text-primarydark" : "border-line bg-surface text-sub"}`}><I n={ic} size={15} /> {l}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Institution name" req><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Al-Noor Grammar School" /></Field>
            <Field label="Institution type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["School (K-8)", "School (K-10)", "College", "Academy", "Training Institute", "School Network"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Owner full name" req><TextInput value={f.ownerName} onChange={(e) => setF({ ...f, ownerName: e.target.value })} /></Field>
            <Field label="Owner business email" req><TextInput value={f.ownerEmail} onChange={(e) => setF({ ...f, ownerEmail: e.target.value })} placeholder="owner@school.edu.pk" /></Field>
            <Field label="Business phone"><TextInput value={f.ownerPhone} onChange={(e) => setF({ ...f, ownerPhone: e.target.value })} placeholder="+92 3xx xxxxxxx" /></Field>
            {mode === "trial" ? (
              <Field label="Trial duration"><Select value={days} onChange={(e) => setDays(Number(e.target.value))}>{[7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}<option value={21}>Custom — 21 days</option></Select></Field>
            ) : (
              <Field label="Plan"><Select value={planId} onChange={(e) => setPlanId(e.target.value)}>{PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtPKR(p.price)}{p.interval === "monthly" ? "/mo" : p.interval === "annual" ? "/yr" : " (lifetime)"}</option>)}</Select></Field>
            )}
          </div>
          <div className="mt-3 rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11.5px] text-sub">
            Auto-provisioned: unique tenant ID &amp; code · module package from plan · user/student/storage/SMS quotas · default roles · notification templates · welcome document. Onboarding checklist opens at 10%.
          </div>
          {err && <p className="anim-pop mt-3 flex items-center gap-1.5 text-[12px] font-medium text-danger"><I n="alert" size={14} /> {err}</p>}
        </>
      )}
    </Modal>
  );
}

// ================= TENANT DRAWER =================
export function TenantDrawer({ t, onClose }: { t: OwnerTenant | null; onClose: () => void }) {
  const app = useApp();
  const [tab, setTab] = useState("overview");
  const [showCnic, setShowCnic] = useState(false);
  const [note, setNote] = useState("");
  const [modSearch, setModSearch] = useState("");
  const [reasonModal, setReasonModal] = useState<null | "suspend" | "revoke" | "extend" | "convert" | "renew" | "invoice" | "session" | "restore">(null);
  const [reason, setReason] = useState("");
  const [numVal, setNumVal] = useState(30);
  const [selPlan, setSelPlan] = useState("professional");
  const [selInt, setSelInt] = useState<"monthly" | "annual">("monthly");
  const [readOnly, setReadOnly] = useState(true);
  const [invAmt, setInvAmt] = useState(25000);
  const [invItems, setInvItems] = useState("Professional plan — monthly");
  useEffect(() => { setNote(t?.notes ?? ""); setShowCnic(false); setTab("overview"); }, [t?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!t) return null;
  const k = statusKeyOf(t);

  const runReason = () => {
    if (["suspend", "revoke"].includes(reasonModal ?? "") && reason.trim().length < 5) { app.toast("A reason is mandatory for this action — it goes in the audit log", "warn"); return; }
    if (reasonModal === "suspend") app.setTenantStatus(t.id, "suspended", reason.trim());
    if (reasonModal === "revoke") app.setTenantStatus(t.id, "revoked", reason.trim());
    if (reasonModal === "restore") app.setTenantStatus(t.id, "active_paid", reason.trim() || "Manual restoration", "normal");
    if (reasonModal === "extend") app.extendTrial(t.id, numVal, reason.trim() || "Commercial goodwill");
    if (reasonModal === "renew") app.renewLicense(t.id, numVal === 12 ? 12 : numVal);
    if (reasonModal === "convert") app.convertToPaid(t.id, selPlan, selInt);
    if (reasonModal === "invoice") app.createInvoice(t.id, invAmt, invItems, "Manual invoice — control plane");
    if (reasonModal === "session") {
      if (reason.trim().length < 5) { app.toast("Support reason is mandatory — this is an elevated, audited session", "warn"); return; }
      app.startSupportSession(t.id, reason.trim(), numVal, readOnly);
    }
    setReason(""); setReasonModal(null);
  };

  const plan = planOf(t);
  const invoices = app.db.invoices.filter((i) => i.tenantId === t.id);
  const tickets = app.db.tickets.filter((x) => x.tenantId === t.id);
  const activeSession = app.db.supportSessions.find((s) => s.tenantId === t.id && s.active);

  const usageRows = [
    ["Students / records", t.usage.students, t.limits.students, ""],
    ["Users", t.usage.users, t.limits.users, ""],
    ["Storage (GB)", t.usage.storageGb, t.limits.storageGb, "GB"],
    ["SMS this month", t.usage.sms, t.limits.sms, ""],
  ] as const;

  return (
    <Drawer open onClose={onClose} wide
      title={<span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-night font-bold text-accent">{t.shortName.slice(0, 2)}</span> {t.name}</span>}
      sub={<span className="flex flex-wrap items-center gap-2"><StatusBadge t={t} />{plan && <Badge tone="primary">{plan.name}</Badge>}<span className="num text-[11px] text-sub">{t.code} · {t.accountNo} · license {t.license.id}</span></span>}>
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "overview", label: "Overview" }, { id: "license", label: "License" }, { id: "modules", label: "Modules", count: t.modules.length },
        { id: "usage", label: "Usage" }, { id: "billing", label: "Billing", count: invoices.length }, { id: "timeline", label: "Timeline" }, { id: "support", label: "Support" },
      ]} />

      <div className="mt-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="Commercial profile" pad>
                <div className="space-y-1.5 text-[12.5px]">
                  {[["Type", t.type], ["Source / channel", t.source], ["Account manager", t.manager], ["Created", fmtDate(t.createdAt)], ["Last active", timeAgo(t.lastActive)], ["Onboarding", `${t.onboarding}% complete`]].map(([l, v]) => (
                    <p key={l} className="flex justify-between gap-3"><span className="text-sub">{l}</span><b className="text-right text-ink">{v}</b></p>
                  ))}
                </div>
                <div className="mt-2"><Progress pct={t.onboarding} tone={t.onboarding === 100 ? "ok" : "accent"} /></div>
              </Card>
              <Card title="Primary owner account" pad>
                <div className="space-y-1.5 text-[12.5px]">
                  <p className="flex justify-between"><span className="text-sub">Name</span><b className="text-ink">{t.owner.name}</b></p>
                  <p className="flex justify-between"><span className="text-sub">Designation</span><b className="text-ink">{t.owner.designation}</b></p>
                  <p className="flex justify-between"><span className="text-sub">Email</span><b className="text-ink">{t.owner.email}</b></p>
                  <p className="flex justify-between"><span className="text-sub">Phone</span><b className="num text-ink">{t.owner.phone}</b></p>
                  <p className="flex items-center justify-between"><span className="text-sub">CNIC reference</span>
                    <span className="flex items-center gap-1.5"><b className="num text-ink">{showCnic ? "35202-4471829-3" : t.owner.cnicMasked}</b>
                      <button className="focus-ring text-sub hover:text-ink" onClick={() => { setShowCnic((s) => !s); if (!showCnic) app.logOwnerAudit("Sensitive identity data viewed", `${t.name} — owner CNIC`, "Account verification check", "elevated"); }}><I n={showCnic ? "eyeOff" : "eye"} size={13} /></button></span></p>
                  <p className="flex justify-between"><span className="text-sub">Verification</span>{t.owner.verified ? <Badge tone="ok">VERIFIED</Badge> : <Badge tone="warn">PENDING</Badge>}</p>
                  <p className="flex justify-between"><span className="text-sub">Last login</span><b className="text-ink">{timeAgo(t.owner.lastLogin)}</b></p>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <Btn v="outline" sz="xs" icon="key" onClick={() => { app.logOwnerAudit("Owner password reset", t.name, "Requested by customer via phone verification"); app.toast("Temporary password issued & emailed — old sessions revoked", "info"); }}>Reset password</Btn>
                  <Btn v="ghost" sz="xs" icon="power" onClick={() => { app.logOwnerAudit("Owner sessions revoked", t.name, "Security precaution", "elevated"); app.toast("All active sessions revoked", "warn"); }}>Revoke sessions</Btn>
                </div>
              </Card>
            </div>
            <Card title="Internal notes" sub="Visible to your team only — never to the customer">
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              <Btn v="subtle" sz="sm" className="mt-2" icon="check" onClick={() => app.addOwnerTenantNote(t.id, note)}>Save note</Btn>
            </Card>
            <div className="flex flex-wrap gap-2">
              {["trial", "trial_expiring"].includes(k) && <Btn sz="sm" icon="clock" onClick={() => { setNumVal(7); setReasonModal("extend"); }}>Extend trial</Btn>}
              {["trial", "trial_expiring"].includes(k) && <Btn sz="sm" v="accent" icon="key" onClick={() => setReasonModal("convert")}>Convert to paid</Btn>}
              {["active_paid", "trial", "trial_expiring", "grace"].includes(k) && <Btn v="outline" sz="sm" icon="pause" onClick={() => setReasonModal("suspend")}>Suspend access</Btn>}
              {["suspended", "expired", "grace"].includes(k) && <Btn v="outline" sz="sm" icon="play" onClick={() => setReasonModal("restore")}>Restore access</Btn>}
              <Btn v="outline" sz="sm" icon="refresh" onClick={() => { setNumVal(1); setReasonModal("renew"); }}>Renew license</Btn>
              <Btn v="danger" sz="sm" icon="x" onClick={() => setReasonModal("revoke")}>Revoke license</Btn>
            </div>
          </div>
        )}

        {tab === "license" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-night p-5 text-canvas">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-widest text-canvas/50">License {t.license.type}</p>
                  <p className="num display mt-1 text-[18px] font-bold text-white">{t.license.id}</p>
                  <p className="num mt-1 text-[12px] tracking-[0.18em] text-accent">{t.license.key}</p>
                </div>
                <QRBox seed={t.license.key} size={70} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
                {[["Activated", fmtDate(t.license.activatedOn)], ["Expires", t.license.expiresOn ? fmtDate(t.license.expiresOn) : "Never (lifetime)"], ["Status", t.license.status.toUpperCase()], ["Grace end", t.license.expiresOn ? fmtDate(dayKey(7)) : "—"]].map(([l, v]) => (
                  <div key={l}><p className="text-canvas/50">{l}</p><p className="font-bold text-white">{v}</p></div>
                ))}
              </div>
            </div>
            <Card title="Entitlement limits vs current usage">
              <div className="space-y-3">
                {usageRows.map(([l, used, limit]) => (
                  <div key={l}>
                    <div className="mb-1 flex justify-between text-[12px]"><span className="font-medium text-ink">{l}</span><span className="num font-bold text-sub">{used.toLocaleString()} / {limit.toLocaleString()}</span></div>
                    <Progress pct={(used / limit) * 100} tone={used / limit > 0.9 ? "danger" : used / limit > 0.75 ? "warn" : "ok"} />
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Btn v="outline" sz="sm" icon="print" onClick={() => printDoc(`License Certificate — ${t.name}`,
                docHead({ schoolName: "Markaz Cloud", shortName: "MKZ" }, "LICENSE CERTIFICATE", "Software Owner · Control Plane") +
                `<div class="grid"><div><b>Licensee:</b> ${t.name}</div><div><b>License ID:</b> ${t.license.id}</div><div><b>Type:</b> ${t.license.type}</div><div><b>Key:</b> ${t.license.key}</div><div><b>Activated:</b> ${fmtDate(t.license.activatedOn)}</div><div><b>Expires:</b> ${t.license.expiresOn ? fmtDate(t.license.expiresOn) : "Lifetime"}</div><div><b>Campuses:</b> up to ${t.limits.campuses}</div><div><b>Students:</b> up to ${t.limits.students.toLocaleString()}</div></div>
                <p class="note">Entitled modules: ${t.modules.length}. Verify anytime at verify.markaz.cloud using the license key. Issued under the Markaz Cloud commercial terms.</p>
                <div class="sign"><div>License Manager</div><div>Super Owner</div></div>`,
                { schoolName: "Markaz Cloud", accent: "#c99a2e" })}>License certificate</Btn>
              <Btn v="outline" sz="sm" icon="key" onClick={() => app.toast("License key rotated — runtime will re-validate within 5 minutes", "info")}>Rotate key</Btn>
            </div>
          </div>
        )}

        {tab === "modules" && (
          <div className="space-y-3">
            <SearchInput value={modSearch} onChange={setModSearch} placeholder="Filter modules…" />
            {["Core", "Academics", "Finance", "Operations", "Communication", "Platform"].map((g) => {
              const mods = MODULE_REGISTRY.filter((m) => m.group === g && m.label.toLowerCase().includes(modSearch.toLowerCase()));
              if (!mods.length) return null;
              return (
                <div key={g} className="rounded-xl border border-line bg-surface p-3.5">
                  <p className="mb-2 text-[10.5px] font-bold uppercase tracking-widest text-sub">{g}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {mods.map((m) => {
                      const on = t.modules.includes(m.key);
                      const fromPlan = plan?.modules.includes(m.key);
                      return (
                        <div key={m.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${on ? "border-ok/30 bg-oksoft/40" : "border-line bg-canvas/60"}`}>
                          <div><p className="text-[12px] font-bold text-ink">{m.label}</p>
                            <p className="text-[9.5px] font-semibold uppercase tracking-wide">{on ? (fromPlan ? <span className="text-primarydark">Entitled via plan</span> : <span className="text-warn">Manual override</span>) : <span className="text-sub/70">Disabled</span>}</p></div>
                          <Toggle on={on} onChange={() => app.toggleTenantModule(t.id, m.key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <p className="flex items-center gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11px] text-sub"><I n="info" size={13} className="text-primarydark" /> Changes are enforced by the application immediately and recorded as <b>feature enable/disable</b> in the audit log. For Dar-e-Ilm, try it — their sidebar updates live.</p>
          </div>
        )}

        {tab === "usage" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="API requests — last 7 days"><Bars data={t.apiUsage7d.map((v, i) => ({ label: ["-6", "-5", "-4", "-3", "-2", "-1", "now"][i], value: v }))} height={140} /></Card>
              <Card title="Account vitals">
                <div className="space-y-2 text-[12.5px]">
                  {[["Health score", `${t.health}/100`], ["Last tenant login", timeAgo(t.lastActive)], ["Owner last login", timeAgo(t.owner.lastLogin)], ["Active sessions", String(t.owner.sessions)], ["Documents stored", `${Math.round(t.usage.storageGb * 140)}`], ["Generated reports (mo)", "63"]].map(([l, v]) => (
                    <p key={l} className="flex justify-between border-b border-line pb-1.5 last:border-0"><span className="text-sub">{l}</span><b className="num text-ink">{v}</b></p>
                  ))}
                </div>
              </Card>
            </div>
            <Card title="Quota consumption">
              <div className="space-y-3">
                {usageRows.map(([l, used, limit, unit]) => (
                  <div key={l}>
                    <div className="mb-1 flex justify-between text-[12px]"><span className="font-medium text-ink">{l}</span><span className="num font-bold text-sub">{Math.round((used / limit) * 100)}% used</span></div>
                    <Progress pct={(used / limit) * 100} tone={used / limit > 0.9 ? "danger" : used / limit > 0.75 ? "warn" : "ok"} />
                  </div>
                ))}
              </div>
            </Card>
            <p className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primarysoft/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-primarydark"><I n="shield" size={14} className="mt-0.5 shrink-0" /> <b>Aggregated only.</b> These counters never expose individual students, parents, marks, fees or payroll records — tenant operational data stays inside the tenant environment by design.</p>
          </div>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <Card pad={false} title="Commercial invoices" actions={<Btn v="subtle" sz="xs" icon="plus" onClick={() => setReasonModal("invoice")}>New invoice</Btn>}>
              {invoices.length === 0 ? <EmptyState icon="card" title="No invoices yet" body="Generate the first invoice for this customer." /> : (
                <Tbl head={["Invoice", "Period / items", "Amount", "Due", "Status", ""]}>
                  {invoices.map((i) => (
                    <tr key={i.id} className="tbl-row">
                      <td className={`${tdCls} num font-bold`}>{i.no}</td>
                      <td className={tdCls}><b>{i.period}</b><span className="block text-[10.5px] text-sub">{i.items}</span></td>
                      <td className={`${tdCls} num font-bold`}>{fmtPKR(i.amount)}</td>
                      <td className={`${tdCls} num text-[12px]`}>{fmtDate(i.dueDate)}</td>
                      <td className={tdCls}><Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "warn"}>{i.status.toUpperCase()}</Badge></td>
                      <td className={tdCls}>{i.status !== "paid" && <Btn v="subtle" sz="xs" icon="check" onClick={() => app.recordInvoicePayment(i.id, "Bank Transfer")}>Record payment</Btn>}</td>
                    </tr>
                  ))}
                </Tbl>
              )}
            </Card>
            <Card title="Add-ons" sub="Upsell layer on top of the plan">
              {t.addons.length === 0 && <p className="mb-2 text-[12px] text-sub">No add-ons assigned yet.</p>}
              <div className="space-y-2">
                {t.addons.map((a) => {
                  const cat = ADDONS.find((x) => x.id === a.id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accentsoft text-warn"><I n="sparkle" size={15} /></span>
                      <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">{cat?.name ?? a.name ?? a.id}</p><p className="text-[10.5px] text-sub">since {fmtDate(a.since)} · {cat?.kind === "one-time" ? "one-time" : "monthly"}</p></div>
                      <span className="num text-[12.5px] font-bold text-ink">{fmtPKR(cat?.price ?? a.price)}{cat?.kind === "monthly" ? "/mo" : ""}</span>
                      <button className="focus-ring rounded-md p-1.5 text-sub hover:bg-dangersoft hover:text-danger" onClick={() => app.removeAddon(t.id, a.id)}><I n="trash" size={13} /></button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <Select value="" onChange={(e) => { if (e.target.value) { app.assignAddon(t.id, e.target.value); } }}>
                  <option value="">+ Assign an add-on…</option>
                  {ADDONS.filter((a) => !t.addons.some((x) => x.id === a.id)).map((a) => <option key={a.id} value={a.id}>{a.name} — {fmtPKR(a.price)}{a.kind === "monthly" ? "/mo" : ""}</option>)}
                </Select>
              </div>
            </Card>
          </div>
        )}

        {tab === "timeline" && (
          <Card title="Customer timeline" sub="Lead → onboarding → license → renewals → support">
            <ol>
              {t.timeline.map((ev, i) => (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < t.timeline.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-line" />}
                  <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${ev.kind === "payment" ? "border-ok bg-oksoft text-ok" : ev.kind === "status" ? "border-warn bg-warnsoft text-warn" : ev.kind === "feature" ? "border-accent bg-accentsoft text-warn" : ev.kind === "support" ? "border-primary bg-primarysoft text-primarydark" : "border-primary bg-surface text-primarydark"}`}>
                    <I n={ev.kind === "payment" ? "card" : ev.kind === "status" ? "alert" : ev.kind === "feature" ? "sparkle" : ev.kind === "support" ? "life" : "building"} size={10} />
                  </span>
                  <div><p className="text-[10.5px] font-bold uppercase tracking-wide text-sub">{fmtDate(ev.date)}</p><p className="text-[12.5px] leading-snug text-ink">{ev.text}</p></div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {tab === "support" && (
          <div className="space-y-4">
            <Card title="Controlled support access" sub="Impersonation — explicit, reason-logged, time-limited, audited">
              {activeSession ? (
                <div className="rounded-xl border-2 border-warn/50 bg-warnsoft/60 p-4">
                  <p className="flex items-center gap-2 text-[12.5px] font-bold text-warn"><I n="eye" size={15} /> Session in progress — {activeSession.readOnly ? "read-only" : "write access"}</p>
                  <p className="mt-1 text-[12px] text-ink">Reason: {activeSession.reason}</p>
                  <p className="text-[11px] text-sub">Operator: {activeSession.operator} · started {timeAgo(activeSession.startedAt)} · every action is recorded</p>
                  <Btn v="danger" sz="sm" className="mt-2" icon="x" onClick={() => app.endSupportSession(activeSession.id)}>Terminate session now</Btn>
                </div>
              ) : (
                <>
                  <p className="text-[12px] leading-relaxed text-sub">Opens the tenant's ERP as their admin for troubleshooting. Highly sensitive modules (payroll detail, identity documents) stay blocked by default. The customer sees a banner while a session is active.</p>
                  <Btn sz="sm" className="mt-2" icon="eye" onClick={() => { setNumVal(30); setReadOnly(true); setReason(""); setReasonModal("session"); }}>Open support session</Btn>
                </>
              )}
            </Card>
            <Card pad={false} title="Tickets for this customer">
              {tickets.length === 0 ? <EmptyState icon="life" title="No tickets" body="This customer has no open support tickets." /> : (
                <Tbl head={["Ticket", "Subject", "Priority", "Status", "Created"]}>
                  {tickets.map((tk) => (
                    <tr key={tk.id} className="tbl-row">
                      <td className={`${tdCls} num font-bold`}>{tk.no}</td>
                      <td className={`${tdCls} font-medium`}>{tk.subject}</td>
                      <td className={tdCls}><Badge tone={tk.priority === "high" ? "danger" : tk.priority === "medium" ? "warn" : "neutral"}>{tk.priority.toUpperCase()}</Badge></td>
                      <td className={tdCls}><Badge tone={tk.status === "resolved" ? "ok" : "primary"}>{tk.status}</Badge></td>
                      <td className={`${tdCls} text-sub`}>{fmtDate(tk.created)}</td>
                    </tr>
                  ))}
                </Tbl>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* reason / value modal */}
      <Modal open={!!reasonModal} onClose={() => setReasonModal(null)}
        title={(reasonModal ? ({ suspend: "Suspend access", revoke: "Revoke license", extend: "Extend trial", convert: "Convert trial to paid", renew: "Renew license", invoice: "Generate invoice", session: "Open support session", restore: "Restore access" } as Record<string, string>)[reasonModal] : "")}
        sub={(reasonModal ? ({ suspend: "Tenant data is preserved; logins and API access are blocked.", revoke: "Permanent action — requires a new license to re-activate.", extend: "Adds days to the running trial clock.", convert: "Trial becomes a paid subscription immediately.", renew: "Extends the license from today.", invoice: "Creates a commercial invoice and emails it to the owner.", session: "Elevated access — operator, reason and duration are audited.", restore: "Re-enables access per the active license." } as Record<string, string>)[reasonModal] : "")}
        footer={<><Btn v="outline" onClick={() => setReasonModal(null)}>Cancel</Btn>
          <Btn v={reasonModal === "revoke" || reasonModal === "suspend" ? "danger" : "primary"} onClick={runReason}>
            {(reasonModal ? ({ suspend: "Suspend tenant", revoke: "Revoke license", extend: "Extend trial", convert: "Convert & activate", renew: "Renew license", invoice: "Issue invoice", session: "Start audited session", restore: "Restore access" } as Record<string, string>)[reasonModal] : "Confirm")}
          </Btn></>}>
        <div className="space-y-3">
          {(reasonModal === "suspend" || reasonModal === "revoke" || reasonModal === "session") && (
            <Field label={reasonModal === "session" ? "Support reason (mandatory, audited)" : "Reason (mandatory, goes to audit log)"} req>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={reasonModal === "session" ? "e.g. Customer reports challan PDF blank — reproducing in their tenant" : "e.g. Non-payment after grace period"} />
            </Field>
          )}
          {reasonModal === "extend" && <Field label="Extra days"><TextInput type="number" value={numVal} onChange={(e) => setNumVal(Number(e.target.value))} /></Field>}
          {reasonModal === "renew" && <Field label="Renewal period"><Select value={numVal} onChange={(e) => setNumVal(Number(e.target.value))}><option value={1}>1 month</option><option value={3}>3 months</option><option value={12}>12 months (annual)</option></Select></Field>}
          {reasonModal === "session" && <Field label="Session length"><Select value={numVal} onChange={(e) => setNumVal(Number(e.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>60 minutes</option></Select></Field>}
          {reasonModal === "session" && (
            <div className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
              <p className="text-[12.5px] font-medium text-ink">Read-only session</p>
              <Toggle on={readOnly} onChange={setReadOnly} />
            </div>
          )}
          {reasonModal === "convert" && (<>
            <Field label="Plan"><Select value={selPlan} onChange={(e) => setSelPlan(e.target.value)}>{PLANS.filter((p) => p.id !== "permanent").map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtPKR(p.price)}/mo</option>)}</Select></Field>
            <Field label="Billing interval"><Select value={selInt} onChange={(e) => setSelInt(e.target.value as "monthly" | "annual")}><option value="monthly">Monthly</option><option value="annual">Annual (2 months free)</option></Select></Field>
          </>)}
          {reasonModal === "invoice" && (<>
            <Field label="Amount (PKR)"><TextInput type="number" value={invAmt} onChange={(e) => setInvAmt(Number(e.target.value))} /></Field>
            <Field label="Items / description"><TextInput value={invItems} onChange={(e) => setInvItems(e.target.value)} /></Field>
          </>)}
        </div>
      </Modal>
    </Drawer>
  );
}
