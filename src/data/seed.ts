// ============================================================
// MARKAZ ERP — data model + demo seed (tenant: Dar-e-Ilm Academy + platform control plane)
// ============================================================

export type Role = "admin" | "teacher" | "student" | "parent" | "owner";
export type NavId =
  | "dashboard" | "students" | "attendance" | "fees" | "exams" | "academics" | "admissions"
  | "hr" | "ops" | "comms" | "reports" | "settings" | "website" | "login"
  | "ownerDash" | "tenants" | "licenses" | "billing" | "system" | "security" | "support";

// ---------- date + format helpers ----------
export const TODAY = new Date();
export const dayKey = (offset = 0) => { const d = new Date(TODAY); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
export const fmtDate = (iso: string) => new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateShort = (iso: string) => new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthKey = (offset = 0) => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
export const monthLabel = (key: string) => { const [y, m] = key.split("-"); return `${MONTHS[Number(m) - 1]} ${y}`; };
export const fmtPKR = (n: number) => "Rs " + Math.round(n).toLocaleString("en-PK");
export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const initials = (name: string) => name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const rand = (seed: number) => { const x = Math.sin(seed * 999) * 10000; return x - Math.floor(x); };

// ---------- school profile + white-label themes ----------
export const SCHOOL = {
  name: "Dar-e-Ilm Academy", shortName: "DIA", code: "DIA-2026", tenantId: "t-dia",
  tagline: "Ilm se roshni, amal se taraqqi", est: 2009, session: "2025–26",
  address: "42-B Gulberg III, Lahore", phone: "+92 300 8461290", email: "info@darilm.edu.pk",
  campuses: ["Main Campus — Gulberg", "Junior Campus — DHA"],
};

export interface Theme { id: string; name: string; primary: string; primarydark: string; primarysoft: string; accent: string; }
export const THEMES: Theme[] = [
  { id: "pine", name: "Pine & Brass", primary: "#0c6b58", primarydark: "#084d3f", primarysoft: "#e2f0ea", accent: "#c99a2e" },
  { id: "navy", name: "Deep Navy", primary: "#20415f", primarydark: "#16304a", primarysoft: "#e3ebf2", accent: "#d98e32" },
  { id: "maroon", name: "Maroon Court", primary: "#7c2531", primarydark: "#5c1a24", primarysoft: "#f4e4e6", accent: "#c39a3a" },
  { id: "ink", name: "Ink & Gold", primary: "#26262a", primarydark: "#17171b", primarysoft: "#e9e9ea", accent: "#c9a227" },
];

export const HERO_IMG = "https://image.qwenlm.ai/generated-images/04df7376-12b2-4b19-a5c9-b7cc0d44ef09/_result.png";
export const PRINCIPAL_IMG = "https://image.qwenlm.ai/generated-images/a515b7a5-5031-4f43-9e43-0d2c55d3f637/_result.png";

// ---------- core school entities ----------
export interface Student {
  id: string; admNo: string; name: string; gender: "M" | "F"; dob: string;
  classId: string; section: string; roll: number; house: string;
  guardian: string; relation: string; phone: string; address: string; blood: string;
  status: "active" | "inactive" | "transferred"; admitted: string;
  feePlan: string; scholarship: number; attendancePct: number; route?: string;
}
export interface Staff {
  id: string; empId: string; name: string; role: string; dept: string; subjects: string[];
  phone: string; joined: string; type: string; salary: number; status: "active" | "on-leave" | "exited";
  leaveLeft: number; classes: string[];
}
export interface Klass { id: string; name: string; sections: string[]; strength: number; teacher: string; room: string; }
export interface Subject { id: string; name: string; teacher: string; max: number; pass: number; code: string; }
export interface VoucherLine { desc: string; amount: number; }
export interface Payment { id: string; date: string; amount: number; method: string; receipt: string; by: string; }
export type VoucherStatus = "generated" | "partial" | "paid" | "overdue" | "waived";
export interface Voucher {
  id: string; no: string; studentId: string; month: string; lines: VoucherLine[];
  discount: number; lateFee: number; total: number; paid: number; dueDate: string; status: VoucherStatus;
  payments: Payment[];
}
export interface Exam { id: string; name: string; term: string; status: "scheduled" | "entry" | "published"; from: string; to: string; classes: string[]; }
export interface Lead {
  id: string; name: string; parentName: string; phone: string; applyClass: string;
  source: string; stage: "inquiry" | "applied" | "test" | "interview" | "offered" | "enrolled";
  date: string; note: string; value: number;
}
export interface Announcement { id: string; title: string; body: string; audience: string; date: string; channels: string[]; pinned?: boolean; }
export interface Notice { id: string; title: string; date: string; audience: string; }
export interface Book { id: string; title: string; author: string; cat: string; copies: number; issued: number; rack: string; }
export interface BookIssue { id: string; bookId: string; member: string; role: string; issued: string; due: string; returned: boolean; fine: number; }
export interface Route { id: string; name: string; vehicle: string; driver: string; attendant: string; stops: string[]; capacity: number; assigned: number; fee: number; docExpiry: string; }
export interface InvItem { id: string; name: string; cat: string; unit: string; stock: number; reorder: number; supplier: string; }
export interface EventItem { id: string; title: string; date: string; type: string; audience: string; place: string; }
export interface LeaveReq { id: string; who: string; role: string; type: string; from: string; to: string; days: number; reason: string; status: "pending" | "approved" | "rejected"; }
export interface Ticket { id: string; no: string; from: string; subject: string; priority: "low" | "medium" | "high"; status: "open" | "in-progress" | "resolved"; created: string; tenantId: string; assignee?: string; category?: string; }

// ---------- owner / control-plane entities ----------
export type TenantStatus = "pending" | "trial" | "active_paid" | "grace" | "suspended" | "expired" | "cancelled" | "revoked" | "archived";
export interface ModuleDef { key: string; label: string; group: string; }
export const MODULE_REGISTRY: ModuleDef[] = [
  { key: "students", label: "Students", group: "Core" },
  { key: "parents", label: "Parents / Guardians", group: "Core" },
  { key: "teachers", label: "Teachers / Staff", group: "Core" },
  { key: "admissions", label: "Admissions CRM", group: "Academics" },
  { key: "attendance", label: "Attendance", group: "Academics" },
  { key: "timetable", label: "Timetable", group: "Academics" },
  { key: "homework", label: "Homework / Assignments", group: "Academics" },
  { key: "exams", label: "Exams", group: "Academics" },
  { key: "results", label: "Results / Report Cards", group: "Academics" },
  { key: "fees", label: "Fee Management", group: "Finance" },
  { key: "online_payments", label: "Online Payments", group: "Finance" },
  { key: "payroll", label: "Payroll", group: "Finance" },
  { key: "hr", label: "HR / Leave", group: "Finance" },
  { key: "library", label: "Library", group: "Operations" },
  { key: "transport", label: "Transport", group: "Operations" },
  { key: "inventory", label: "Inventory", group: "Operations" },
  { key: "assets", label: "Assets", group: "Operations" },
  { key: "hostel", label: "Hostel / Boarding", group: "Operations" },
  { key: "health", label: "Health / Medical", group: "Operations" },
  { key: "discipline", label: "Discipline / Behavior", group: "Operations" },
  { key: "certificates", label: "Certificates / Documents", group: "Operations" },
  { key: "notifications", label: "Notifications", group: "Communication" },
  { key: "sms", label: "SMS Gateway", group: "Communication" },
  { key: "email", label: "Email / SMTP", group: "Communication" },
  { key: "whatsapp", label: "WhatsApp", group: "Communication" },
  { key: "reports", label: "Reports / Analytics", group: "Platform" },
  { key: "public_website", label: "Public Website / CMS", group: "Platform" },
  { key: "student_portal", label: "Student Portal", group: "Platform" },
  { key: "parent_portal", label: "Parent Portal", group: "Platform" },
  { key: "teacher_portal", label: "Teacher Portal", group: "Platform" },
  { key: "api", label: "API Access", group: "Platform" },
  { key: "custom_domain", label: "Custom Domain", group: "Platform" },
  { key: "pwa", label: "Mobile / PWA", group: "Platform" },
  { key: "multi_campus", label: "Multi-campus", group: "Platform" },
  { key: "analytics", label: "Advanced Analytics", group: "Platform" },
  { key: "automation", label: "Automation / Workflows", group: "Platform" },
  { key: "helpdesk", label: "Support / Helpdesk", group: "Platform" },
];

export interface Plan {
  id: string; name: string; price: number; interval: "monthly" | "annual" | "permanent";
  tagline: string; users: number; campuses: number; students: number; storageGb: number; sms: number;
  support: string; modules: string[]; popular?: boolean;
}
export const PLANS: Plan[] = [
  {
    id: "starter", name: "Starter", price: 12000, interval: "monthly", tagline: "Single-campus school essentials",
    users: 20, campuses: 1, students: 400, storageGb: 5, sms: 1000, support: "Email — 48h",
    modules: ["students", "parents", "teachers", "attendance", "timetable", "homework", "exams", "results", "fees", "notifications", "sms", "email", "reports", "student_portal", "parent_portal", "teacher_portal", "certificates", "helpdesk"],
  },
  {
    id: "professional", name: "Professional", price: 25000, interval: "monthly", tagline: "Full revenue + academic core", popular: true,
    users: 45, campuses: 2, students: 900, storageGb: 15, sms: 4000, support: "Priority — 12h",
    modules: ["students", "parents", "teachers", "attendance", "timetable", "homework", "exams", "results", "fees", "notifications", "sms", "email", "reports", "student_portal", "parent_portal", "teacher_portal", "certificates", "helpdesk", "admissions", "online_payments", "payroll", "hr", "library", "transport", "inventory", "discipline", "health", "whatsapp", "public_website", "pwa", "automation"],
  },
  {
    id: "enterprise", name: "Enterprise", price: 60000, interval: "monthly", tagline: "School networks & franchises",
    users: 150, campuses: 8, students: 4000, storageGb: 60, sms: 15000, support: "Dedicated manager — 4h",
    modules: [...MODULE_REGISTRY.filter((m) => !["hostel"].includes(m.key)).map((m) => m.key)],
  },
  {
    id: "permanent", name: "Permanent License", price: 450000, interval: "permanent", tagline: "Lifetime, on-prem or private cloud",
    users: 500, campuses: 25, students: 20000, storageGb: 500, sms: 50000, support: "Lifetime priority + SLA",
    modules: MODULE_REGISTRY.map((m) => m.key),
  },
];

export interface Addon { id: string; name: string; price: number; kind: "monthly" | "one-time"; desc: string; adoption: number; }
export const ADDONS: Addon[] = [
  { id: "sms-pack", name: "SMS Pack +1,000", price: 2000, kind: "monthly", desc: "Extra monthly SMS quota for reminders & alerts", adoption: 6 },
  { id: "wa-api", name: "WhatsApp Business API", price: 3500, kind: "monthly", desc: "Verified WhatsApp number with template messages", adoption: 4 },
  { id: "domain", name: "Custom Domain + SSL", price: 1500, kind: "monthly", desc: "portal.yourschool.edu.pk with managed SSL", adoption: 5 },
  { id: "biometric", name: "Biometric Attendance Kit", price: 15000, kind: "one-time", desc: "Fingerprint device + API integration for staff", adoption: 2 },
  { id: "gps", name: "GPS Transport Tracking", price: 2500, kind: "monthly", desc: "Live bus tracking for parent portal", adoption: 3 },
];

export interface OwnerTenant {
  id: string; code: string; accountNo: string; name: string; shortName: string; type: string;
  status: TenantStatus; planId: string | null; modules: string[];
  limits: { users: number; campuses: number; students: number; storageGb: number; sms: number };
  usage: { users: number; students: number; storageGb: number; sms: number; api: number };
  owner: { name: string; designation: string; email: string; phone: string; cnicMasked: string; verified: boolean; lastLogin: string; lastPasswordChange: string; sessions: number };
  license: { id: string; type: "trial" | "monthly" | "annual" | "permanent" | "custom"; key: string; activatedOn: string; expiresOn: string | null; status: string };
  trialDaysLeft: number | null;
  manager: string; source: string; onboarding: number; createdAt: string; lastActive: string; health: number;
  addons: { id: string; name: string; price: number; since: string }[];
  notes: string;
  timeline: { date: string; text: string; kind: "create" | "license" | "payment" | "support" | "status" | "feature" }[];
  apiUsage7d: number[];
}
export interface Invoice {
  id: string; no: string; tenantId: string; period: string; amount: number; status: "paid" | "due" | "overdue" | "partial";
  method: string; date: string; dueDate: string; items: string; paidAmount: number;
}
export interface AuditEntry { id: string; time: string; operator: string; action: string; target: string; reason: string; outcome: "success" | "blocked" | "pending"; risk: "normal" | "elevated"; }
export interface Operator { id: string; name: string; role: string; email: string; twoFA: boolean; status: "active" | "suspended"; lastActive: string; }
export interface SecurityEvent { id: string; time: string; type: string; detail: string; severity: "info" | "warn" | "critical"; }
export interface Release { version: string; date: string; notes: string[]; rollout: number; status: "stable" | "rolling" | "internal"; }
export interface FeatureFlag { key: string; label: string; desc: string; enabled: boolean; rollout: number; }
export interface Service { name: string; status: "operational" | "degraded" | "down"; uptime: string; latency: string; }
export interface Job { id: string; name: string; tenant: string; status: "failed" | "queued" | "running"; error: string; time: string; attempts: number; }
export interface BackupRec { tenantId: string; lastOk: string; lastFail: string | null; schedule: string; sizeMb: number; status: "ok" | "failed" | "pending"; }
export interface SupportSession { id: string; tenantId: string; operator: string; reason: string; startedAt: string; expiresAt: number; readOnly: boolean; active: boolean; }

export const TENANT_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-line/70 text-sub" },
  trial: { label: "Trial", cls: "bg-accentsoft text-warn" },
  trial_expiring: { label: "Trial Expiring", cls: "bg-warnsoft text-warn" },
  active_paid: { label: "Active Paid", cls: "bg-oksoft text-ok" },
  grace: { label: "Grace Period", cls: "bg-warnsoft text-warn" },
  suspended: { label: "Suspended", cls: "bg-dangersoft text-danger" },
  expired: { label: "Expired", cls: "bg-dangersoft text-danger" },
  cancelled: { label: "Cancelled", cls: "bg-line/70 text-sub" },
  revoked: { label: "Revoked", cls: "bg-dangersoft text-danger" },
  archived: { label: "Archived", cls: "bg-line/70 text-sub" },
};

// ============================================================
// SEED
// ============================================================
const firstM = ["Ahmed", "Ali", "Hassan", "Usman", "Bilal", "Hamza", "Zain", "Umar", "Abdullah", "Ibrahim", "Ayesha", "Fatima", "Zainab", "Maryam", "Khadija", "Amna", "Hira", "Sana", "Mahnoor", "Rabia", "Owais", "Saad", "Fahad", "Talha", "Noor", "Iqra", "Minahil", "Laiba"];
const lastN = ["Khan", "Ahmed", "Malik", "Qureshi", "Butt", "Chaudhry", "Sheikh", "Abbasi", "Hashmi", "Raza", "Javed", "Aslam", "Farooq", "Baig", "Ansari"];
const houses = ["Iqbal", "Jinnah", "Liaquat", "Fatima"];
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

function seedStudents(): Student[] {
  const list: Student[] = [];
  for (let i = 0; i < 28; i++) {
    const g: "M" | "F" = i % 2 === 0 ? "M" : "F";
    const name = `${pick(firstM, i * 3 + 1)} ${pick(lastN, i * 7 + 2)}`;
    const gName = `${pick(firstM, i * 5 + 3)} ${pick(lastN, i * 7 + 2)}`;
    list.push({
      id: `s${i + 1}`, admNo: `DIA-${2019 + (i % 6)}-${1001 + i}`,
      name, gender: g, dob: `201${2 + (i % 2)}-0${(i % 8) + 1}-1${i % 9}`,
      classId: "g8", section: i < 14 ? "A" : "B", roll: (i % 14) + 1,
      house: pick(houses, i), guardian: gName, relation: "Father",
      phone: `+92 3${(i % 4) === 0 ? "00" : (i % 4) === 1 ? "21" : (i % 4) === 2 ? "33" : "45"} ${2000000 + i * 13579}`,
      address: `${12 + i}-${String.fromCharCode(65 + (i % 6))}, ${["Gulberg III", "Johar Town", "Model Town", "Wapda Town", "Izmir Town"][i % 5]}, Lahore`,
      blood: pick(["A+", "B+", "O+", "A-", "AB+"], i), status: "active",
      admitted: dayKey(-400 - i * 20), feePlan: i % 5 === 0 ? "Concession 25%" : "Standard",
      scholarship: i % 5 === 0 ? 25 : 0,
      attendancePct: Math.round(86 + rand(i) * 13),
      route: i % 3 === 0 ? "r1" : i % 3 === 1 ? "r2" : undefined,
    });
  }
  return list;
}

const CLASS_LIST: Klass[] = [
  { id: "g1", name: "Grade 1", sections: ["A", "B"], strength: 52, teacher: "Rabia Noor", room: "J-01" },
  { id: "g2", name: "Grade 2", sections: ["A", "B"], strength: 58, teacher: "Saima Iqbal", room: "J-02" },
  { id: "g3", name: "Grade 3", sections: ["A", "B"], strength: 61, teacher: "Hina Shahid", room: "J-03" },
  { id: "g4", name: "Grade 4", sections: ["A", "B"], strength: 57, teacher: "Nadia Hussain", room: "M-11" },
  { id: "g5", name: "Grade 5", sections: ["A", "B"], strength: 64, teacher: "Adeel Raza", room: "M-12" },
  { id: "g6", name: "Grade 6", sections: ["A", "B"], strength: 66, teacher: "Farah Bashir", room: "M-13" },
  { id: "g7", name: "Grade 7", sections: ["A", "B"], strength: 63, teacher: "Imran Qureshi", room: "M-14" },
  { id: "g8", name: "Grade 8", sections: ["A", "B"], strength: 62, teacher: "Sara Malik", room: "M-21" },
  { id: "g9", name: "Grade 9", sections: ["A", "B"], strength: 55, teacher: "Bilal Anwar", room: "M-22" },
  { id: "g10", name: "Grade 10", sections: ["A", "B"], strength: 48, teacher: "Hafiz Tahir", room: "M-23" },
];

const SUBJECTS_G8: Subject[] = [
  { id: "math", name: "Mathematics", teacher: "Sara Malik", max: 100, pass: 40, code: "MTH-8" },
  { id: "eng", name: "English", teacher: "Imran Qureshi", max: 100, pass: 40, code: "ENG-8" },
  { id: "urd", name: "Urdu", teacher: "Farah Bashir", max: 100, pass: 40, code: "URD-8" },
  { id: "sci", name: "General Science", teacher: "Nadia Hussain", max: 100, pass: 40, code: "SCI-8" },
  { id: "isl", name: "Islamiyat", teacher: "Hafiz Tahir", max: 50, pass: 20, code: "ISL-8" },
  { id: "soc", name: "Social Studies", teacher: "Adeel Raza", max: 50, pass: 20, code: "SOC-8" },
  { id: "comp", name: "Computer Science", teacher: "Bilal Anwar", max: 50, pass: 20, code: "CMP-8" },
];

const STAFF: Staff[] = [
  { id: "t1", empId: "EMP-101", name: "Sara Malik", role: "Senior Teacher", dept: "Mathematics", subjects: ["Mathematics"], phone: "+92 321 4456712", joined: dayKey(-1500), type: "Permanent", salary: 85000, status: "active", leaveLeft: 12, classes: ["8-A", "8-B", "9-A"] },
  { id: "t2", empId: "EMP-102", name: "Imran Qureshi", role: "Teacher", dept: "English", subjects: ["English"], phone: "+92 300 8812345", joined: dayKey(-1100), type: "Permanent", salary: 72000, status: "active", leaveLeft: 9, classes: ["7-A", "8-A", "9-B"] },
  { id: "t3", empId: "EMP-103", name: "Farah Bashir", role: "Teacher", dept: "Urdu", subjects: ["Urdu"], phone: "+92 333 5123987", joined: dayKey(-900), type: "Permanent", salary: 68000, status: "active", leaveLeft: 14, classes: ["6-A", "7-B", "8-A"] },
  { id: "t4", empId: "EMP-104", name: "Nadia Hussain", role: "Teacher", dept: "Science", subjects: ["General Science"], phone: "+92 345 2298811", joined: dayKey(-700), type: "Permanent", salary: 70000, status: "on-leave", leaveLeft: 4, classes: ["8-A", "8-B"] },
  { id: "t5", empId: "EMP-105", name: "Hafiz Tahir", role: "Teacher", dept: "Islamiyat", subjects: ["Islamiyat"], phone: "+92 301 7745120", joined: dayKey(-1800), type: "Permanent", salary: 60000, status: "active", leaveLeft: 11, classes: ["6-B", "7-A", "8-A"] },
  { id: "t6", empId: "EMP-106", name: "Adeel Raza", role: "Teacher", dept: "Social Studies", subjects: ["Social Studies"], phone: "+92 322 9034571", joined: dayKey(-500), type: "Contract", salary: 58000, status: "active", leaveLeft: 15, classes: ["8-A", "9-A"] },
  { id: "t7", empId: "EMP-107", name: "Bilal Anwar", role: "Teacher", dept: "Computer Science", subjects: ["Computer Science"], phone: "+92 336 4412098", joined: dayKey(-300), type: "Contract", salary: 62000, status: "active", leaveLeft: 16, classes: ["7-A", "8-A", "10-A"] },
  { id: "t8", empId: "EMP-108", name: "Rabia Noor", role: "Class Teacher (Jr)", dept: "Primary", subjects: ["All (Primary)"], phone: "+92 311 8823467", joined: dayKey(-1300), type: "Permanent", salary: 55000, status: "active", leaveLeft: 10, classes: ["1-A"] },
  { id: "t9", empId: "EMP-109", name: "Dr. Amina Khalid", role: "Vice Principal", dept: "Administration", subjects: [], phone: "+92 300 1122334", joined: dayKey(-2400), type: "Permanent", salary: 140000, status: "active", leaveLeft: 18, classes: [] },
  { id: "t10", empId: "EMP-110", name: "Kashif Mehmood", role: "Accountant", dept: "Accounts", subjects: [], phone: "+92 345 6677889", joined: dayKey(-1600), type: "Permanent", salary: 90000, status: "active", leaveLeft: 8, classes: [] },
  { id: "t11", empId: "EMP-111", name: "Sadia Parveen", role: "Librarian", dept: "Library", subjects: [], phone: "+92 333 1290456", joined: dayKey(-800), type: "Permanent", salary: 48000, status: "active", leaveLeft: 12, classes: [] },
  { id: "t12", empId: "EMP-112", name: "Naveed Iqbal", role: "Transport Incharge", dept: "Transport", subjects: [], phone: "+92 301 4455667", joined: dayKey(-1000), type: "Permanent", salary: 52000, status: "active", leaveLeft: 13, classes: [] },
  { id: "t13", empId: "EMP-113", name: "Shazia Kamran", role: "Front Desk Officer", dept: "Administration", subjects: [], phone: "+92 321 9988776", joined: dayKey(-450), type: "Contract", salary: 45000, status: "active", leaveLeft: 14, classes: [] },
  { id: "t14", empId: "EMP-114", name: "Tariq Jameel", role: "Lab Assistant", dept: "Science", subjects: [], phone: "+92 302 5566778", joined: dayKey(-600), type: "Contract", salary: 42000, status: "active", leaveLeft: 11, classes: [] },
];

function seedVouchers(students: Student[]): Voucher[] {
  const vs: Voucher[] = [];
  let cn = 48210, rn = 11830;
  const months = [monthKey(-2), monthKey(-1), monthKey(0)];
  students.slice(0, 14).forEach((st, si) => {
    months.forEach((m, mi) => {
      const lines: VoucherLine[] = [
        { desc: "Tuition Fee", amount: 3200 },
        { desc: "Lab & Activity Charges", amount: 300 },
      ];
      if (st.route) lines.push({ desc: "Transport Fee", amount: 1500 });
      const gross = lines.reduce((a, l) => a + l.amount, 0);
      const discount = Math.round((gross * st.scholarship) / 100);
      const overdue = mi === 2 && (si % 4 === 3);
      const lateFee = overdue ? 200 : 0;
      const total = gross - discount + lateFee;
      let paid = 0; let status: VoucherStatus = "generated"; const payments: Payment[] = [];
      if (mi < 2 ? si % 6 !== 5 : si % 4 < 2) {
        paid = total; status = "paid";
        payments.push({ id: `p${cn}`, date: `${m}-${String(6 + si).padStart(2, "0")}`, amount: total, method: si % 3 === 0 ? "Bank Transfer" : "Cash", receipt: `RCP-${rn++}`, by: "Kashif Mehmood" });
      } else if (overdue && si % 2 === 1) {
        paid = Math.round(total / 2); status = "partial";
        payments.push({ id: `p${cn}`, date: `${m}-09`, amount: paid, method: "Cash", receipt: `RCP-${rn++}`, by: "Kashif Mehmood" });
      } else if (overdue) status = "overdue";
      vs.push({
        id: `v-${st.id}-${m}`, no: `CHN-${cn++}`, studentId: st.id, month: m, lines,
        discount, lateFee, total, paid,
        dueDate: `${m}-10`, status, payments,
      });
    });
  });
  return vs;
}

function seedMarks(): Record<string, Record<string, Record<string, number | "AB">>> {
  const out: Record<string, Record<string, Record<string, number | "AB">>> = {};
  const mid: Record<string, Record<string, number | "AB">> = {};
  const mon: Record<string, Record<string, number | "AB">> = {};
  for (let i = 0; i < 14; i++) {
    const row: Record<string, number | "AB"> = {};
    SUBJECTS_G8.forEach((sub, sj) => {
      if (i === 12 && sj === 2) row[sub.id] = "AB";
      else row[sub.id] = Math.round(sub.max * (0.45 + rand(i * 7 + sj) * 0.5));
    });
    mid[`s${i + 1}`] = row;
    const mrow: Record<string, number | "AB"> = {};
    ["math", "eng", "sci"].forEach((sid, sj) => { if (i < 12) mrow[sid] = Math.round(25 * (0.4 + rand(i * 13 + sj) * 0.55)); });
    if (Object.keys(mrow).length) mon[`s${i + 1}`] = mrow;
  }
  out["ex-mid|g8A"] = mid;
  out["ex-mon|g8A"] = mon;
  return out;
}

const LEADS: Lead[] = [
  { id: "l1", name: "Rayyan Aslam", parentName: "Aslam Pervez", phone: "+92 300 4411223", applyClass: "Grade 6", source: "Walk-in", stage: "inquiry", date: dayKey(-1), note: "Father visited campus, wants fee schedule", value: 3500 },
  { id: "l2", name: "Mahira Khan", parentName: "Salman Khan", phone: "+92 321 8899001", applyClass: "Grade 1", source: "Facebook Ad", stage: "inquiry", date: dayKey(-2), note: "Asked about junior campus timings", value: 3500 },
  { id: "l3", name: "Abdul Rehman", parentName: "Tariq Mahmood", phone: "+92 333 2245566", applyClass: "Grade 8", source: "Referral — current parent", stage: "applied", date: dayKey(-4), note: "Form submitted, documents pending", value: 5000 },
  { id: "l4", name: "Iqra Fatima", parentName: "Naveed Akhtar", phone: "+92 345 7788112", applyClass: "Grade 9", source: "Website", stage: "test", date: dayKey(-6), note: "Entry test scheduled Saturday 10am", value: 5000 },
  { id: "l5", name: "Hamza Sheikh", parentName: "Adeel Sheikh", phone: "+92 301 6677990", applyClass: "Grade 3", source: "Referral — staff", stage: "interview", date: dayKey(-9), note: "Principal interview Thursday", value: 3500 },
  { id: "l6", name: "Noor Ul Huda", parentName: "Zubair Ahmed", phone: "+92 322 1190345", applyClass: "Grade 7", source: "Banner — mosque board", stage: "offered", date: dayKey(-12), note: "Offer letter sent — awaiting admission fee", value: 4500 },
  { id: "l7", name: "Ahad Raza", parentName: "Faisal Raza", phone: "+92 336 5522881", applyClass: "Grade 5", source: "Website", stage: "enrolled", date: dayKey(-18), note: "Converted — section 5-B, roll 19", value: 3500 },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Mid-Term Result Declared", body: "Mid-term examination results for Grades 6–10 are now available on the parent and student portals. Report cards can be collected from class teachers on Friday.", audience: "All Parents & Students", date: dayKey(-1), channels: ["App", "SMS", "WhatsApp"], pinned: true },
  { id: "a2", title: "Parent–Teacher Meeting — Saturday", body: "PTM for Grades 1–5 this Saturday, 9:00 am to 12:00 pm. Parents are requested to collect appointment slips from class teachers.", audience: "Primary Parents", date: dayKey(-2), channels: ["App", "WhatsApp"] },
  { id: "a3", title: "Winter Uniform Reminder", body: "Winter uniform is mandatory from Monday. Blazers and grey trousers/skirts per the uniform chart.", audience: "All Parents", date: dayKey(-4), channels: ["App", "SMS"] },
  { id: "a4", title: "Fee Challans — Due Date", body: `Monthly fee challans for ${monthLabel(monthKey(0))} are issued. Kindly pay before the 10th to avoid the Rs 200 late fee.`, audience: "All Parents", date: dayKey(-5), channels: ["App", "SMS", "Email", "WhatsApp"] },
  { id: "a5", title: "Staff Meeting — Exam Duty Roster", body: "All secondary-section teachers are requested to attend the duty-roster briefing in the conference room, 2:15 pm.", audience: "Teachers", date: dayKey(-6), channels: ["App", "Email"] },
];

const NOTICES: Notice[] = [
  { id: "n1", title: "Science Fair — project submissions by Friday", date: dayKey(-1), audience: "Students" },
  { id: "n2", title: "Library week: 2-book borrowing allowed", date: dayKey(-3), audience: "All" },
  { id: "n3", title: "Cricket team trials — Tuesday, 7:30 am", date: dayKey(-2), audience: "Students" },
  { id: "n4", title: "School remains closed on Friday — Eid Milad-un-Nabi", date: dayKey(-5), audience: "All" },
];

const BOOKS: Book[] = [
  { id: "b1", title: "Oxford English Grammar Course", author: "Michael Swan", cat: "Language", copies: 12, issued: 4, rack: "A-2" },
  { id: "b2", title: "Physics for Matric", author: "Punjab Textbook Board", cat: "Science", copies: 30, issued: 18, rack: "C-1" },
  { id: "b3", title: "Islamiyat Lazmi", author: "PTB", cat: "Religion", copies: 25, issued: 9, rack: "B-3" },
  { id: "b4", title: "Mathematics 8 (Durr-e-Nisab)", author: "PTB", cat: "Mathematics", copies: 28, issued: 21, rack: "C-4" },
  { id: "b5", title: "Urdu Qawaid", author: "Shamsur Rahman Faruqi", cat: "Language", copies: 15, issued: 3, rack: "A-1" },
  { id: "b6", title: "Atlas of the World", author: "Oxford", cat: "Reference", copies: 8, issued: 2, rack: "D-1" },
  { id: "b7", title: "Computer Science 8", author: "PTB", cat: "Computer", copies: 20, issued: 11, rack: "E-2" },
  { id: "b8", title: "Stories of the Prophets", author: "Ibn Kathir (abridged)", cat: "Religion", copies: 10, issued: 6, rack: "B-1" },
];

const BOOK_ISSUES: BookIssue[] = [
  { id: "bi1", bookId: "b4", member: "Ahmed Khan", role: "Student 8-A", issued: dayKey(-9), due: dayKey(5), returned: false, fine: 0 },
  { id: "bi2", bookId: "b2", member: "Sara Malik", role: "Teacher", issued: dayKey(-20), due: dayKey(-6), returned: false, fine: 70 },
  { id: "bi3", bookId: "b1", member: "Fatima Ahmed", role: "Student 8-A", issued: dayKey(-3), due: dayKey(11), returned: false, fine: 0 },
  { id: "bi4", bookId: "b7", member: "Usman Malik", role: "Student 8-A", issued: dayKey(-16), due: dayKey(-2), returned: true, fine: 30 },
];

const ROUTES: Route[] = [
  { id: "r1", name: "Route 1 — Gulberg / DHA", vehicle: "Coaster LEA-2019", driver: "Rashid Mehmood", attendant: "Shabana Bibi", stops: ["Gulberg III", "Gaddafi Stadium", "DHA Y-Block", "CineStar"], capacity: 40, assigned: 36, fee: 1500, docExpiry: dayKey(120) },
  { id: "r2", name: "Route 2 — Johar Town / Wapda", vehicle: "Hiace LEB-8841", driver: "Ijaz Hussain", attendant: "—", stops: ["Johar Town G1", "Wapda Town", "Izmir Town"], capacity: 14, assigned: 15, fee: 1200, docExpiry: dayKey(18) },
  { id: "r3", name: "Route 3 — Model Town / Ichhra", vehicle: "Coaster LEF-4520", driver: "Yousaf Ali", attendant: "Nasreen Akhtar", stops: ["Model Town B", "Ichhra Mor", "Ferozepur Road"], capacity: 40, assigned: 29, fee: 1500, docExpiry: dayKey(-9) },
];

const INVENTORY: InvItem[] = [
  { id: "i1", name: "A4 Copier Paper (ream)", cat: "Stationery", unit: "reams", stock: 34, reorder: 20, supplier: "Pak Paper Mart" },
  { id: "i2", name: "Whiteboard Markers", cat: "Stationery", unit: "pcs", stock: 12, reorder: 48, supplier: "Pak Paper Mart" },
  { id: "i3", name: "Chalk (box)", cat: "Classroom", unit: "boxes", stock: 60, reorder: 24, supplier: "Al-Habib Traders" },
  { id: "i4", name: "Science Lab Chemicals Kit", cat: "Lab", unit: "kits", stock: 6, reorder: 4, supplier: "Roshan Scientific" },
  { id: "i5", name: "First-Aid Refill Packs", cat: "Welfare", unit: "packs", stock: 3, reorder: 6, supplier: "MediCare Supplies" },
  { id: "i6", name: "Sports Cricket Balls", cat: "Sports", unit: "pcs", stock: 18, reorder: 10, supplier: "City Sports" },
  { id: "i7", name: "LED Bulbs 18W", cat: "Maintenance", unit: "pcs", stock: 40, reorder: 25, supplier: "Brighto Depot" },
  { id: "i8", name: "Register / Attendance Books", cat: "Administration", unit: "pcs", stock: 8, reorder: 15, supplier: "Al-Habib Traders" },
];

const EVENTS: EventItem[] = [
  { id: "e1", title: "Parent–Teacher Meeting (Grades 1–5)", date: dayKey(3), type: "PTM", audience: "Parents", place: "Respective classrooms" },
  { id: "e2", title: "Mid-Term Result Day", date: dayKey(1), type: "Academic", audience: "All", place: "Online portals" },
  { id: "e3", title: "Science Fair 2026", date: dayKey(9), type: "Competition", audience: "Students", place: "School hall" },
  { id: "e4", title: "Annual Sports Day", date: dayKey(21), type: "Sports", audience: "All", place: "Main ground" },
  { id: "e5", title: "Staff Training — Smart Boards", date: dayKey(6), type: "Workshop", audience: "Teachers", place: "Conference room" },
  { id: "e6", title: "Quarterly Fee Challans Issued", date: dayKey(12), type: "Finance", audience: "Parents", place: "—" },
];

const LEAVES: LeaveReq[] = [
  { id: "lv1", who: "Nadia Hussain", role: "Teacher — Science", type: "Medical Leave", from: dayKey(0), to: dayKey(2), days: 3, reason: "Fever, doctor advised rest", status: "approved" },
  { id: "lv2", who: "Adeel Raza", role: "Teacher — Social Studies", type: "Casual Leave", from: dayKey(4), to: dayKey(4), days: 1, reason: "Bank work", status: "pending" },
  { id: "lv3", who: "Sadia Parveen", role: "Librarian", type: "Casual Leave", from: dayKey(8), to: dayKey(9), days: 2, reason: "Family function out of city", status: "pending" },
  { id: "lv4", who: "Bilal Anwar", role: "Teacher — Computer", type: "Earned Leave", from: dayKey(-10), to: dayKey(-8), days: 3, reason: "Personal", status: "approved" },
];

const TICKETS: Ticket[] = [
  { id: "tk1", no: "TCK-1041", from: "Owner — Ilm-o-Hikmah", subject: "WhatsApp challan template showing placeholder text", priority: "high", status: "open", created: dayKey(-1), tenantId: "t-ilm", assignee: "Danish Iqbal", category: "Communication" },
  { id: "tk2", no: "TCK-1040", from: "Owner — Hira Grammar", subject: "CSV student import stuck at validation step", priority: "medium", status: "in-progress", created: dayKey(-2), tenantId: "t-hira", assignee: "Mina Baig", category: "Onboarding" },
  { id: "tk3", no: "TCK-1038", from: "Owner — Ziya College", subject: "Win-back pricing query for annual renewal", priority: "medium", status: "open", created: dayKey(-4), tenantId: "t-ziya", assignee: "Hassan Raza", category: "Commercial" },
  { id: "tk4", no: "TCK-1036", from: "Owner — Dar-e-Ilm", subject: "Request: biometric attendance add-on quotation", priority: "low", status: "resolved", created: dayKey(-6), tenantId: "t-dia", assignee: "Ayesha Siddiqui", category: "Sales" },
  { id: "tk5", no: "TCK-1035", from: "Owner — Falah Public", subject: "Payment plan request to clear overdue invoices", priority: "high", status: "open", created: dayKey(-8), tenantId: "t-falah", assignee: "Kashif Niazi", category: "Commercial" },
];

const COLLECTION_SERIES = [1210, 1290, 1245, 1330, 1270, 1385, 1340, 1425].map((v, i) => ({ label: monthLabel(monthKey(-7 + i)), value: v * 1000 }));
const ENROLL_SERIES = [548, 556, 562, 571, 580, 588, 597, 612].map((v, i) => ({ label: monthLabel(monthKey(-7 + i)), value: v }));
const ATT_MONTH = Array.from({ length: 18 }, (_, i) => ({ label: `${i + 1}`, value: Math.round(87 + rand(i + 3) * 11) }));

const EXAMS: Exam[] = [
  { id: "ex-mid", name: "Mid-Term Examination", term: "Session 2025–26", status: "published", from: dayKey(-24), to: dayKey(-14), classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
  { id: "ex-mon", name: `Monthly Test — ${monthLabel(monthKey(0))}`, term: "Session 2025–26", status: "entry", from: dayKey(-6), to: dayKey(-2), classes: ["Grade 6", "Grade 7", "Grade 8"] },
  { id: "ex-fin", name: "Final Term Examination", term: "Session 2025–26", status: "scheduled", from: dayKey(48), to: dayKey(58), classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
];

// ---------- control-plane seed ----------
const t = (daysAgo: number) => dayKey(-daysAgo);
const OWNER_TENANTS: OwnerTenant[] = [
  {
    id: "t-dia", code: "DIA-2026", accountNo: "ACC-00014", name: "Dar-e-Ilm Academy", shortName: "DIA", type: "School (K-10)",
    status: "active_paid", planId: "professional",
    modules: PLANS[1].modules,
    limits: { users: 45, campuses: 2, students: 900, storageGb: 15, sms: 4000 },
    usage: { users: 24, students: 612, storageGb: 6.4, sms: 1840, api: 12480 },
    owner: { name: "Ch. Muhammad Owais", designation: "Director", email: "director@darilm.edu.pk", phone: "+92 300 8461290", cnicMasked: "35202-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 3600e3 * 5).toISOString(), lastPasswordChange: t(41), sessions: 1 },
    license: { id: "LIC-2026-014", type: "annual", key: "MKZ-9F2K-D8LP-Q7XN-B3T6", activatedOn: t(180), expiresOn: dayKey(185), status: "active" },
    trialDaysLeft: null,
    manager: "Hassan Raza", source: "Referral — existing customer", onboarding: 100, createdAt: t(540), lastActive: new Date(Date.now() - 3600e3 * 2).toISOString(), health: 96,
    addons: [{ id: "wa-api", name: "WhatsApp Business API", price: 3500, since: t(120) }, { id: "domain", name: "Custom Domain + SSL", price: 1500, since: t(300) }],
    notes: "Flagship reference customer. Renewal conversation started — interested in biometric add-on.",
    timeline: [
      { date: t(180), text: "Annual subscription paid — Rs 3,00,000 (invoice INV-2025-031)", kind: "payment" },
      { date: t(120), text: "Add-on activated: WhatsApp Business API", kind: "feature" },
      { date: t(90), text: "Support session — fee challan template customisation", kind: "support" },
      { date: t(60), text: "Module enabled: Automation / Workflows", kind: "feature" },
      { date: t(30), text: "Quarterly health review — all integrations healthy", kind: "status" },
      { date: t(540), text: "Tenant created — Professional plan (trial)", kind: "create" },
    ],
    apiUsage7d: [1450, 1620, 1510, 1780, 1690, 1310, 1120],
  },
  {
    id: "t-hira", code: "HGS-2026", accountNo: "ACC-00021", name: "Hira Grammar School", shortName: "HGS", type: "School (K-8)",
    status: "trial", planId: null, modules: PLANS[1].modules,
    limits: { users: 20, campuses: 1, students: 400, storageGb: 5, sms: 500 },
    usage: { users: 9, students: 214, storageGb: 1.1, sms: 130, api: 2140 },
    owner: { name: "Mrs. Shazia Kamal", designation: "Principal", email: "principal@hirags.edu.pk", phone: "+92 321 5567812", cnicMasked: "61101-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 3600e3 * 20).toISOString(), lastPasswordChange: t(23), sessions: 0 },
    license: { id: "LIC-2026-098", type: "trial", key: "MKZ-TR14-HGS0-K2MD-9QPL", activatedOn: t(25), expiresOn: dayKey(5), status: "active" },
    trialDaysLeft: 5,
    manager: "Hassan Raza", source: "Facebook Ad", onboarding: 80, createdAt: t(25), lastActive: new Date(Date.now() - 3600e3 * 20).toISOString(), health: 88,
    addons: [],
    notes: "Very engaged during trial. Conversion call scheduled with owner this week.",
    timeline: [
      { date: t(25), text: "30-day trial started — Professional package", kind: "license" },
      { date: t(20), text: "Owner account created & verified", kind: "create" },
      { date: t(9), text: "Trial reminder sent (10 days left)", kind: "status" },
      { date: t(2), text: "Trial reminder sent — 7 days remaining", kind: "status" },
    ],
    apiUsage7d: [210, 240, 190, 260, 300, 180, 150],
  },
  {
    id: "t-noor", code: "NIA-2026", accountNo: "ACC-00024", name: "Noor International Academy", shortName: "NIA", type: "Academy",
    status: "trial", planId: null, modules: PLANS[0].modules,
    limits: { users: 15, campuses: 1, students: 300, storageGb: 5, sms: 300 },
    usage: { users: 5, students: 96, storageGb: 0.4, sms: 40, api: 620 },
    owner: { name: "Mr. Danish Noor", designation: "Founder", email: "danish@nooracademy.pk", phone: "+92 345 2209871", cnicMasked: "35201-•••••••-•", verified: false, lastLogin: new Date(Date.now() - 3600e3 * 72).toISOString(), lastPasswordChange: t(11), sessions: 0 },
    license: { id: "LIC-2026-101", type: "trial", key: "MKZ-TR14-NIA7-P4KS-2MZR", activatedOn: t(11), expiresOn: dayKey(19), status: "active" },
    trialDaysLeft: 19,
    manager: "Ayesha Siddiqui", source: "Website", onboarding: 45, createdAt: t(11), lastActive: new Date(Date.now() - 3600e3 * 72).toISOString(), health: 71,
    addons: [],
    notes: "Slow data migration — offered free CSV import assistance.",
    timeline: [
      { date: t(11), text: "30-day trial started — Starter package", kind: "license" },
      { date: t(10), text: "Owner account created (verification pending)", kind: "create" },
    ],
    apiUsage7d: [60, 80, 45, 90, 70, 55, 40],
  },
  {
    id: "t-ilm", code: "IHS-2025", accountNo: "ACC-00009", name: "Ilm-o-Hikmah School", shortName: "IHS", type: "School (K-10)",
    status: "grace", planId: "professional", modules: PLANS[1].modules,
    limits: { users: 45, campuses: 1, students: 900, storageGb: 15, sms: 4000 },
    usage: { users: 28, students: 540, storageGb: 8.9, sms: 2210, api: 9800 },
    owner: { name: "Maulana Abdul Ghafoor", designation: "Chairman", email: "chairman@ilmohikmah.edu.pk", phone: "+92 333 8845120", cnicMasked: "37405-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 3600e3 * 96).toISOString(), lastPasswordChange: t(80), sessions: 0 },
    license: { id: "LIC-2025-076", type: "monthly", key: "MKZ-M101-IHS9-D3LP-K8QN", activatedOn: t(160), expiresOn: dayKey(-6), status: "grace" },
    trialDaysLeft: null,
    manager: "Hassan Raza", source: "Exhibition — EduTech Lahore", onboarding: 100, createdAt: t(400), lastActive: new Date(Date.now() - 3600e3 * 96).toISOString(), health: 74,
    addons: [{ id: "sms-pack", name: "SMS Pack +1,000", price: 2000, since: t(150) }],
    notes: "Payment promised this week by accounts office. Grace ends in 7 days — auto-suspend rule armed.",
    timeline: [
      { date: t(6), text: "Invoice INV-2026-114 became overdue", kind: "payment" },
      { date: t(5), text: "Grace period started (policy: 7 days)", kind: "status" },
      { date: t(3), text: "Payment reminder sent to owner + accountant", kind: "support" },
    ],
    apiUsage7d: [1200, 1150, 1320, 980, 1050, 890, 760],
  },
  {
    id: "t-falah", code: "FPS-2024", accountNo: "ACC-00005", name: "Falah Public School", shortName: "FPS", type: "School (K-8)",
    status: "suspended", planId: "starter", modules: PLANS[0].modules,
    limits: { users: 20, campuses: 1, students: 400, storageGb: 5, sms: 1000 },
    usage: { users: 14, students: 356, storageGb: 3.2, sms: 820, api: 4100 },
    owner: { name: "Mr. Riaz Ahmed", designation: "Owner", email: "riaz@falahschool.pk", phone: "+92 301 4409812", cnicMasked: "38403-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 86400e3 * 12).toISOString(), lastPasswordChange: t(140), sessions: 0 },
    license: { id: "LIC-2024-032", type: "monthly", key: "MKZ-M101-FPS4-N2QX-L7PD", activatedOn: t(420), expiresOn: dayKey(-32), status: "suspended" },
    trialDaysLeft: null,
    manager: "Ayesha Siddiqui", source: "Walk-in sales visit", onboarding: 100, createdAt: t(600), lastActive: new Date(Date.now() - 86400e3 * 12).toISOString(), health: 40,
    addons: [],
    notes: "Suspended for non-payment after grace. 3 invoices outstanding — total Rs 41,000.",
    timeline: [
      { date: t(32), text: "Access suspended — non-payment after grace period", kind: "status" },
      { date: t(40), text: "Grace period ended", kind: "status" },
      { date: t(70), text: "Invoice INV-2026-091 became overdue", kind: "payment" },
    ],
    apiUsage7d: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "t-ziya", code: "ZCC-2025", accountNo: "ACC-00011", name: "Ziya College Campus", shortName: "ZCC", type: "College",
    status: "expired", planId: "enterprise", modules: PLANS[2].modules,
    limits: { users: 150, campuses: 3, students: 4000, storageGb: 60, sms: 15000 },
    usage: { users: 61, students: 1240, storageGb: 22.4, sms: 6100, api: 18900 },
    owner: { name: "Prof. Khalid Zia", designation: "Principal", email: "principal@ziyacollege.edu.pk", phone: "+92 322 7712340", cnicMasked: "35200-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 86400e3 * 25).toISOString(), lastPasswordChange: t(200), sessions: 0 },
    license: { id: "LIC-2025-041", type: "annual", key: "MKZ-E990-ZCC2-T8LP-M4QX", activatedOn: t(390), expiresOn: dayKey(-25), status: "expired" },
    trialDaysLeft: null,
    manager: "Hassan Raza", source: "Direct sales", onboarding: 100, createdAt: t(500), lastActive: new Date(Date.now() - 86400e3 * 25).toISOString(), health: 55,
    addons: [{ id: "gps", name: "GPS Transport Tracking", price: 2500, since: t(300) }],
    notes: "Budget cycle — new session funding expected next month. Recovery email sent; win-back offer prepared.",
    timeline: [
      { date: t(25), text: "License expired — no renewal received", kind: "license" },
      { date: t(31), text: "Renewal reminders sent (30/14/3 days)", kind: "status" },
    ],
    apiUsage7d: [40, 0, 22, 0, 10, 0, 0],
  },
  {
    id: "t-ehsan", code: "ETI-2026", accountNo: "ACC-00026", name: "Ehsan Training Institute", shortName: "ETI", type: "Training Institute",
    status: "pending", planId: null, modules: PLANS[0].modules,
    limits: { users: 10, campuses: 1, students: 200, storageGb: 2, sms: 200 },
    usage: { users: 1, students: 0, storageGb: 0, sms: 0, api: 0 },
    owner: { name: "Mr. Ehsan Ullah", designation: "Director", email: "ehsan@eti.pk", phone: "+92 336 8801234", cnicMasked: "42201-•••••••-•", verified: false, lastLogin: new Date(Date.now() - 86400e3 * 2).toISOString(), lastPasswordChange: t(2), sessions: 0 },
    license: { id: "LIC-2026-105", type: "trial", key: "MKZ-TR14-ETI5-J9QS-P2LM", activatedOn: t(2), expiresOn: dayKey(12), status: "pending" },
    trialDaysLeft: 14,
    manager: "Ayesha Siddiqui", source: "Partner referral", onboarding: 40, createdAt: t(2), lastActive: new Date(Date.now() - 86400e3 * 2).toISOString(), health: 60,
    addons: [],
    notes: "Owner registered; activation link sent. Awaiting first login to start trial clock.",
    timeline: [
      { date: t(2), text: "Tenant created — activation invitation sent", kind: "create" },
    ],
    apiUsage7d: [0, 0, 0, 0, 0, 0, 12],
  },
  {
    id: "t-crescent", code: "CSN-2024", accountNo: "ACC-00002", name: "The Crescent School Network", shortName: "CSN", type: "School Network (4 campuses)",
    status: "active_paid", planId: "permanent", modules: PLANS[3].modules,
    limits: { users: 500, campuses: 25, students: 20000, storageGb: 500, sms: 50000 },
    usage: { users: 142, students: 3810, storageGb: 96, sms: 14200, api: 51200 },
    owner: { name: "Brig (R) Salman Tariq", designation: "CEO", email: "ceo@crescent.edu.pk", phone: "+92 300 1199223", cnicMasked: "35202-•••••••-•", verified: true, lastLogin: new Date(Date.now() - 3600e3 * 30).toISOString(), lastPasswordChange: t(15), sessions: 2 },
    license: { id: "LIC-2024-002", type: "permanent", key: "MKZ-PRM0-CSN1-X7KP-D9QZ", activatedOn: t(560), expiresOn: null, status: "active" },
    trialDaysLeft: null,
    manager: "Hassan Raza", source: "Direct sales — board presentation", onboarding: 100, createdAt: t(600), lastActive: new Date(Date.now() - 3600e3 * 30).toISOString(), health: 98,
    addons: [{ id: "biometric", name: "Biometric Attendance Kit", price: 15000, since: t(200) }, { id: "wa-api", name: "WhatsApp Business API", price: 3500, since: t(150) }, { id: "sms-pack", name: "SMS Pack +1,000", price: 2000, since: t(150) }],
    notes: "Lifetime license paid in full. Expansion to 2 more campuses under discussion — potential add-on revenue.",
    timeline: [
      { date: t(560), text: "Permanent license issued — Rs 4,50,000 paid in full", kind: "payment" },
      { date: t(200), text: "Add-on: Biometric Attendance Kit deployed", kind: "feature" },
      { date: t(90), text: "Campus #4 onboarded — cross-campus reports enabled", kind: "status" },
    ],
    apiUsage7d: [7200, 7600, 7100, 8200, 7900, 6400, 5800],
  },
];

const INVOICES: Invoice[] = [
  { id: "inv1", no: "INV-2026-118", tenantId: "t-dia", period: "Add-ons — WhatsApp + Domain", amount: 5000, status: "paid", method: "Bank Transfer", date: t(12), dueDate: t(-2), items: "WhatsApp Business API, Custom Domain + SSL", paidAmount: 5000 },
  { id: "inv2", no: "INV-2026-114", tenantId: "t-ilm", period: `Monthly — ${monthLabel(monthKey(0))}`, amount: 27000, status: "overdue", method: "—", date: t(16), dueDate: t(6), items: "Professional plan + SMS Pack", paidAmount: 0 },
  { id: "inv3", no: "INV-2026-112", tenantId: "t-falah", period: `Monthly — ${monthLabel(monthKey(-1))}`, amount: 14000, status: "overdue", method: "—", date: t(46), dueDate: t(36), items: "Starter plan", paidAmount: 0 },
  { id: "inv4", no: "INV-2026-109", tenantId: "t-hira", period: "Setup & onboarding fee", amount: 10000, status: "due", method: "—", date: t(25), dueDate: dayKey(-2).slice(0, 10), items: "One-time setup, data migration assistance", paidAmount: 0 },
  { id: "inv5", no: "INV-2025-031", tenantId: "t-dia", period: "Annual subscription 2025–26", amount: 300000, status: "paid", method: "Pay Order", date: t(180), dueDate: t(170), items: "Professional — annual (2 months free)", paidAmount: 300000 },
  { id: "inv6", no: "INV-2024-002", tenantId: "t-crescent", period: "Permanent license + deployment", amount: 450000, status: "paid", method: "Pay Order", date: t(560), dueDate: t(550), items: "Permanent license, on-prem deployment, training", paidAmount: 450000 },
  { id: "inv7", no: "INV-2026-116", tenantId: "t-crescent", period: "Add-ons bundle — quarterly", amount: 20500, status: "paid", method: "Bank Transfer", date: t(30), dueDate: t(20), items: "Biometric AMC, WhatsApp, SMS pack", paidAmount: 20500 },
  { id: "inv8", no: "INV-2026-101", tenantId: "t-ziya", period: "Annual renewal 2025–26", amount: 720000, status: "overdue", method: "—", date: t(55), dueDate: t(25), items: "Enterprise — annual + GPS tracking", paidAmount: 0 },
];

const OWNER_AUDIT: AuditEntry[] = [
  { id: "oa1", time: new Date(Date.now() - 3600e3 * 2).toISOString(), operator: "Hassan Raza", action: "Trial reminder sent", target: "Hira Grammar School", reason: "Auto rule: 7 days remaining", outcome: "success", risk: "normal" },
  { id: "oa2", time: new Date(Date.now() - 3600e3 * 5).toISOString(), operator: "Ayesha Siddiqui", action: "Tenant created", target: "Ehsan Training Institute", reason: "Partner referral", outcome: "success", risk: "normal" },
  { id: "oa3", time: new Date(Date.now() - 3600e3 * 8).toISOString(), operator: "Kashif Niazi", action: "Invoice created", target: "INV-2026-118 → Dar-e-Ilm", reason: "Monthly add-ons", outcome: "success", risk: "normal" },
  { id: "oa4", time: new Date(Date.now() - 86400e3 * 2).toISOString(), operator: "Hassan Raza", action: "Grace period started", target: "Ilm-o-Hikmah School", reason: "Auto rule: payment overdue", outcome: "success", risk: "normal" },
  { id: "oa5", time: new Date(Date.now() - 86400e3 * 4).toISOString(), operator: "System", action: "Impersonation session", target: "Ilm-o-Hikmah School", reason: "Support: challan print issue (read-only)", outcome: "success", risk: "elevated" },
  { id: "oa6", time: new Date(Date.now() - 86400e3 * 6).toISOString(), operator: "System", action: "Access suspended", target: "Falah Public School", reason: "Non-payment after grace period", outcome: "success", risk: "elevated" },
  { id: "oa7", time: new Date(Date.now() - 86400e3 * 7).toISOString(), operator: "Kashif Niazi", action: "Payment recorded", target: "INV-2025-031 → Dar-e-Ilm", reason: "Annual renewal", outcome: "success", risk: "normal" },
  { id: "oa8", time: new Date(Date.now() - 86400e3 * 9).toISOString(), operator: "System", action: "License expired", target: "Ziya College Campus", reason: "No renewal received", outcome: "success", risk: "normal" },
  { id: "oa9", time: new Date(Date.now() - 86400e3 * 11).toISOString(), operator: "Mina Baig", action: "Feature flag updated", target: "flag: biometric_v2", reason: "Rollout 100%", outcome: "success", risk: "normal" },
  { id: "oa10", time: new Date(Date.now() - 86400e3 * 13).toISOString(), operator: "System", action: "Blocked: cross-tenant query", target: "API token 0x88F2", reason: "Tenant isolation policy", outcome: "blocked", risk: "elevated" },
];

const OPERATORS: Operator[] = [
  { id: "op1", name: "Hassan Raza", role: "Super Owner", email: "hassan@markaz.cloud", twoFA: true, status: "active", lastActive: new Date(Date.now() - 3600e3 * 1).toISOString() },
  { id: "op2", name: "Ayesha Siddiqui", role: "Sales Manager", email: "ayesha@markaz.cloud", twoFA: true, status: "active", lastActive: new Date(Date.now() - 3600e3 * 4).toISOString() },
  { id: "op3", name: "Kashif Niazi", role: "Finance Operator", email: "kashif@markaz.cloud", twoFA: true, status: "active", lastActive: new Date(Date.now() - 3600e3 * 6).toISOString() },
  { id: "op4", name: "Mina Baig", role: "Technical Operator", email: "mina@markaz.cloud", twoFA: true, status: "active", lastActive: new Date(Date.now() - 3600e3 * 2).toISOString() },
  { id: "op5", name: "Danish Iqbal", role: "Support Operator", email: "danish@markaz.cloud", twoFA: false, status: "active", lastActive: new Date(Date.now() - 86400e3 * 1).toISOString() },
  { id: "op6", name: "Sana Javed", role: "License Manager", email: "sana@markaz.cloud", twoFA: true, status: "active", lastActive: new Date(Date.now() - 86400e3 * 2).toISOString() },
  { id: "op7", name: "External Auditor", role: "Read-only Auditor", email: "audit@markaz.cloud", twoFA: true, status: "suspended", lastActive: new Date(Date.now() - 86400e3 * 40).toISOString() },
];

const SECURITY_EVENTS: SecurityEvent[] = [
  { id: "se1", time: new Date(Date.now() - 86400e3 * 13).toISOString(), type: "Cross-tenant query blocked", detail: "API token 0x88F2 attempted to query students of another tenant. Request denied and token revoked.", severity: "critical" },
  { id: "se2", time: new Date(Date.now() - 86400e3 * 5).toISOString(), type: "Repeated failed logins", detail: "5 failed attempts on owner account of Falah Public School — account locked for 30 min.", severity: "warn" },
  { id: "se3", time: new Date(Date.now() - 86400e3 * 3).toISOString(), type: "Unusual API usage", detail: "Ziya College token made 4,100 requests/hour before expiry — flagged for review.", severity: "warn" },
  { id: "se4", time: new Date(Date.now() - 86400e3 * 2).toISOString(), type: "Impersonation completed", detail: "Read-only support session on Ilm-o-Hikmah ended normally after 14 min.", severity: "info" },
];

const RELEASES: Release[] = [
  { version: "v2.4.1", date: t(6), notes: ["Fee reminder templates now support Urdu text", "Report card print margins fixed for A4", "Parent portal: quick-switch between children"], rollout: 100, status: "stable" },
  { version: "v2.5.0", date: t(1), notes: ["Biometric attendance v2 (device pairing flow)", "WhatsApp template approval status in Comms center", "Owner panel: license verification endpoint"], rollout: 35, status: "rolling" },
  { version: "v2.6.0-beta", date: dayKey(0), notes: ["Internal: hostel module foundations", "Internal: cash-flow projection widget"], rollout: 0, status: "internal" },
];

const FLAGS: FeatureFlag[] = [
  { key: "biometric_v2", label: "Biometric Attendance v2", desc: "New device pairing + offline queue", enabled: true, rollout: 100 },
  { key: "wa_templates", label: "WhatsApp Template Manager", desc: "In-app template creation & approval tracking", enabled: true, rollout: 60 },
  { key: "cashflow_forecast", label: "Cash-flow Projection (BI)", desc: "30-day collection forecast widget", enabled: false, rollout: 0 },
  { key: "hostel_module", label: "Hostel / Boarding Module", desc: "Internal beta — not customer-facing yet", enabled: false, rollout: 0 },
];

const SERVICES: Service[] = [
  { name: "Core API", status: "operational", uptime: "99.98%", latency: "84 ms" },
  { name: "Tenant Database", status: "operational", uptime: "99.99%", latency: "12 ms" },
  { name: "Notification Queue", status: "operational", uptime: "99.95%", latency: "—" },
  { name: "SMS Gateway (local)", status: "degraded", uptime: "98.20%", latency: "1.2 s" },
  { name: "Email / SMTP", status: "operational", uptime: "99.97%", latency: "—" },
  { name: "Payment Adapters", status: "operational", uptime: "99.90%", latency: "310 ms" },
  { name: "Object Storage", status: "operational", uptime: "100%", latency: "45 ms" },
  { name: "PDF Generator", status: "operational", uptime: "99.92%", latency: "—" },
];

const JOBS: Job[] = [
  { id: "j1", name: "Fee reminder batch (SMS)", tenant: "Falah Public School", status: "failed", error: "Tenant suspended — delivery skipped", time: new Date(Date.now() - 3600e3 * 9).toISOString(), attempts: 3 },
  { id: "j2", name: "Monthly challan generation", tenant: "Ziya College Campus", status: "failed", error: "License expired — generation blocked", time: new Date(Date.now() - 3600e3 * 14).toISOString(), attempts: 2 },
  { id: "j3", name: "Nightly backup (tenant metadata)", tenant: "All tenants", status: "running", error: "", time: new Date(Date.now() - 60e3 * 20).toISOString(), attempts: 1 },
  { id: "j4", name: "WhatsApp template sync", tenant: "The Crescent Network", status: "queued", error: "", time: new Date(Date.now() - 60e3 * 5).toISOString(), attempts: 0 },
];

const BACKUPS: BackupRec[] = [
  { tenantId: "t-dia", lastOk: new Date(Date.now() - 3600e3 * 6).toISOString(), lastFail: null, schedule: "Daily 02:00", sizeMb: 842, status: "ok" },
  { tenantId: "t-crescent", lastOk: new Date(Date.now() - 3600e3 * 6).toISOString(), lastFail: null, schedule: "Daily 02:00 + hourly WAL", sizeMb: 4810, status: "ok" },
  { tenantId: "t-hira", lastOk: new Date(Date.now() - 3600e3 * 7).toISOString(), lastFail: null, schedule: "Daily 02:00", sizeMb: 210, status: "ok" },
  { tenantId: "t-ilm", lastOk: new Date(Date.now() - 86400e3 * 2).toISOString(), lastFail: new Date(Date.now() - 86400e3 * 1).toISOString(), schedule: "Daily 02:00", sizeMb: 960, status: "failed" },
  { tenantId: "t-ziya", lastOk: new Date(Date.now() - 86400e3 * 25).toISOString(), lastFail: null, schedule: "Paused (expired)", sizeMb: 2210, status: "pending" },
];

// ---------- assembled DB ----------
export interface DB {
  students: Student[]; staff: Staff[]; classes: Klass[]; subjects: Subject[];
  vouchers: Voucher[]; attendance: Record<string, Record<string, "P" | "A" | "L">>;
  attMonth: { label: string; value: number }[];
  marks: Record<string, Record<string, Record<string, number | "AB">>>;
  exams: Exam[]; leads: Lead[]; announcements: Announcement[]; notices: Notice[];
  books: Book[]; bookIssues: BookIssue[]; routes: Route[]; inventory: InvItem[];
  events: EventItem[]; leaves: LeaveReq[]; tickets: Ticket[];
  collectionSeries: { label: string; value: number }[]; enrollSeries: { label: string; value: number }[];
  // control plane
  ownerTenants: OwnerTenant[]; plans: Plan[]; invoices: Invoice[]; ownerAudit: AuditEntry[];
  operators: Operator[]; securityEvents: SecurityEvent[]; releases: Release[]; flags: FeatureFlag[];
  services: Service[]; jobs: Job[]; backups: BackupRec[]; supportSessions: SupportSession[];
  maintenanceMode: boolean;
  // school app state
  notifs: { id: string; title: string; body: string; time: string; read: boolean; icon: string; forRole: Role[] }[];
  schoolAudit: { id: string; time: string; user: string; action: string; detail: string }[];
  loginHistory: { user: string; role: string; time: string; device: string; ip: string }[];
  payslipsPaid: string[];
  payrollRun: { month: string; status: "processed" | "draft"; processedOn: string };
}

export function seedDB(): DB {
  const students = seedStudents();
  return {
    students, staff: STAFF, classes: CLASS_LIST, subjects: SUBJECTS_G8,
    vouchers: seedVouchers(students),
    attendance: { [`${dayKey(0)}|g8A`]: Object.fromEntries(students.slice(0, 14).map((s, i) => [s.id, i === 4 ? "A" as const : i === 9 ? "L" as const : "P" as const])) },
    attMonth: ATT_MONTH,
    marks: seedMarks(),
    exams: EXAMS, leads: LEADS, announcements: ANNOUNCEMENTS, notices: NOTICES,
    books: BOOKS, bookIssues: BOOK_ISSUES, routes: ROUTES, inventory: INVENTORY,
    events: EVENTS, leaves: LEAVES, tickets: TICKETS,
    collectionSeries: COLLECTION_SERIES, enrollSeries: ENROLL_SERIES,
    ownerTenants: OWNER_TENANTS, plans: PLANS, invoices: INVOICES, ownerAudit: OWNER_AUDIT,
    operators: OPERATORS, securityEvents: SECURITY_EVENTS, releases: RELEASES, flags: FLAGS,
    services: SERVICES, jobs: JOBS, backups: BACKUPS, supportSessions: [],
    maintenanceMode: false,
    notifs: [
      { id: "nf1", title: "3 challans overdue in 8-A", body: "Rs 13,600 pending — reminders can be sent from the Fees module.", time: new Date(Date.now() - 3600e3 * 2).toISOString(), read: false, icon: "cash", forRole: ["admin"] },
      { id: "nf2", title: "Mid-term result published", body: "Your mid-term report card is now available.", time: new Date(Date.now() - 3600e3 * 20).toISOString(), read: false, icon: "exam", forRole: ["student", "parent"] },
      { id: "nf3", title: "Monthly test marks pending", body: "12 of 14 students entered for Monthly Test — Grade 8-A.", time: new Date(Date.now() - 3600e3 * 5).toISOString(), read: false, icon: "exam", forRole: ["teacher", "admin"] },
      { id: "nf4", title: "Route 3 vehicle document expired", body: "Fitness certificate for LEF-4520 expired 9 days ago.", time: new Date(Date.now() - 3600e3 * 26).toISOString(), read: true, icon: "bus", forRole: ["admin"] },
    ],
    schoolAudit: [
      { id: "sa1", time: new Date(Date.now() - 3600e3 * 4).toISOString(), user: "Kashif Mehmood", action: "Payment posted", detail: "RCP-11842 — Rs 4,800 (Ahmed Khan, 8-A)" },
      { id: "sa2", time: new Date(Date.now() - 3600e3 * 9).toISOString(), user: "Dr. Amina Khalid", action: "Result approved", detail: "Mid-Term Examination — Grade 8 (published)" },
      { id: "sa3", time: new Date(Date.now() - 86400e3 * 1).toISOString(), user: "Shazia Kamran", action: "Inquiry added", detail: "Rayyan Aslam — Grade 6 (walk-in)" },
      { id: "sa4", time: new Date(Date.now() - 86400e3 * 2).toISOString(), user: "Sara Malik", action: "Marks updated", detail: "Monthly Test — Math, 8-A (6 rows)" },
    ],
    loginHistory: [
      { user: "Ch. Muhammad Owais", role: "Admin", time: new Date(Date.now() - 3600e3 * 5).toISOString(), device: "Chrome — Windows", ip: "39.50.21.114" },
      { user: "Sara Malik", role: "Teacher", time: new Date(Date.now() - 3600e3 * 8).toISOString(), device: "Safari — iPhone", ip: "182.176.9.44" },
      { user: "Salman Khan", role: "Parent", time: new Date(Date.now() - 3600e3 * 22).toISOString(), device: "Chrome — Android", ip: "39.50.21.118" },
    ],
    payslipsPaid: ["t1", "t2", "t5", "t9", "t10"],
    payrollRun: { month: monthKey(-1), status: "processed", processedOn: dayKey(-26) },
  };
}

// ---------- login directory ----------
export const ROLE_META: Record<Role, { label: string; desc: string; user: string; pass: string; person: string }> = {
  admin: { label: "Admin / Principal", desc: "Full school control", user: "admin", pass: "admin123", person: "Ch. Muhammad Owais" },
  teacher: { label: "Teacher", desc: "Classes, marks, attendance", user: "teacher", pass: "teach123", person: "Sara Malik" },
  student: { label: "Student", desc: "Timetable, fees, results", user: "student", pass: "stud123", person: "Ahmed Khan" },
  parent: { label: "Parent", desc: "Children, dues, alerts", user: "parent", pass: "parent123", person: "Salman Khan" },
  owner: { label: "Software Owner", desc: "Control plane — tenants & licenses", user: "owner", pass: "markaz-cloud", person: "Hassan Raza" },
};

export const TIMETABLE_PERIODS = ["8:00", "8:40", "9:20", "Break", "10:20", "11:00", "11:40", "Lunch", "1:00"];
export const TIMETABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const TIMETABLE: Record<string, string[]> = {
  Monday: ["math", "eng", "urd", "break", "sci", "isl", "soc", "lunch", "comp"],
  Tuesday: ["eng", "math", "sci", "break", "urd", "comp", "isl", "lunch", "soc"],
  Wednesday: ["sci", "urd", "math", "break", "eng", "soc", "comp", "lunch", "isl"],
  Thursday: ["math", "sci", "eng", "break", "soc", "urd", "isl", "lunch", "comp"],
  Friday: ["urd", "isl", "math", "break", "eng", "sci", "soc", "lunch", "comp"],
};
export const FEE_CATEGORIES = ["Tuition", "Admission", "Annual", "Exam", "Transport", "Lab", "Library", "Activity", "Fine / Late Fee", "Miscellaneous"];
export const LEAD_SOURCES = ["Website", "Facebook Ad", "Walk-in", "Referral — current parent", "Referral — staff", "Banner / Print", "Exhibition"];
