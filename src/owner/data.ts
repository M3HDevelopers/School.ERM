/* ============================================================
   Markaz Cloud — Software Owner / Developer Control Plane
   Commercial metadata ONLY. No school operational records.
   ============================================================ */
import { rnd, dateISO } from "../data/seed";

export type TenantStatus =
  | "pending" | "trial" | "trial_expiring" | "active_paid" | "grace"
  | "suspended" | "expired" | "cancelled" | "revoked" | "archived";

export interface OwnerTenant {
  id: string;
  code: string;
  accountNo: string;
  name: string;
  shortName: string;
  type: "School" | "College" | "Academy" | "Institute";
  status: TenantStatus;
  planId: string | null;
  modules: string[];
  limits: { users: number; students: number; campuses: number; storageGb: number; sms: number; api: number };
  usage: { users: number; students: number; campuses: number; storageGb: number; sms: number; api: number };
  owner: { name: string; email: string; phone: string; cnicMasked: string; verified: boolean; lastLogin: string; twoFA: boolean };
  manager: string;
  source: string;
  createdAt: string;
  onboarding: number;
  lastActive: string;
  health: number;
  license: { id: string; type: "trial" | "monthly" | "annual" | "permanent"; key: string; activatedOn: string; expiresOn: string | null; status: string };
  trialDaysLeft: number | null;
  addons: { id: string; name: string; price: number; since: string }[];
  notes: string;
  timeline: { date: string; text: string; kind: string }[];
  apiUsage7d: number[];
}

export interface OwnerInvoice {
  id: string; no: string; tenantId: string; period: string; amount: number;
  status: "paid" | "due" | "overdue" | "refunded"; method: string; date: string; dueDate: string; items: string; paidAmount: number;
}
export interface OwnerTicket {
  id: string; no: string; tenantId: string; from: string; subject: string;
  priority: "low" | "medium" | "high"; status: "open" | "in-progress" | "resolved";
  category: string; assignee: string; created: string; sla: string; notes: string;
}
export interface OwnerAudit {
  id: string; time: string; operator: string; action: string; target: string;
  reason: string; outcome: "success" | "denied" | "failed"; risk: "normal" | "elevated";
}
export interface SecurityEvent {
  id: string; time: string; type: string; severity: "info" | "warn" | "critical";
  detail: string; status: "open" | "acknowledged" | "resolved";
}
export interface ImpersonationSession {
  id: string; tenantId: string; operator: string; reason: string;
  startedAt: string; expiresAt: number; readOnly: boolean; active: boolean; actions: number;
}
export interface Operator {
  id: string; name: string; role: string; email: string; twoFA: boolean;
  lastLogin: string; status: "active" | "suspended"; sessions: number;
}
export interface OwnerPlan {
  id: string; name: string; code: string; price: number; interval: "monthly" | "annual" | "one-time";
  modules: string[]; users: number; students: number; campuses: number; storageGb: number;
  support: string; whiteLabel: boolean; customDomain: boolean; popular?: boolean; setup: number;
}
export interface OwnerAddon { id: string; name: string; price: number; recurring: boolean; adoption: number; desc: string }
export interface Release { id: string; version: string; name: string; date: string; status: "live" | "rolling" | "internal"; rollout: number; notes: string }
export interface FeatureFlag { key: string; label: string; enabled: boolean; rollout: number }
export interface Integration { id: string; name: string; type: string; status: "healthy" | "degraded" | "down"; latency: number }
export interface BackupRecord { tenantId: string; lastOk: string; status: "ok" | "failed"; sizeGb: number }
export interface WorkflowRule { id: string; trigger: string; action: string; enabled: boolean; runs: number }
export interface OwnerAnnouncement { id: string; title: string; body: string; audience: string; date: string; delivered: number; read: number }
export interface OwnerNoti { id: string; text: string; kind: "trial" | "payment" | "security" | "system"; time: string; read: boolean }

/* ---------------- module registry (feature entitlement layer) ---------------- */
export const MODULE_REGISTRY: { key: string; label: string; group: string }[] = [
  { key: "students", label: "Students", group: "Core" },
  { key: "parents", label: "Parents / Guardians", group: "Core" },
  { key: "staff", label: "Teachers / Staff", group: "Core" },
  { key: "admissions", label: "Admissions CRM", group: "Core" },
  { key: "attendance", label: "Attendance", group: "Academics" },
  { key: "timetable", label: "Timetable", group: "Academics" },
  { key: "homework", label: "Homework / Assignments", group: "Academics" },
  { key: "exams", label: "Exams", group: "Academics" },
  { key: "results", label: "Results / Report Cards", group: "Academics" },
  { key: "fees", label: "Fee Management", group: "Finance" },
  { key: "online_payments", label: "Online Payments", group: "Finance" },
  { key: "payroll", label: "Payroll", group: "Finance" },
  { key: "hr", label: "HR", group: "Finance" },
  { key: "library", label: "Library", group: "Operations" },
  { key: "transport", label: "Transport", group: "Operations" },
  { key: "inventory", label: "Inventory", group: "Operations" },
  { key: "assets", label: "Assets", group: "Operations" },
  { key: "hostel", label: "Hostel / Boarding", group: "Operations" },
  { key: "health", label: "Health / Medical", group: "Operations" },
  { key: "discipline", label: "Discipline / Behavior", group: "Operations" },
  { key: "certificates", label: "Certificates / Documents", group: "Operations" },
  { key: "notifications", label: "Notifications", group: "Communication" },
  { key: "sms", label: "SMS", group: "Communication" },
  { key: "email", label: "Email", group: "Communication" },
  { key: "push", label: "Push Notifications", group: "Communication" },
  { key: "whatsapp", label: "WhatsApp", group: "Communication" },
  { key: "reports", label: "Reports / Analytics", group: "Insights" },
  { key: "custom_reports", label: "Custom Reports", group: "Insights" },
  { key: "advanced_analytics", label: "Advanced Analytics", group: "Insights" },
  { key: "website", label: "Public Website / CMS", group: "Portals" },
  { key: "student_portal", label: "Student Portal", group: "Portals" },
  { key: "parent_portal", label: "Parent Portal", group: "Portals" },
  { key: "teacher_portal", label: "Teacher Portal", group: "Portals" },
  { key: "admin_portal", label: "Admin Portal", group: "Portals" },
  { key: "api", label: "API Access", group: "Platform" },
  { key: "custom_domain", label: "Custom Domain", group: "Platform" },
  { key: "pwa", label: "Mobile / PWA", group: "Platform" },
  { key: "multicampus", label: "Multi-campus", group: "Platform" },
  { key: "automation", label: "Automation / Workflows", group: "Platform" },
  { key: "helpdesk", label: "Support / Helpdesk", group: "Platform" },
];
export const ALL_MODULE_KEYS = MODULE_REGISTRY.map((m) => m.key);
export const moduleLabel = (k: string) => MODULE_REGISTRY.find((m) => m.key === k)?.label ?? k;

export const STATUS_META: Record<TenantStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "neutral" },
  trial: { label: "Trial", tone: "info" },
  trial_expiring: { label: "Trial Expiring", tone: "warn" },
  active_paid: { label: "Active Paid", tone: "ok" },
  grace: { label: "Grace", tone: "warn" },
  suspended: { label: "Suspended", tone: "danger" },
  expired: { label: "Expired", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  revoked: { label: "Revoked", tone: "danger" },
  archived: { label: "Archived", tone: "neutral" },
};

/* ---------------- plans ---------------- */
const CORE = ["students", "parents", "staff", "admissions", "attendance", "timetable", "exams", "results", "fees", "notifications", "sms", "reports", "student_portal", "parent_portal", "teacher_portal", "admin_portal", "website"];
export const OWNER_PLANS: OwnerPlan[] = [
  { id: "starter", name: "Starter", code: "ST", price: 15000, interval: "monthly", modules: CORE, users: 15, students: 300, campuses: 1, storageGb: 5, support: "Email", whiteLabel: false, customDomain: false, setup: 10000 },
  { id: "professional", name: "Professional", code: "PR", price: 25000, interval: "monthly", modules: [...CORE, "homework", "online_payments", "payroll", "hr", "library", "transport", "inventory", "email", "whatsapp", "pwa", "custom_reports"], users: 40, students: 1000, campuses: 2, storageGb: 20, support: "Priority", whiteLabel: true, customDomain: false, popular: true, setup: 15000 },
  { id: "enterprise", name: "Enterprise", code: "EN", price: 45000, interval: "monthly", modules: ALL_MODULE_KEYS, users: 200, students: 10000, campuses: 10, storageGb: 100, support: "24/7 Dedicated", whiteLabel: true, customDomain: true, setup: 50000 },
  { id: "permanent", name: "Lifetime License", code: "LT", price: 500000, interval: "one-time", modules: ALL_MODULE_KEYS, users: 100, students: 5000, campuses: 5, storageGb: 50, support: "Annual AMC", whiteLabel: true, customDomain: true, setup: 0 },
];
export const planById = (id: string | null) => OWNER_PLANS.find((p) => p.id === id) ?? null;

export const OWNER_ADDONS: OwnerAddon[] = [
  { id: "biometric", name: "Biometric Attendance", price: 3000, recurring: true, adoption: 6, desc: "ZKTeco device integration for staff & student attendance." },
  { id: "gps", name: "GPS Transport Tracking", price: 2500, recurring: true, adoption: 4, desc: "Live bus tracking with parent sharing link." },
  { id: "sms_pack", name: "SMS Credit Pack (5k)", price: 4000, recurring: false, adoption: 9, desc: "Top-up bundle for outbound SMS gateway." },
  { id: "payment_gateway", name: "1Link Payment Gateway", price: 2000, recurring: true, adoption: 5, desc: "Online challan payment with auto reconciliation." },
  { id: "whatsapp_ba", name: "WhatsApp Business API", price: 3500, recurring: true, adoption: 7, desc: "Verified sender with template approval management." },
  { id: "extra_storage", name: "Extra Storage 50GB", price: 1500, recurring: true, adoption: 3, desc: "Additional document & media storage." },
];

export const OPERATORS: Operator[] = [
  { id: "op1", name: "Hassan Raza", role: "Super Owner", email: "hassan@markaz.cloud", twoFA: true, lastLogin: dateISO(0), status: "active", sessions: 1 },
  { id: "op2", name: "Ayesha Siddiqui", role: "License Manager", email: "ayesha@markaz.cloud", twoFA: true, lastLogin: dateISO(-1), status: "active", sessions: 0 },
  { id: "op3", name: "Danish Iqbal", role: "Sales Manager", email: "danish@markaz.cloud", twoFA: true, lastLogin: dateISO(0), status: "active", sessions: 2 },
  { id: "op4", name: "Mina Baig", role: "Support Operator", email: "mina@markaz.cloud", twoFA: false, lastLogin: dateISO(-2), status: "active", sessions: 0 },
  { id: "op5", name: "Kashif Niazi", role: "Finance Operator", email: "kashif@markaz.cloud", twoFA: true, lastLogin: dateISO(-3), status: "active", sessions: 0 },
  { id: "op6", name: "Sara Qureshi", role: "Read-only Auditor", email: "sara@markaz.cloud", twoFA: true, lastLogin: dateISO(-5), status: "active", sessions: 0 },
];

/* ---------------- deterministic tenant seed ---------------- */
const T_DEF: [string, string, TenantStatus, string | null, number, number, number][] = [
  // [name, type, status, planId, students, ageDays, trialLeft]
  ["Dar-e-Ilm Academy", "School", "active_paid", "professional", 594, 420, 0],
  ["Al-Noor Model School", "School", "active_paid", "professional", 412, 380, 0],
  ["Iqra Grammar School", "School", "active_paid", "starter", 238, 300, 0],
  ["City College of Science", "College", "active_paid", "enterprise", 1180, 260, 0],
  ["The Educators Academy", "Academy", "active_paid", "permanent", 655, 510, 0],
  ["Hira Grammar School", "School", "trial", "professional", 0, 9, 5],
  ["Falcon House Institute", "Institute", "trial", "starter", 0, 26, 3],
  ["Zia-ul-Uloom School", "School", "grace", "professional", 350, 200, 0],
  ["Falah Public School", "School", "suspended", "starter", 190, 320, 0],
  ["Rose Valley School", "School", "expired", "starter", 145, 160, 0],
  ["Greenfield Academy", "Academy", "pending", null, 0, 2, 0],
  ["Shaheen Model School", "School", "archived", "starter", 120, 600, 0],
];

function seedTenants(): OwnerTenant[] {
  return T_DEF.map(([name, type, status, planId, students, age, trialLeft], i) => {
    const plan = planById(planId);
    const code = name.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    const created = dateISO(-age);
    const isTrial = status === "trial";
    const paid = status === "active_paid";
    const usageStudents = paid || status === "grace" || status === "suspended" || status === "expired" || status === "archived" ? students : 0;
    const limits = {
      users: plan?.users ?? 15, students: plan?.students ?? 300, campuses: plan?.campuses ?? 1,
      storageGb: plan?.storageGb ?? 5, sms: plan ? 2000 : 500, api: plan ? 50000 : 5000,
    };
    return {
      id: `t-${100 + i}`,
      code,
      accountNo: `ACC-${2000 + i}`,
      name,
      shortName: code,
      type: type as OwnerTenant["type"],
      status,
      planId,
      modules: plan ? plan.modules : ALL_MODULE_KEYS.slice(0, 12),
      limits,
      usage: {
        users: usageStudents ? Math.max(4, Math.round(usageStudents / 30)) : 1,
        students: usageStudents,
        campuses: usageStudents > 800 ? 2 : 1,
        storageGb: Math.round((usageStudents / 100 + rnd(i) * 3) * 10) / 10,
        sms: Math.round(rnd(i + 5) * (limits.sms * 0.7)),
        api: Math.round(rnd(i + 9) * (limits.api * 0.5)),
      },
      owner: {
        name: ["Mr. Imran Malik", "Mrs. Sadia Khan", "Mr. Tariq Javed", "Dr. Naveed Alam", "Mr. Shahid Pervez", "Mrs. Huma Aslam", "Mr. Adeel Riaz", "Mr. Kamran Yousaf", "Mrs. Rabia Noreen", "Mr. Salman Akram", "Mr. Faisal Mehmood", "Mr. Naeem Ul Haq"][i],
        email: `owner${i}@${code.toLowerCase()}.edu.pk`,
        phone: `+92 3${["00", "21", "33", "45"][i % 4]}-${String(5100000 + i * 73311).slice(0, 7)}`,
        cnicMasked: `35202-•••••••-${String((i % 9) + 1)}`,
        verified: status !== "pending",
        lastLogin: dateISO(-(Math.round(rnd(i + 2) * 12))),
        twoFA: paid,
      },
      manager: ["Hassan Raza", "Danish Iqbal", "Ayesha Siddiqui"][i % 3],
      source: ["Referral", "Facebook Ads", "Website", "Expo / Event", "Referral", "Cold Call"][i % 6],
      createdAt: created,
      onboarding: status === "pending" ? 20 : isTrial ? 70 : 100,
      lastActive: dateISO(-(Math.round(rnd(i + 7) * (status === "suspended" ? 20 : 6)))),
      health: Math.round(55 + rnd(i + 3) * 44),
      license: {
        id: `LIC-${3000 + i}`,
        type: isTrial ? "trial" : planId === "permanent" ? "permanent" : i % 3 === 0 ? "annual" : "monthly",
        key: `MKZ-${code}-${String(7000 + i * 17)}-${["A", "B", "C"][i % 3]}${i}`,
        activatedOn: created,
        expiresOn: planId === "permanent" ? null : isTrial ? dateISO(trialLeft) : status === "expired" ? dateISO(-9) : dateISO(i % 3 === 0 ? 200 : 14 + (i % 20)),
        status: status === "active_paid" || isTrial ? "active" : status === "suspended" ? "suspended" : status === "revoked" ? "revoked" : "inactive",
      },
      trialDaysLeft: isTrial ? trialLeft : null,
      addons: paid && i % 2 === 0 ? [{ id: OWNER_ADDONS[i % OWNER_ADDONS.length].id, name: OWNER_ADDONS[i % OWNER_ADDONS.length].name, price: OWNER_ADDONS[i % OWNER_ADDONS.length].price, since: dateISO(-40 - i) }] : [],
      notes: i === 0 ? "Flagship reference customer. Case study approved." : "",
      timeline: [
        { date: created, text: `Tenant created (${code}) · owner account provisioned`, kind: "create" },
        { date: dateISO(-age + 1), text: isTrial || status === "pending" ? "Trial started — activation email sent" : "License activated", kind: "license" },
        ...(paid ? [{ date: dateISO(-age + 40), text: `Upgraded to ${plan?.name} · payment confirmed`, kind: "payment" as string }] : []),
        ...(status === "suspended" ? [{ date: dateISO(-18), text: "Suspended — non-payment after grace period", kind: "status" as string }] : []),
        ...(status === "grace" ? [{ date: dateISO(-6), text: "Grace period started — renewal overdue", kind: "status" as string }] : []),
      ],
      apiUsage7d: Array.from({ length: 7 }, (_, d) => Math.round(rnd(i * 7 + d + 11) * (limits.api / 40))),
    };
  });
}

function seedInvoices(tenants: OwnerTenant[]): OwnerInvoice[] {
  const out: OwnerInvoice[] = [];
  let n = 100;
  tenants.filter((t) => t.planId && t.status !== "archived" && t.status !== "pending").forEach((t, i) => {
    const plan = planById(t.planId)!;
    const count = plan.interval === "one-time" ? 1 : 2;
    for (let k = 0; k < count; k++) {
      const overdue = t.status === "grace" && k === 0;
      const paid = !overdue && (t.status === "active_paid" || k === 1 || plan.interval === "one-time");
      out.push({
        id: `inv-${n}`, no: `INV-2026-${n++}`, tenantId: t.id,
        period: plan.interval === "one-time" ? "Lifetime License" : `${["December 2025", "January 2026"][k]}`,
        amount: plan.price,
        status: paid ? "paid" : overdue ? "overdue" : "due",
        method: paid ? ["Bank Transfer", "JazzCash", "Cheque"][i % 3] : "—",
        date: dateISO(-(k * 30) - 5), dueDate: dateISO(-(k * 30) + 10),
        items: `${plan.name} subscription${t.addons.length ? ` + ${t.addons.length} add-on(s)` : ""}`,
        paidAmount: paid ? plan.price : 0,
      });
    }
  });
  return out;
}

const TICKET_DEF: [string, string, string, string, OwnerTicket["priority"], OwnerTicket["status"]][] = [
  ["t-105", "Owner — Hira Grammar", "Trial extension request — need 2 more weeks", "Commercial", "medium", "open"],
  ["t-106", "Owner — City College", "WhatsApp template rejected by Meta", "Communication", "high", "in-progress"],
  ["t-107", "Owner — Zia-ul-Uloom", "Cannot download annual collection report", "Reports", "medium", "open"],
  ["t-108", "Owner — Falah Public", "Reactivate account after cleared dues", "Commercial", "high", "open"],
  ["t-109", "Owner — Dar-e-Ilm", "Add biometric attendance add-on quote", "Sales", "low", "resolved"],
];
function seedTickets(): OwnerTicket[] {
  return TICKET_DEF.map(([tid, from, subject, category, priority, status], i) => ({
    id: tid, no: `TCK-${1041 + i}`, tenantId: tid.replace("t-", "t-1").length ? `t-${100 + ((i * 2) % 12)}` : "t-100",
    from, subject, priority, status, category,
    assignee: ["Mina Baig", "Danish Iqbal", "Kashif Niazi"][i % 3],
    created: dateISO(-(i + 1)), sla: priority === "high" ? "4h" : priority === "medium" ? "24h" : "72h",
    notes: "",
  }));
}

function seedAudit(): OwnerAudit[] {
  const rows: [string, string, string, OwnerAudit["risk"], OwnerAudit["outcome"]][] = [
    ["License renewed", "Al-Noor Model School (+30d)", "Payment confirmed INV-2026-104", "normal", "success"],
    ["Module disabled", "Iqra Grammar — Hostel", "Not in Starter plan", "normal", "success"],
    ["Impersonation started", "City College of Science (read-only, 30m)", "Debug report export failure", "elevated", "success"],
    ["Tenant suspended", "Falah Public School", "Non-payment after grace period", "elevated", "success"],
    ["Cross-tenant query blocked", "Read-only Auditor export attempt", "Outside permitted scope", "elevated", "denied"],
    ["Trial extended", "Hira Grammar (+5d)", "Customer requested evaluation time", "normal", "success"],
    ["Owner password reset", "Rose Valley School owner", "Account recovery verified", "elevated", "success"],
    ["Plan changed", "City College → Enterprise", "Upgrade before renewal", "normal", "success"],
  ];
  return rows.map(([action, target, reason, risk, outcome], i) => ({
    id: `oa-${i}`, time: new Date(Date.now() - (i + 1) * 5400e3).toISOString(),
    operator: ["Hassan Raza", "Ayesha Siddiqui", "Mina Baig", "Kashif Niazi"][i % 4],
    action, target, reason, risk: risk as OwnerAudit["risk"], outcome: outcome as OwnerAudit["outcome"],
  }));
}

function seedSecurity(): SecurityEvent[] {
  return [
    { id: "se1", time: new Date(Date.now() - 3600e3).toISOString(), type: "Cross-tenant access blocked", severity: "critical", detail: "Auditor role attempted tenant-data export without scope.", status: "open" },
    { id: "se2", time: new Date(Date.now() - 7200e3).toISOString(), type: "Repeated failed logins", severity: "warn", detail: "5 failed attempts on owner@fal… account — locked 15m.", status: "acknowledged" },
    { id: "se3", time: new Date(Date.now() - 86400e3).toISOString(), type: "API credential rotated", severity: "info", detail: "City College API key rotated on schedule.", status: "resolved" },
    { id: "se4", time: new Date(Date.now() - 2 * 86400e3).toISOString(), type: "Unusual impersonation window", severity: "warn", detail: "Support session requested 8h duration — capped to 1h by policy.", status: "resolved" },
  ];
}

export interface OwnerState {
  tenants: OwnerTenant[];
  invoices: OwnerInvoice[];
  tickets: OwnerTicket[];
  auditLog: OwnerAudit[];
  security: SecurityEvent[];
  sessions: ImpersonationSession[];
  operators: Operator[];
  releases: Release[];
  flags: FeatureFlag[];
  integrations: Integration[];
  backups: BackupRecord[];
  rules: WorkflowRule[];
  announcements: OwnerAnnouncement[];
  notis: OwnerNoti[];
  maintenanceMode: boolean;
}

export function seedOwner(): OwnerState {
  const tenants = seedTenants();
  return {
    tenants,
    invoices: seedInvoices(tenants),
    tickets: seedTickets(),
    auditLog: seedAudit(),
    security: seedSecurity(),
    sessions: [
      { id: "ss1", tenantId: "t-103", operator: "Mina Baig", reason: "Debug report export failure", startedAt: new Date(Date.now() - 12 * 60e3).toISOString(), expiresAt: Date.now() + 18 * 60e3, readOnly: true, active: true, actions: 6 },
    ],
    operators: OPERATORS,
    releases: [
      { id: "r1", version: "2.4.1", name: "Challan batch generator v2", date: dateISO(-4), status: "live", rollout: 100, notes: "Faster bulk generation, dry-run preview." },
      { id: "r2", version: "2.5.0", name: "Parent portal redesign", date: dateISO(-1), status: "rolling", rollout: 40, notes: "New fee dashboard & receipts view." },
      { id: "r3", version: "2.6.0-beta", name: "AI at-risk student detection", date: dateISO(0), status: "internal", rollout: 0, notes: "Internal testing only — configurable indicators." },
    ],
    flags: [
      { key: "new_fee_ui", label: "New fee UI", enabled: true, rollout: 100 },
      { key: "parent_redesign", label: "Parent portal redesign", enabled: true, rollout: 40 },
      { key: "ai_risk", label: "AI at-risk detection", enabled: false, rollout: 0 },
      { key: "pwa_offline", label: "PWA offline attendance", enabled: false, rollout: 0 },
    ],
    integrations: [
      { id: "i1", name: "SMS Gateway (Telenor)", type: "SMS", status: "healthy", latency: 420 },
      { id: "i2", name: "WhatsApp Business API", type: "Messaging", status: "healthy", latency: 380 },
      { id: "i3", name: "SMTP (SendGrid)", type: "Email", status: "healthy", latency: 210 },
      { id: "i4", name: "1Link Payment", type: "Payments", status: "degraded", latency: 1240 },
      { id: "i5", name: "Biometric Bridge", type: "Devices", status: "healthy", latency: 90 },
      { id: "i6", name: "GPS Provider", type: "Transport", status: "down", latency: 0 },
    ],
    backups: tenants.slice(0, 8).map((t, i) => ({
      tenantId: t.id, lastOk: new Date(Date.now() - (i + 2) * 3600e3).toISOString(),
      status: i === 5 ? "failed" : "ok", sizeGb: Math.round((t.usage.students / 80 + 1) * 10) / 10,
    })),
    rules: [
      { id: "w1", trigger: "Trial expires", action: "Set tenant → expired, notify owner", enabled: true, runs: 34 },
      { id: "w2", trigger: "Payment confirmed", action: "Extend license + restore access", enabled: true, runs: 121 },
      { id: "w3", trigger: "Renewal due in 7d", action: "Send reminder + invoice", enabled: true, runs: 58 },
      { id: "w4", trigger: "Grace period ends", action: "Suspend access", enabled: true, runs: 12 },
      { id: "w5", trigger: "Usage > 90% of limit", action: "Alert owner + sales", enabled: false, runs: 7 },
    ],
    announcements: [
      { id: "an1", title: "Scheduled maintenance — Sunday 2am", body: "Platform read-only for ~30 minutes during database upgrade.", audience: "All tenants", date: dateISO(-2), delivered: 12, read: 9 },
      { id: "an2", title: "New: WhatsApp template manager", body: "Manage Meta-approved templates from the Communication module.", audience: "Professional + Enterprise", date: dateISO(-9), delivered: 8, read: 6 },
    ],
    notis: [
      { id: "on1", text: "Trial expiring — Hira Grammar (5d left)", kind: "trial", time: new Date(Date.now() - 3600e3).toISOString(), read: false },
      { id: "on2", text: "Payment received — Al-Noor Model School (Rs 25,000)", kind: "payment", time: new Date(Date.now() - 5400e3).toISOString(), read: false },
      { id: "on3", text: "Critical: cross-tenant export attempt blocked", kind: "security", time: new Date(Date.now() - 3600e3).toISOString(), read: false },
      { id: "on4", text: "GPS integration down — 2 tenants affected", kind: "system", time: new Date(Date.now() - 7200e3).toISOString(), read: true },
    ],
    maintenanceMode: false,
  };
}

export const fmtPKR = (n: number) => `Rs ${Math.round(n).toLocaleString("en-US")}`;
export const fmtLakh = (n: number) => (n >= 100000 ? `Rs ${(n / 100000).toFixed(1)}L` : `Rs ${(n / 1000).toFixed(0)}k`);
export const monthlyValue = (t: OwnerTenant): number => {
  const p = planById(t.planId);
  if (!p) return 0;
  const base = p.interval === "annual" ? p.price / 12 : p.interval === "one-time" ? 0 : p.price;
  return base + t.addons.filter((a) => OWNER_ADDONS.find((x) => x.id === a.id)?.recurring).reduce((s, a) => s + a.price, 0);
};
