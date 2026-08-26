import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  OwnerState, OwnerTenant, OwnerInvoice, OwnerTicket, TenantStatus, OwnerAudit,
  seedOwner, planById, monthlyValue, moduleLabel, OWNER_ADDONS,
} from "./data";

const KEY = "markaz-owner-v1";

export interface OwnerToast { id: number; msg: string; type: "ok" | "info" | "danger" }

interface OwnerCtx extends OwnerState {
  operator: string;
  operatorRole: string;
  page: string;
  go: (p: string) => void;
  toasts: OwnerToast[];
  toast: (msg: string, type?: OwnerToast["type"]) => void;
  dismissToast: (id: number) => void;
  audit: (action: string, target: string, reason: string, risk?: OwnerAudit["risk"], outcome?: OwnerAudit["outcome"]) => void;
  patchTenant: (id: string, fn: (t: OwnerTenant) => OwnerTenant) => void;
  setTenantStatus: (id: string, status: TenantStatus, reason: string) => void;
  extendTrial: (id: string, days: number, reason: string) => void;
  convertToPaid: (id: string, planId: string, interval: "monthly" | "annual") => void;
  renewLicense: (id: string, months: number) => void;
  toggleModule: (id: string, moduleKey: string) => void;
  addNote: (id: string, note: string) => void;
  createInvoice: (tenantId: string, amount: number, items: string, period: string) => void;
  recordPayment: (invoiceId: string, method: string) => void;
  assignAddon: (tenantId: string, addonId: string) => void;
  removeAddon: (tenantId: string, addonId: string) => void;
  createTenant: (d: { name: string; type: OwnerTenant["type"]; planId: string | null; trialDays: number; ownerName: string; ownerEmail: string }) => OwnerTenant;
  startImpersonation: (tenantId: string, reason: string, minutes: number, readOnly: boolean) => void;
  endImpersonation: (id: string) => void;
  setTicketStatus: (id: string, status: OwnerTicket["status"]) => void;
  assignTicket: (id: string, assignee: string) => void;
  toggleFlag: (key: string) => void;
  setMaintenance: (v: boolean) => void;
  retryBackup: (tenantId: string) => void;
  ackSecurity: (id: string) => void;
  resetOwner: () => void;
}

const Ctx = createContext<OwnerCtx | null>(null);
export const useOwner = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("owner store missing");
  return c;
};

function init(): OwnerState {
  const base = seedOwner();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch { /* fresh */ }
  return base;
}

let tid = 1;

export function OwnerProvider({ children, operator, operatorRole }: { children: React.ReactNode; operator: string; operatorRole: string }) {
  const [st, setSt] = useState<OwnerState>(init);
  const [page, setPage] = useState("control");
  const [toasts, setToasts] = useState<OwnerToast[]>([]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* full */ }
  }, [st]);

  // expire impersonation sessions whose time has elapsed
  useEffect(() => {
    const iv = setInterval(() => {
      setSt((s) => {
        const now = Date.now();
        const active = s.sessions.some((x) => x.active && x.expiresAt <= now);
        if (!active) return s;
        return { ...s, sessions: s.sessions.map((x) => (x.active && x.expiresAt <= now ? { ...x, active: false } : x)) };
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const toast = (msg: string, type: OwnerToast["type"] = "ok") => {
    const id = tid++;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const audit = (action: string, target: string, reason: string, risk: OwnerAudit["risk"] = "normal", outcome: OwnerAudit["outcome"] = "success") =>
    setSt((s) => ({ ...s, auditLog: [{ id: `oa-${Date.now()}`, time: new Date().toISOString(), operator, action, target, reason, risk, outcome }, ...s.auditLog] }));

  const patchTenant = (id: string, fn: (t: OwnerTenant) => OwnerTenant) =>
    setSt((s) => ({ ...s, tenants: s.tenants.map((t) => (t.id === id ? fn(t) : t)) }));

  const pushTimeline = (t: OwnerTenant, text: string, kind: string): OwnerTenant =>
    ({ ...t, timeline: [...t.timeline, { date: new Date().toISOString().slice(0, 10), text, kind }] });

  const setTenantStatus = (id: string, status: TenantStatus, reason: string) => {
    const t = st.tenants.find((x) => x.id === id);
    patchTenant(id, (x) => pushTimeline({ ...x, status }, `Status → ${status} — ${reason}`, "status"));
    audit(`Tenant ${status}`, t?.name ?? id, reason, ["suspended", "revoked", "cancelled"].includes(status) ? "elevated" : "normal");
    toast(`${t?.name ?? "Tenant"} is now ${status}`, ["suspended", "revoked", "cancelled"].includes(status) ? "danger" : "ok");
  };

  const extendTrial = (id: string, days: number, reason: string) => {
    const t = st.tenants.find((x) => x.id === id);
    patchTenant(id, (x) => pushTimeline({ ...x, trialDaysLeft: Math.max(0, (x.trialDaysLeft ?? 0) + days) }, `Trial extended +${days}d — ${reason}`, "license"));
    audit("Trial extended", `${t?.name} (+${days}d)`, reason);
    toast(`Trial extended by ${days} days`);
  };

  const convertToPaid = (id: string, planId: string, interval: "monthly" | "annual") => {
    const plan = planById(planId);
    const t = st.tenants.find((x) => x.id === id);
    patchTenant(id, (x) => pushTimeline({
      ...x, status: "active_paid", planId, trialDaysLeft: null,
      modules: plan?.modules ?? x.modules,
      limits: { users: plan?.users ?? x.limits.users, students: plan?.students ?? x.limits.students, campuses: plan?.campuses ?? x.limits.campuses, storageGb: plan?.storageGb ?? x.limits.storageGb, sms: x.limits.sms, api: x.limits.api },
      license: { ...x.license, type: interval, status: "active" },
    }, `Converted to ${plan?.name} (${interval})`, "payment"));
    audit("Trial → paid", `${t?.name} · ${plan?.name}`, "Subscription confirmed");
    toast(`${t?.name} converted to ${plan?.name} 🎉`);
  };

  const renewLicense = (id: string, months: number) => {
    const t = st.tenants.find((x) => x.id === id);
    const d = new Date(); d.setDate(d.getDate() + months * 30);
    patchTenant(id, (x) => pushTimeline({ ...x, status: "active_paid", license: { ...x.license, status: "active", expiresOn: d.toISOString().slice(0, 10) } }, `License renewed +${months}mo`, "license"));
    audit("License renewed", `${t?.name} (+${months}mo)`, "Renewal confirmed");
    toast(`License renewed for ${months} month(s)`);
  };

  const toggleModule = (id: string, moduleKey: string) => {
    const t = st.tenants.find((x) => x.id === id);
    const has = t?.modules.includes(moduleKey);
    patchTenant(id, (x) => pushTimeline({ ...x, modules: has ? x.modules.filter((m) => m !== moduleKey) : [...x.modules, moduleKey] }, `Module ${has ? "disabled" : "enabled"}: ${moduleLabel(moduleKey)}`, "feature"));
    audit(`Module ${has ? "disabled" : "enabled"}`, `${t?.name} · ${moduleLabel(moduleKey)}`, "Entitlement change");
    toast(`${moduleLabel(moduleKey)} ${has ? "disabled" : "enabled"}`);
  };

  const addNote = (id: string, note: string) => { patchTenant(id, (x) => ({ ...x, notes: note })); toast("Note saved"); };

  const createInvoice = (tenantId: string, amount: number, items: string, period: string) => {
    const t = st.tenants.find((x) => x.id === tenantId);
    const n = 100 + st.invoices.length;
    const inv: OwnerInvoice = { id: `inv-${Date.now()}`, no: `INV-2026-${n}`, tenantId, period, amount, status: "due", method: "—", date: new Date().toISOString().slice(0, 10), dueDate: new Date(Date.now() + 15 * 86400e3).toISOString().slice(0, 10), items, paidAmount: 0 };
    setSt((s) => ({ ...s, invoices: [inv, ...s.invoices] }));
    audit("Invoice created", `${t?.name} · Rs ${amount.toLocaleString()}`, period);
    toast("Invoice generated & emailed to customer");
  };

  const recordPayment = (invoiceId: string, method: string) => {
    const inv = st.invoices.find((i) => i.id === invoiceId);
    const t = st.tenants.find((x) => x.id === inv?.tenantId);
    setSt((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "paid" as const, method, paidAmount: i.amount } : i)) }));
    if (t && ["grace", "suspended", "expired"].includes(t.status)) {
      const d = new Date(); d.setDate(d.getDate() + 30);
      patchTenant(t.id, (x) => pushTimeline({ ...x, status: "active_paid", license: { ...x.license, status: "active", expiresOn: d.toISOString().slice(0, 10) } }, "Access restored after payment (auto workflow)", "payment"));
      toast(`${t.name}: payment recorded — access auto-restored`);
    } else toast(`Payment recorded on ${inv?.no}`);
    audit("Payment recorded", `${inv?.no} · ${t?.name ?? ""}`, method);
  };

  const assignAddon = (tenantId: string, addonId: string) => {
    const ad = OWNER_ADDONS.find((a) => a.id === addonId);
    const t = st.tenants.find((x) => x.id === tenantId);
    patchTenant(tenantId, (x) => pushTimeline({ ...x, addons: [...x.addons, { id: addonId, name: ad?.name ?? addonId, price: ad?.price ?? 0, since: new Date().toISOString().slice(0, 10) }] }, `Add-on assigned: ${ad?.name}`, "feature"));
    audit("Add-on assigned", `${t?.name} · ${ad?.name}`, "Upsell");
    toast("Add-on assigned");
  };
  const removeAddon = (tenantId: string, addonId: string) => {
    const ad = OWNER_ADDONS.find((a) => a.id === addonId);
    patchTenant(tenantId, (x) => ({ ...x, addons: x.addons.filter((a) => a.id !== addonId) }));
    audit("Add-on removed", ad?.name ?? addonId, "Customer request");
    toast("Add-on removed", "info");
  };

  const createTenant: OwnerCtx["createTenant"] = (d) => {
    const n = st.tenants.length;
    const code = d.name.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    const plan = planById(d.planId);
    const created = new Date().toISOString().slice(0, 10);
    const tn: OwnerTenant = {
      id: `t-${Date.now()}`, code, accountNo: `ACC-${2100 + n}`, name: d.name, shortName: code, type: d.type,
      status: d.planId ? "active_paid" : "trial", planId: d.planId,
      modules: plan ? plan.modules : ["students", "parents", "staff", "attendance", "fees", "exams", "results", "notifications", "reports", "student_portal", "parent_portal", "admin_portal"],
      limits: { users: plan?.users ?? 15, students: plan?.students ?? 300, campuses: plan?.campuses ?? 1, storageGb: plan?.storageGb ?? 5, sms: 500, api: 5000 },
      usage: { users: 1, students: 0, campuses: 1, storageGb: 0.1, sms: 0, api: 0 },
      owner: { name: d.ownerName, email: d.ownerEmail, phone: "+92 3xx-xxxxxxx", cnicMasked: "•••••-•••••••-•", verified: false, lastLogin: created, twoFA: false },
      manager: operator, source: "Manual — control plane", createdAt: created, onboarding: 15, lastActive: created, health: 60,
      license: { id: `LIC-${4000 + n}`, type: d.planId ? "monthly" : "trial", key: `MKZ-${code}-${3000 + n}-NEW`, activatedOn: created, expiresOn: d.planId ? null : new Date(Date.now() + d.trialDays * 86400e3).toISOString().slice(0, 10), status: "active" },
      trialDaysLeft: d.planId ? null : d.trialDays, addons: [], notes: "Newly provisioned tenant.",
      timeline: [
        { date: created, text: `Tenant created (${code}) · owner account provisioned`, kind: "create" },
        { date: created, text: d.planId ? `License activated (${plan?.name})` : `${d.trialDays}-day trial started`, kind: "license" },
      ],
      apiUsage7d: [0, 0, 0, 0, 0, 0, 0],
    };
    setSt((s) => ({ ...s, tenants: [tn, ...s.tenants] }));
    audit("Tenant created", d.name, d.planId ? `Paid — ${plan?.name}` : `Trial — ${d.trialDays}d`);
    return tn;
  };

  const startImpersonation = (tenantId: string, reason: string, minutes: number, readOnly: boolean) => {
    const t = st.tenants.find((x) => x.id === tenantId);
    setSt((s) => ({ ...s, sessions: [{ id: `ss-${Date.now()}`, tenantId, operator, reason, startedAt: new Date().toISOString(), expiresAt: Date.now() + minutes * 60e3, readOnly, active: true, actions: 0 }, ...s.sessions] }));
    audit("Impersonation started", `${t?.name} · ${minutes}m ${readOnly ? "(read-only)" : "(write)"}`, reason, "elevated");
    toast("Support session started — fully audited, auto-terminates", "info");
  };
  const endImpersonation = (id: string) => {
    setSt((s) => ({ ...s, sessions: s.sessions.map((x) => (x.id === id ? { ...x, active: false } : x)) }));
    audit("Impersonation ended", "Manual termination", "Operator action", "elevated");
    toast("Support session terminated & logged", "info");
  };

  const setTicketStatus = (id: string, status: OwnerTicket["status"]) => {
    setSt((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }));
    toast(`Ticket ${status}`);
  };
  const assignTicket = (id: string, assignee: string) => {
    setSt((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, assignee } : t)) }));
    toast(`Assigned to ${assignee}`);
  };

  const toggleFlag = (key: string) => {
    const f = st.flags.find((x) => x.key === key);
    setSt((s) => ({ ...s, flags: s.flags.map((x) => (x.key === key ? { ...x, enabled: !x.enabled, rollout: !x.enabled ? Math.max(x.rollout, 10) : x.rollout } : x)) }));
    audit(`Feature flag ${f?.enabled ? "disabled" : "enabled"}`, key, "Rollout control");
    toast(`Flag "${f?.label}" ${f?.enabled ? "disabled" : "enabled"}`, "info");
  };
  const setMaintenance = (v: boolean) => { setSt((s) => ({ ...s, maintenanceMode: v })); audit(v ? "Maintenance enabled" : "Maintenance disabled", "Platform-wide", "Operator", "elevated"); };
  const retryBackup = (tenantId: string) => {
    setSt((s) => ({ ...s, backups: s.backups.map((b) => (b.tenantId === tenantId ? { ...b, status: "ok" as const, lastOk: new Date().toISOString() } : b)) }));
    toast("On-demand backup completed ✓");
  };
  const ackSecurity = (id: string) => setSt((s) => ({ ...s, security: s.security.map((e) => (e.id === id ? { ...e, status: "acknowledged" as const } : e)) }));

  const resetOwner = () => { localStorage.removeItem(KEY); setSt(seedOwner()); toast("Control plane reset to seed", "info"); };

  const value = useMemo<OwnerCtx>(() => ({
    ...st, operator, operatorRole, page, go: setPage, toasts, toast, dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    audit, patchTenant, setTenantStatus, extendTrial, convertToPaid, renewLicense, toggleModule, addNote,
    createInvoice, recordPayment, assignAddon, removeAddon, createTenant, startImpersonation, endImpersonation,
    setTicketStatus, assignTicket, toggleFlag, setMaintenance, retryBackup, ackSecurity, resetOwner,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [st, page, toasts, operator, operatorRole]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const mrrOf = (tenants: OwnerTenant[]) => tenants.filter((t) => t.status === "active_paid").reduce((a, t) => a + monthlyValue(t), 0);
