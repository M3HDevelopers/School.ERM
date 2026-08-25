import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DB, Role, NavId, OwnerTenant, TenantStatus, Voucher, AuditEntry } from "./data/seed";
import { seedDB, SCHOOL, THEMES, PLANS, MODULE_REGISTRY, dayKey, monthKey } from "./data/seed";

const LS_KEY = "markaz-erp-v3";

export interface Session { userId: string; role: Role; name: string; tenantId: string; }
interface Toast { id: number; msg: string; kind: "ok" | "info" | "warn" | "danger"; }
interface NavState { id: NavId; params?: Record<string, string>; }

interface AppCtx {
  db: DB;
  set: (fn: (d: DB) => DB) => void;
  session: Session | null;
  login: (role: Role) => void;
  logout: () => void;
  nav: NavState;
  go: (id: NavId, params?: Record<string, string>) => void;
  branding: { schoolName: string; shortName: string; tagline: string; themeId: string };
  setBranding: (p: Partial<AppCtx["branding"]>) => void;
  applyTheme: (themeId: string) => void;
  toasts: Toast[];
  toast: (msg: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  notify: (n: { title: string; body: string; icon: string; forRole: Role[] }) => void;
  markNotifsRead: () => void;
  moduleEnabled: (key: string) => boolean;
  // ---- owner actions ----
  logOwnerAudit: (action: string, target: string, reason: string, risk?: AuditEntry["risk"], outcome?: AuditEntry["outcome"]) => void;
  createOwnerTenant: (d: { name: string; type: string; planId: string | null; trialDays: number; ownerName: string; ownerEmail: string; ownerPhone: string }) => OwnerTenant;
  updateTenant: (id: string, patch: Partial<OwnerTenant>) => void;
  setTenantStatus: (id: string, status: TenantStatus, reason: string, risk?: AuditEntry["risk"]) => void;
  extendTrial: (id: string, days: number, reason: string) => void;
  convertToPaid: (id: string, planId: string, interval: "monthly" | "annual") => void;
  renewLicense: (id: string, months: number) => void;
  toggleTenantModule: (id: string, modKey: string) => void;
  recordInvoicePayment: (invId: string, method: string) => void;
  createInvoice: (tenantId: string, amount: number, items: string, period: string) => void;
  assignAddon: (tenantId: string, addonId: string) => void;
  removeAddon: (tenantId: string, addonId: string) => void;
  addOwnerTenantNote: (id: string, note: string) => void;
  toggleFlag: (key: string) => void;
  setMaintenance: (v: boolean) => void;
  retryJob: (id: string) => void;
  runBackup: (tenantId: string) => void;
  startSupportSession: (tenantId: string, reason: string, minutes: number, readOnly: boolean) => void;
  endSupportSession: (id: string) => void;
  resetDemo: () => void;
  balanceOf: (v: Voucher) => number;
}

const Ctx = createContext<AppCtx | null>(null);

function load(): { db: DB; session: Session | null; branding: AppCtx["branding"] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const base = seedDB();
      return { db: { ...base, ...p.db }, session: p.session ?? null, branding: { ...{ schoolName: SCHOOL.name, shortName: SCHOOL.shortName, tagline: SCHOOL.tagline, themeId: "pine" }, ...p.branding } };
    }
  } catch { /* fallthrough */ }
  return { db: seedDB(), session: null, branding: { schoolName: SCHOOL.name, shortName: SCHOOL.shortName, tagline: SCHOOL.tagline, themeId: "pine" } };
}

let toastSeq = 1;
let notifSeq = 100;
let auditSeq = 100;
let tenantSeq = 130;
let invSeq = 130;

export function AppProvider({ children }: { children: ReactNode }) {
  const init = useRef(load()).current;
  const [db, setDb] = useState<DB>(init.db);
  const [session, setSession] = useState<Session | null>(init.session);
  const [nav, setNav] = useState<NavState>({ id: init.session ? (init.session.role === "owner" ? "ownerDash" : "dashboard") : "login" });
  const [branding, setBrandingState] = useState(init.branding);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ db, session, branding }));
  }, [db, session, branding]);

  useEffect(() => {
    const th = THEMES.find((t) => t.id === branding.themeId) ?? THEMES[0];
    const r = document.documentElement.style;
    r.setProperty("--color-primary", th.primary);
    r.setProperty("--color-primarydark", th.primarydark);
    r.setProperty("--color-primarysoft", th.primarysoft);
    r.setProperty("--color-accent", th.accent);
  }, [branding.themeId]);

  const set = (fn: (d: DB) => DB) => setDb((d) => fn(d));

  const toast = (msg: string, kind: Toast["kind"] = "ok") => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const notify = (n: { title: string; body: string; icon: string; forRole: Role[] }) =>
    set((d) => ({ ...d, notifs: [{ id: `nf${notifSeq++}`, title: n.title, body: n.body, time: new Date().toISOString(), read: false, icon: n.icon, forRole: n.forRole }, ...d.notifs] }));

  const logOwnerAudit = (action: string, target: string, reason: string, risk: AuditEntry["risk"] = "normal", outcome: AuditEntry["outcome"] = "success") =>
    set((d) => ({ ...d, ownerAudit: [{ id: `oa${auditSeq++}`, time: new Date().toISOString(), operator: session?.name ?? "System", action, target, reason, outcome, risk }, ...d.ownerAudit] }));

  const createOwnerTenant: AppCtx["createOwnerTenant"] = (inp) => {
    const id = `t-new${tenantSeq}`;
    const code = `${inp.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase()}-2026`;
    const plan = inp.planId ? PLANS.find((p) => p.id === inp.planId) ?? null : null;
    const tn: OwnerTenant = {
      id, code, accountNo: `ACC-000${tenantSeq++}`, name: inp.name, shortName: code.split("-")[0], type: inp.type,
      status: inp.planId ? "active_paid" : "trial", planId: inp.planId,
      modules: plan ? plan.modules : (PLANS.find((p) => p.id === "professional") ?? PLANS[0]).modules,
      limits: { users: plan?.users ?? 20, campuses: plan?.campuses ?? 1, students: plan?.students ?? 400, storageGb: plan?.storageGb ?? 5, sms: plan?.sms ?? 500 },
      usage: { users: 1, students: 0, storageGb: 0.1, sms: 0, api: 0 },
      owner: { name: inp.ownerName, designation: "Owner", email: inp.ownerEmail, phone: inp.ownerPhone, cnicMasked: "•••••-•••••••-•", verified: false, lastLogin: new Date().toISOString(), lastPasswordChange: dayKey(0), sessions: 0 },
      license: {
        id: `LIC-2026-${tenantSeq}`, type: inp.planId ? (inp.planId === "permanent" ? "permanent" : "monthly") : "trial",
        key: `MKZ-XXXX-${code.replace("-", "").slice(0, 4)}-NEW${tenantSeq}-0000`,
        activatedOn: dayKey(0), expiresOn: inp.planId === "permanent" ? null : dayKey(inp.planId ? 30 : inp.trialDays), status: inp.planId ? "active" : "active",
      },
      trialDaysLeft: inp.planId ? null : inp.trialDays,
      manager: session?.name ?? "Hassan Raza", source: "Manual — developer panel", onboarding: 10, createdAt: dayKey(0), lastActive: new Date().toISOString(), health: 60,
      addons: [], notes: "Created from the control plane.",
      timeline: [
        { date: dayKey(0), text: inp.planId ? `Tenant created with ${plan?.name} license` : `Tenant created — ${inp.trialDays}-day trial started`, kind: "create" },
        { date: dayKey(0), text: `Owner account generated: ${inp.ownerEmail} (temp password issued once)`, kind: "create" },
      ],
      apiUsage7d: [0, 0, 0, 0, 0, 0, 0],
    };
    set((d) => ({ ...d, ownerTenants: [tn, ...d.ownerTenants] }));
    logOwnerAudit("Tenant created", inp.name, inp.planId ? `Paid — ${plan?.name}` : `Trial — ${inp.trialDays} days`);
    return tn;
  };

  const patchTenant = (id: string, fn: (t: OwnerTenant) => OwnerTenant) =>
    set((d) => ({ ...d, ownerTenants: d.ownerTenants.map((t) => (t.id === id ? fn(t) : t)) }));

  const pushTimeline = (t: OwnerTenant, text: string, kind: OwnerTenant["timeline"][number]["kind"]): OwnerTenant =>
    ({ ...t, timeline: [{ date: dayKey(0), text, kind }, ...t.timeline] });

  const setTenantStatus: AppCtx["setTenantStatus"] = (id, status, reason, risk = "elevated") => {
    const tn = db.ownerTenants.find((t) => t.id === id);
    patchTenant(id, (t) => pushTimeline({ ...t, status, license: { ...t.license, status: status === "active_paid" ? "active" : status === "trial" ? "active" : status }, trialDaysLeft: status === "trial" ? t.trialDaysLeft : t.trialDaysLeft }, `${statusLabel(status)} — ${reason}`, "status"));
    logOwnerAudit(`Status → ${statusLabel(status)}`, tn?.name ?? id, reason, risk);
    toast(`${tn?.name ?? "Tenant"} is now ${statusLabel(status)}`, status === "suspended" || status === "revoked" ? "warn" : "ok");
  };

  const statusLabel = (s: string) => ({ pending: "Pending", trial: "Trial", active_paid: "Active Paid", grace: "Grace Period", suspended: "Suspended", expired: "Expired", cancelled: "Cancelled", revoked: "Revoked", archived: "Archived" } as Record<string, string>)[s] ?? s;

  const extendTrial: AppCtx["extendTrial"] = (id, days, reason) => {
    const tn = db.ownerTenants.find((t) => t.id === id);
    patchTenant(id, (t) => pushTimeline({ ...t, trialDaysLeft: Math.max(0, t.trialDaysLeft ?? 0) + days, license: { ...t.license, expiresOn: dayKey(Math.max(0, t.trialDaysLeft ?? 0) + days) } }, `Trial extended by ${days} days — ${reason}`, "license"));
    logOwnerAudit("Trial extended", `${tn?.name ?? id} (+${days}d)`, reason);
    toast(`Trial extended by ${days} days for ${tn?.name}`);
  };

  const convertToPaid: AppCtx["convertToPaid"] = (id, planId, interval) => {
    const plan = PLANS.find((p) => p.id === planId);
    const tn = db.ownerTenants.find((t) => t.id === id);
    patchTenant(id, (t) => pushTimeline({
      ...t, status: "active_paid", planId, modules: plan?.modules ?? t.modules, trialDaysLeft: null,
      limits: { users: plan?.users ?? t.limits.users, campuses: plan?.campuses ?? t.limits.campuses, students: plan?.students ?? t.limits.students, storageGb: plan?.storageGb ?? t.limits.storageGb, sms: plan?.sms ?? t.limits.sms },
      license: { ...t.license, type: interval, status: "active", activatedOn: dayKey(0), expiresOn: dayKey(interval === "annual" ? 365 : 30) },
    }, `Converted to ${plan?.name} (${interval})`, "payment"));
    logOwnerAudit("Trial converted to paid", `${tn?.name} — ${plan?.name} (${interval})`, "Subscription confirmed");
    toast(`${tn?.name} converted to ${plan?.name} 🎉`);
  };

  const renewLicense: AppCtx["renewLicense"] = (id, months) => {
    const tn = db.ownerTenants.find((t) => t.id === id);
    patchTenant(id, (t) => pushTimeline({
      ...t, status: "active_paid",
      license: { ...t.license, status: "active", activatedOn: t.license.activatedOn, expiresOn: dayKey(months * 30) },
    }, `License renewed for ${months} month${months > 1 ? "s" : ""}`, "license"));
    logOwnerAudit("License renewed", `${tn?.name} (+${months}mo)`, "Renewal confirmed");
    toast(`License renewed for ${months} month${months > 1 ? "s" : ""}`);
  };

  const toggleTenantModule: AppCtx["toggleTenantModule"] = (id, modKey) => {
    const tn = db.ownerTenants.find((t) => t.id === id);
    const has = tn?.modules.includes(modKey);
    patchTenant(id, (t) => pushTimeline({ ...t, modules: has ? t.modules.filter((m) => m !== modKey) : [...t.modules, modKey] }, `Module ${has ? "disabled" : "enabled"}: ${MODULE_REGISTRY.find((m) => m.key === modKey)?.label}`, "feature"));
    logOwnerAudit(`Module ${has ? "disabled" : "enabled"}`, `${tn?.name} — ${MODULE_REGISTRY.find((m) => m.key === modKey)?.label}`, "Manual entitlement change");
    toast(`${MODULE_REGISTRY.find((m) => m.key === modKey)?.label} ${has ? "disabled" : "enabled"} for ${tn?.shortName}`);
  };

  const recordInvoicePayment: AppCtx["recordInvoicePayment"] = (invId, method) => {
    const inv = db.invoices.find((i) => i.id === invId);
    const tn = db.ownerTenants.find((t) => t.id === inv?.tenantId);
    set((d) => ({ ...d, invoices: d.invoices.map((i) => (i.id === invId ? { ...i, status: "paid" as const, method, paidAmount: i.amount, date: dayKey(0) } : i)) }));
    if (tn && ["grace", "suspended", "expired"].includes(tn.status)) {
      patchTenant(tn.id, (t) => pushTimeline({ ...t, status: "active_paid", license: { ...t.license, status: "active", expiresOn: t.license.type === "monthly" ? dayKey(30) : dayKey(365) } }, "Access restored automatically after payment confirmation (workflow rule)", "payment"));
      toast(`${tn.name}: payment recorded — access restored automatically`, "ok");
    } else toast(`Payment recorded on ${inv?.no} via ${method}`);
    logOwnerAudit("Payment recorded", `${inv?.no} → ${tn?.name ?? ""} (${method})`, "Manual confirmation");
  };

  const createInvoice: AppCtx["createInvoice"] = (tenantId, amount, items, period) => {
    const tn = db.ownerTenants.find((t) => t.id === tenantId);
    set((d) => ({ ...d, invoices: [{ id: `inv${invSeq}`, no: `INV-2026-${invSeq++}`, tenantId, period, amount, status: "due" as const, method: "—", date: dayKey(0), dueDate: dayKey(15), items, paidAmount: 0 }, ...d.invoices] }));
    patchTenant(tenantId, (t) => pushTimeline(t, `Invoice issued — Rs ${amount.toLocaleString()} (${period})`, "payment"));
    logOwnerAudit("Invoice created", `${tn?.name} — Rs ${amount.toLocaleString()}`, period);
    toast("Invoice generated and sent to customer email");
  };

  const assignAddon: AppCtx["assignAddon"] = (tenantId, addonId) => {
    const tn = db.ownerTenants.find((t) => t.id === tenantId);
    patchTenant(tenantId, (t) => pushTimeline({ ...t, addons: [...t.addons, { id: addonId, name: "", price: 0, since: dayKey(0) }] }, `Add-on assigned: ${addonId}`, "feature"));
    logOwnerAudit("Add-on assigned", `${tn?.name} — ${addonId}`, "Upsell");
    toast("Add-on assigned to tenant");
  };
  const removeAddon: AppCtx["removeAddon"] = (tenantId, addonId) => {
    patchTenant(tenantId, (t) => ({ ...t, addons: t.addons.filter((a) => a.id !== addonId) }));
    logOwnerAudit("Add-on removed", `${tenantId} — ${addonId}`, "Customer request");
    toast("Add-on removed", "info");
  };

  const addOwnerTenantNote: AppCtx["addOwnerTenantNote"] = (id, note) => {
    patchTenant(id, (t) => ({ ...t, notes: note }));
    toast("Internal note saved");
  };

  const toggleFlag: AppCtx["toggleFlag"] = (key) => {
    const f = db.flags.find((x) => x.key === key);
    set((d) => ({ ...d, flags: d.flags.map((x) => (x.key === key ? { ...x, enabled: !x.enabled, rollout: !x.enabled ? Math.max(x.rollout, 10) : x.rollout } : x)) }));
    logOwnerAudit(`Feature flag ${f?.enabled ? "disabled" : "enabled"}`, `flag: ${key}`, "Manual rollout control");
    toast(`Flag "${f?.label}" ${f?.enabled ? "disabled" : "enabled"}`, "info");
  };

  const setMaintenance: AppCtx["setMaintenance"] = (v) => {
    set((d) => ({ ...d, maintenanceMode: v }));
    logOwnerAudit(v ? "Maintenance mode enabled" : "Maintenance mode disabled", "Platform-wide", "Operator action", "elevated");
  };

  const retryJob: AppCtx["retryJob"] = (id) => {
    set((d) => ({ ...d, jobs: d.jobs.map((j) => (j.id === id ? { ...j, status: "queued" as const, attempts: j.attempts + 1, error: "" } : j)) }));
    toast("Job re-queued — will retry in the next cycle", "info");
  };

  const runBackup: AppCtx["runBackup"] = (tenantId) => {
    set((d) => ({ ...d, backups: d.backups.map((b) => (b.tenantId === tenantId ? { ...b, lastOk: new Date().toISOString(), status: "ok" as const, lastFail: null } : b)) }));
    toast("On-demand backup completed ✓");
  };

  const startSupportSession: AppCtx["startSupportSession"] = (tenantId, reason, minutes, readOnly) => {
    const tn = db.ownerTenants.find((t) => t.id === tenantId);
    set((d) => ({ ...d, supportSessions: [{ id: `ss${Date.now()}`, tenantId, operator: session?.name ?? "Operator", reason, startedAt: new Date().toISOString(), expiresAt: Date.now() + minutes * 60e3, readOnly, active: true }, ...d.supportSessions] }));
    patchTenant(tenantId, (t) => pushTimeline(t, `Support session started (${readOnly ? "read-only" : "write"}) — ${reason}`, "support"));
    logOwnerAudit("Impersonation session started", `${tn?.name} — ${minutes} min ${readOnly ? "(read-only)" : "(write)"}`, reason, "elevated");
    toast("Support session started — fully audited, auto-terminates on expiry", "warn");
  };

  const endSupportSession: AppCtx["endSupportSession"] = (id) => {
    const s = db.supportSessions.find((x) => x.id === id);
    set((d) => ({ ...d, supportSessions: d.supportSessions.map((x) => (x.id === id ? { ...x, active: false } : x)) }));
    logOwnerAudit("Impersonation session ended", db.ownerTenants.find((t) => t.id === s?.tenantId)?.name ?? s?.tenantId ?? "", "Manual termination", "elevated");
    toast("Support session terminated and logged", "info");
  };

  const moduleEnabled = (key: string): boolean => {
    if (!session || session.role === "owner") return true;
    const t = db.ownerTenants.find((x) => x.id === session.tenantId);
    if (!t) return true;
    return t.modules.includes(key);
  };

  const login = (role: Role) => {
    const person = role === "admin" ? "Ch. Muhammad Owais" : role === "teacher" ? "Sara Malik" : role === "student" ? "Ahmed Khan" : role === "parent" ? "Salman Khan" : "Hassan Raza";
    setSession({ userId: role, role, name: person, tenantId: role === "owner" ? "platform" : "t-dia" });
    setNav({ id: role === "owner" ? "ownerDash" : "dashboard" });
    toast(`Signed in as ${person} — ${role === "owner" ? "Software Owner (control plane)" : role} view`, "info");
  };

  const logout = () => { setSession(null); setNav({ id: "login" }); };
  const go = (id: NavId, params?: Record<string, string>) => { setNav({ id, params }); window.scrollTo({ top: 0 }); };
  const setBranding = (p: Partial<AppCtx["branding"]>) => setBrandingState((b) => ({ ...b, ...p }));
  const applyTheme = (themeId: string) => setBrandingState((b) => ({ ...b, themeId }));
  const resetDemo = () => { localStorage.removeItem(LS_KEY); location.reload(); };
  const balanceOf = (v: Voucher) => Math.max(0, v.total - v.paid);

  const value = useMemo<AppCtx>(() => ({
    db, set, session, login, logout, nav, go, branding, setBranding, applyTheme,
    toasts, toast, dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    notify, markNotifsRead: () => set((d) => ({ ...d, notifs: d.notifs.map((n) => (n.forRole.includes(session?.role ?? "admin") ? { ...n, read: true } : n)) })),
    moduleEnabled,
    logOwnerAudit, createOwnerTenant, updateTenant: (id, patch) => patchTenant(id, (t) => ({ ...t, ...patch })),
    setTenantStatus, extendTrial, convertToPaid, renewLicense, toggleTenantModule,
    recordInvoicePayment, createInvoice, assignAddon, removeAddon, addOwnerTenantNote,
    toggleFlag, setMaintenance, retryJob, runBackup, startSupportSession, endSupportSession, resetDemo, balanceOf,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [db, session, nav, branding, toasts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}

// ---------- utilities ----------
export function downloadCSV(name: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const head = Object.keys(rows[0]);
  const csv = [head.join(","), ...rows.map((r) => head.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function printDoc(title: string, bodyHtml: string, brand: { schoolName: string; accent: string }) {
  const w = window.open("", "_blank", "width=920,height=720");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${title}</title>
  <style>
    @page { margin: 14mm; }
    body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #1f2a25; margin: 0; }
    .doc-head { display:flex; align-items:center; gap:14px; border-bottom: 3px solid ${brand.accent}; padding-bottom: 12px; margin-bottom: 16px; }
    .doc-head .mono { width: 44px; height: 44px; background: var(--c,#0c6b58); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; border-radius: 8px; font-size: 15px; letter-spacing: 1px; background:${brand.accent}; color:#1f2a25; }
    .doc-head h1 { font-family: "Space Grotesk", Arial, sans-serif; font-size: 20px; margin: 0; }
    .doc-head p { margin: 2px 0 0; font-size: 11px; color: #5f7166; }
    .doc-title { font-family:"Space Grotesk", Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 13px; color: #5f7166; margin: 6px 0 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    th { text-align: left; background: #f2f0e9; padding: 7px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #5f7166; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2dfd3; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; font-size: 12.5px; margin: 10px 0; }
    .grid b { font-weight: 600; }
    .muted { color: #5f7166; font-size: 11px; }
    .total-row td { font-weight: 700; border-top: 2px solid #1f2a25; background: #fbfaf6; }
    .stamp { display:inline-block; border: 2px solid #1d7a4f; color:#1d7a4f; padding: 3px 14px; font-weight:700; letter-spacing:2px; border-radius:4px; transform: rotate(-4deg); font-size: 13px; }
    .sign { display:flex; justify-content: space-between; margin-top: 44px; font-size: 11.5px; color:#5f7166; }
    .sign div { border-top: 1px solid #1f2a25; padding-top: 5px; width: 160px; text-align:center; }
    .note { background:#f2f0e9; padding: 8px 12px; font-size: 11px; border-left: 3px solid ${brand.accent}; margin-top: 14px; }
  </style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

export const docHead = (brand: { schoolName: string; shortName: string }, title: string, meta: string) =>
  `<div class="doc-head"><div class="mono">${brand.shortName.slice(0, 3)}</div><div><h1>${brand.schoolName}</h1><p>${meta}</p></div><div style="margin-left:auto" class="doc-title">${title}</div></div>`;

export const monthLabelOf = monthKey; // alias for pages
