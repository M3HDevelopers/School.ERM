/* ============================================================
   Markaz ERP — data model + demo seed (Dar-e-Ilm Academy)
   Deterministic seed so demos look identical on every load.
   ============================================================ */

export type Role = "admin" | "teacher" | "student" | "parent" | "owner";
export type AttMark = "P" | "A" | "L";
export type VoucherStatus = "paid" | "partial" | "overdue" | "generated" | "waived";
export type Stage = "inquiry" | "application" | "test" | "offer" | "enrolled";

export interface Student {
  id: string;
  admNo: string;
  name: string;
  gender: "M" | "F";
  dob: string;
  classId: string;
  section: string;
  roll: number;
  house: string;
  guardianName: string;
  relation: string;
  phone: string;
  address: string;
  blood: string;
  status: "active" | "suspended" | "transferred" | "withdrawn";
  admissionDate: string;
  feePlan: string;
  attendancePct: number;
  docs: string[];
}
export interface Staff {
  id: string;
  empNo: string;
  name: string;
  gender: "M" | "F";
  dept: string;
  designation: string;
  subjects: string[];
  classes: string[];
  phone: string;
  joined: string;
  salary: number;
  allowance: number;
  status: "active" | "on-leave" | "left";
  leaveC: number;
  leaveA: number;
  bank: string;
}
export interface Voucher {
  id: string;
  no: string;
  studentId: string;
  month: string;
  items: { label: string; amount: number }[];
  total: number;
  lateFee: number;
  paid: number;
  status: VoucherStatus;
  due: string;
  receiptNo?: string;
}
export interface Payment {
  id: string;
  receiptNo: string;
  voucherId: string;
  studentId: string;
  amount: number;
  method: "cash" | "bank" | "online";
  date: string;
  cashier: string;
}
export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  channels: string[];
  ts: string;
  stats: { sent: number; delivered: number; read: number };
}
export interface Lead {
  id: string;
  name: string;
  classApplied: string;
  phone: string;
  source: "walk-in" | "facebook" | "website" | "referral" | "whatsapp";
  stage: Stage;
  ts: string;
  note?: string;
}
export interface Exam {
  id: string;
  name: string;
  term: string;
  status: "draft" | "entry" | "review" | "published";
  window: string;
}
export interface Book {
  id: string;
  title: string;
  author: string;
  cat: string;
  copies: number;
  issued: number;
  rack: string;
}
export interface Route {
  id: string;
  name: string;
  vehicle: string;
  reg: string;
  driver: string;
  attendant: string;
  stops: string[];
  capacity: number;
  assigned: number;
  fee: number;
  docExpiry: string;
}
export interface InvItem {
  id: string;
  name: string;
  cat: string;
  unit: string;
  stock: number;
  reorder: number;
  price: number;
}
export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "holiday" | "event" | "meeting" | "sports";
  audience: string;
}
export interface Slip {
  id: string;
  staffId: string;
  basic: number;
  allowance: number;
  deduction: number;
  net: number;
  status: "paid" | "unpaid";
  paidOn?: string;
}
export interface PayrollRun {
  id: string;
  month: string;
  ts: string;
  slips: Slip[];
}
export interface AuditEntry {
  id: string;
  ts: string;
  user: string;
  action: string;
  module: string;
  detail: string;
}
export interface Noti {
  id: string;
  text: string;
  channel: "sms" | "email" | "app" | "wa";
  ts: string;
  read: boolean;
}
export interface LeaveApp {
  id: string;
  staffId: string;
  type: "casual" | "sick" | "annual";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}
export interface Homework {
  id: string;
  classId: string;
  section: string;
  subject: string;
  title: string;
  due: string;
  done: boolean;
}
export interface SchoolCfg {
  name: string;
  short: string;
  tagline: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  session: string;
  themeId: string;
  portalTitle: string;
}

/* ---------------- helpers ---------------- */
export const NOW = new Date();
export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export const monthKey = (offset: number) => {
  const d = new Date(NOW.getFullYear(), NOW.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
};
export const monthShort = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "short" });
};
export const todayISO = () => NOW.toISOString().slice(0, 10);
export const dateISO = (offsetDays: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
export const fmtRs = (n: number) => `Rs ${Math.round(n).toLocaleString("en-US")}`;
export const fmtLakh = (n: number) =>
  n >= 100000 ? `Rs ${(n / 100000).toFixed(1)}L` : `Rs ${(n / 1000).toFixed(0)}k`;
export const fmtDate = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
export const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((NOW.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export const gradeFor = (pct: number) => {
  if (pct >= 85) return { g: "A+", pts: 4.0, tone: "ok" as const };
  if (pct >= 75) return { g: "A", pts: 4.0, tone: "ok" as const };
  if (pct >= 65) return { g: "B", pts: 3.0, tone: "info" as const };
  if (pct >= 50) return { g: "C", pts: 2.0, tone: "warn" as const };
  if (pct >= 40) return { g: "D", pts: 1.0, tone: "warn" as const };
  return { g: "F", pts: 0, tone: "danger" as const };
};

/* deterministic pseudo-random 0..1 */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------------- branding themes (white-label) ---------------- */
export interface Theme {
  id: string;
  label: string;
  primary: string;
  primarydeep: string;
  primarysoft: string;
  accent: string;
  accentsoft: string;
  side: string;
  sideline: string;
}
export const THEMES: Theme[] = [
  { id: "emerald", label: "Dar-e-Ilm Green", primary: "#0e6b4e", primarydeep: "#0a4a37", primarysoft: "#e1efe7", accent: "#e8a226", accentsoft: "#fbf0d9", side: "#0c241b", sideline: "#1c3a2e" },
  { id: "royal", label: "Royal Navy", primary: "#1e4e7c", primarydeep: "#163c60", primarysoft: "#e2eaf2", accent: "#dd8e2e", accentsoft: "#faedd9", side: "#101f2f", sideline: "#22384d" },
  { id: "crimson", label: "Crimson Crest", primary: "#8e2f3c", primarydeep: "#6e2430", primarysoft: "#f3e4e5", accent: "#d89b3d", accentsoft: "#f9eed8", side: "#281114", sideline: "#452026" },
  { id: "teal", label: "Indus Teal", primary: "#0f6e7e", primarydeep: "#0b5260", primarysoft: "#dff0f2", accent: "#e0952f", accentsoft: "#faedd8", side: "#0a2226", sideline: "#17414a" },
];

export const IMG = {
  campus: "https://image.qwenlm.ai/generated-images/eb0be731-a990-486f-85e2-b5fa62f18f2f/_result.png",
  principal: "https://image.qwenlm.ai/generated-images/a515b7a5-5031-4f43-9e43-0d2c55d3f637/_result.png",
};

export const DEFAULT_SCHOOL: SchoolCfg = {
  name: "Dar-e-Ilm Academy",
  short: "DIA",
  tagline: "Knowledge · Character · Excellence",
  code: "DIA-2026",
  phone: "+92 42 3571 8890",
  email: "info@dareilm.edu.pk",
  address: "47-B Model Town, Lahore",
  session: "2025–26",
  themeId: "emerald",
  portalTitle: "Markaz ERP",
};

export const CREDENTIALS: Record<Role, { u: string; p: string; name: string; title: string }> = {
  admin: { u: "principal", p: "admin123", name: "Dr. Kamran Siddiqui", title: "Principal / Owner" },
  teacher: { u: "saima.akhtar", p: "teach123", name: "Saima Akhtar", title: "Class Teacher · 8-A" },
  student: { u: "ahmed.raza", p: "stud123", name: "Ahmed Raza", title: "Grade 8-A · Roll 1" },
  parent: { u: "m.raza", p: "parent123", name: "Muhammad Raza", title: "Parent of 2" },
  owner: { u: "super.owner", p: "markaz-ops", name: "Hassan Raza", title: "Super Owner · Markaz Cloud" },
};

/* ---------------- academic structure ---------------- */
export const CLASSES = [
  { id: "g1", name: "Grade 1" }, { id: "g2", name: "Grade 2" }, { id: "g3", name: "Grade 3" },
  { id: "g4", name: "Grade 4" }, { id: "g5", name: "Grade 5" }, { id: "g6", name: "Grade 6" },
  { id: "g7", name: "Grade 7" }, { id: "g8", name: "Grade 8" }, { id: "g9", name: "Grade 9" },
  { id: "g10", name: "Grade 10" },
];
export const SECTIONS = ["A", "B"];
export const HOUSES = ["Iqbal", "Jinnah", "Liaquat", "Fatima"];
export const className = (id: string) => CLASSES.find((c) => c.id === id)?.name ?? id;

export const SUBJECTS = [
  { id: "eng", name: "English", code: "ENG", teacher: "Saima Akhtar", color: "#0e6b4e" },
  { id: "urd", name: "Urdu", code: "URD", teacher: "Nadia Hussain", color: "#8e5a2f" },
  { id: "mat", name: "Mathematics", code: "MAT", teacher: "Tariq Mehmood", color: "#1e4e7c" },
  { id: "sci", name: "Science", code: "SCI", teacher: "Dr. Farah Zia", color: "#0f6e7e" },
  { id: "isl", name: "Islamiat", code: "ISL", teacher: "Hafiz Imran", color: "#5b5ea6" },
  { id: "soc", name: "Social Studies", code: "SST", teacher: "Adeel Shah", color: "#8e2f3c" },
  { id: "com", name: "Computer", code: "COM", teacher: "Bilal Anwar", color: "#414855" },
  { id: "art", name: "Art & Drawing", code: "ART", teacher: "Sana Miraj", color: "#a3660a" },
];
export const subjectOf = (id: string) => SUBJECTS.find((s) => s.id === id)!;

export const PERIODS = [
  { label: "P1", time: "8:00 – 8:40" },
  { label: "P2", time: "8:40 – 9:20" },
  { label: "P3", time: "9:20 – 10:00" },
  { label: "P4", time: "10:30 – 11:10" },
  { label: "P5", time: "11:10 – 11:50" },
  { label: "P6", time: "11:50 – 12:30" },
  { label: "P7", time: "12:30 – 1:10" },
];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/* Grade 8-A master timetable [day][period] */
export const TIMETABLE: string[][] = [
  ["mat", "eng", "sci", "urd", "isl", "com", "soc"],
  ["eng", "mat", "urd", "sci", "com", "art", "isl"],
  ["sci", "mat", "eng", "soc", "urd", "mat", "com"],
  ["urd", "sci", "mat", "eng", "soc", "isl", "art"],
  ["mat", "com", "eng", "sci", "urd", "art", "soc"],
  ["isl", "mat", "eng", "urd", "soc", "sci", "art"],
];

export const FEE_PLANS = [
  { id: "junior", label: "Junior (Gr 1–5)", tuition: 3200 },
  { id: "middle", label: "Middle (Gr 6–8)", tuition: 4200 },
  { id: "senior", label: "Senior (Gr 9–10)", tuition: 5200 },
];
export const planFor = (classId: string) => {
  const n = parseInt(classId.slice(1), 10);
  return FEE_PLANS.find((p) => (n <= 5 ? p.id === "junior" : n <= 8 ? p.id === "middle" : p.id === "senior"))!;
};

/* ---------------- students ---------------- */
const S_NAMES: [string, "M" | "F"][] = [
  ["Ahmed Raza", "M"], ["Fatima Zahra", "F"], ["Bilal Hussain", "M"], ["Ayesha Khan", "F"],
  ["Hamza Sheikh", "M"], ["Zainab Ali", "F"], ["Usman Ghani", "M"], ["Maryam Aslam", "F"],
  ["Ali Haider", "M"], ["Khadija Noor", "F"], ["Abdullah Malik", "M"], ["Hira Shahid", "F"],
  ["Umar Farooq", "M"], ["Amna Tariq", "F"],
  ["Noor Fatima", "F"], ["Danish Kaleem", "M"], ["Rabia Aslam", "F"], ["Taha Siddiqui", "M"],
  ["Mehak Shahbaz", "F"], ["Ibrahim Qureshi", "M"], ["Iqra Yousaf", "F"], ["Saad Qureshi", "M"],
  ["Laiba Kamran", "F"], ["Fahad Mustafa", "M"], ["Zoya Anwar", "F"], ["Dua Khalid", "F"],
];
const S_CLASS = ["g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A", "g8A",
  "g5A", "g3B", "g6B", "g7A", "g9B", "g10A", "g4A", "g2B", "g9A", "g10B", "g6A", "g1A"];
const S_GUARDIAN = ["Muhammad Raza", "Syed Kamran", "Naveed Hussain", "Imran Khan", "Anwar Sheikh", "Asif Ali",
  "Abdul Ghani", "Salman Aslam", "Haider Abbas", "Shahid Noor", "Tariq Malik", "Javed Shahid",
  "Farooq Ahmed", "Nasim Tariq", "Muhammad Raza", "Kaleem Ullah", "Salman Aslam", "Naveed Siddiqui",
  "Shahbaz Ahmed", "Zafar Qureshi", "Yousaf Kamal", "Zafar Qureshi", "Kamran Akmal", "Mustafa Khan",
  "Naveed Anwar", "Rashid Khalid"];
const AREAS = ["Model Town", "Gulberg III", "Johar Town", "DHA Phase 5", "Garden Town", "Faisal Town",
  "Ichhra", "Samanabad", "Cavalry Ground", "Askari 10"];

export function seedStudents(): Student[] {
  return S_NAMES.map(([name, gender], i) => {
    const [classId, section] = [S_CLASS[i].slice(0, 2), S_CLASS[i].slice(2)];
    const is8A = classId === "g8";
    return {
      id: `st-${100 + i}`,
      admNo: `DIA-${2100 + i}`,
      name,
      gender,
      dob: `${2012 - parseInt(classId.slice(1), 10) + 8}-${String((i % 12) + 1).padStart(2, "0")}-${String((i * 3) % 27 + 1).padStart(2, "0")}`,
      classId,
      section,
      roll: is8A ? i + 1 : (i % 20) + 1,
      house: HOUSES[i % 4],
      guardianName: S_GUARDIAN[i],
      relation: i % 6 === 5 ? "Mother" : "Father",
      phone: `+92 3${(i % 5) === 0 ? "0" : ["21", "33", "45", "12"][i % 4]}-${String(2410000 + i * 13579).slice(0, 7)}`,
      address: `${14 + i}-B, ${AREAS[i % AREAS.length]}, Lahore`,
      blood: ["B+", "O+", "A+", "AB+", "O-"][i % 5],
      status: i === 17 ? "suspended" : i === 23 ? "transferred" : "active",
      admissionDate: `${2019 + (i % 6)}-04-${String((i % 26) + 2).padStart(2, "0")}`,
      feePlan: planFor(classId).label,
      attendancePct: clamp(82 + Math.round(rnd(i + 3) * 17) - (i % 9 === 4 ? 9 : 0), 68, 99),
      docs: ["Photos (2)", "B-Form copy", i % 3 === 0 ? "Birth certificate" : "Previous report card"],
    };
  });
}

/* portal demo identities */
export const DEMO_STUDENT = "st-100"; /* Ahmed Raza — Grade 8-A, Roll 1 */
export const PARENT_CHILDREN = ["st-100", "st-114"]; /* Muhammad Raza's children */

/* ---------------- staff ---------------- */
const STAFF_ROWS: [string, "M" | "F", string, string, string[], string[], number, number][] = [
  ["Dr. Kamran Siddiqui", "M", "Administration", "Principal", [], [], 250000, 40000],
  ["Nusrat Jahan", "F", "Accounts", "Senior Accountant", [], [], 95000, 12000],
  ["Salman Butt", "M", "Accounts", "Cashier", [], [], 55000, 8000],
  ["Asma Jalil", "F", "Administration", "Admin Officer", [], [], 70000, 10000],
  ["Rashid Minhas", "M", "Operations", "Inventory Incharge", [], [], 48000, 7000],
  ["Tariq Mehmood", "M", "Academics", "Senior Teacher — Mathematics", ["mat"], ["Grade 8-A", "Grade 9-A"], 88000, 12000],
  ["Nadia Hussain", "F", "Academics", "Teacher — Urdu", ["urd"], ["Grade 7-A", "Grade 8-A"], 72000, 10000],
  ["Dr. Farah Zia", "F", "Academics", "Teacher — Science", ["sci"], ["Grade 8-A", "Grade 9-B"], 90000, 12000],
  ["Hafiz Imran", "M", "Academics", "Teacher — Islamiat", ["isl"], ["Grade 6-A", "Grade 8-A"], 60000, 8000],
  ["Saima Akhtar", "F", "Academics", "Class Teacher 8-A · English", ["eng"], ["Grade 8-A", "Grade 9-A"], 85000, 12000],
  ["Adeel Shah", "M", "Academics", "Teacher — Social Studies", ["soc"], ["Grade 8-A", "Grade 10-A"], 68000, 9000],
  ["Bilal Anwar", "M", "Academics", "Computer Lab Incharge", ["com"], ["Grade 5-A", "Grade 8-A"], 65000, 9000],
  ["Sana Miraj", "F", "Academics", "Art Teacher", ["art"], ["Grade 1-A", "Grade 6-B"], 52000, 7000],
  ["Shabana Perveen", "F", "Academics", "Primary Wing Head", ["eng"], ["Grade 1-A", "Grade 3-B"], 92000, 12000],
  ["Akram Pervez", "M", "Transport", "Driver — Route 1", [], [], 42000, 5000],
  ["Riaz Ahmed", "M", "Transport", "Driver — Route 2", [], [], 42000, 5000],
  ["Manzoor Hussain", "M", "Transport", "Driver — Route 3", [], [], 42000, 5000],
  ["Kausar Bibi", "F", "Support", "Library Assistant", [], [], 38000, 5000],
  ["Javed Iqbal", "M", "Support", "Office Assistant", [], [], 35000, 5000],
  ["Shazia Nawaz", "F", "Academics", "Coordinator — Middle School", ["sci"], ["Grade 6-B", "Grade 7-A"], 105000, 14000],
];

export function seedStaff(): Staff[] {
  return STAFF_ROWS.map(([name, gender, dept, designation, subjects, classes, salary, allowance], i) => ({
    id: `sf-${i + 1}`,
    empNo: `EMP-${201 + i}`,
    name,
    gender,
    dept,
    designation,
    subjects,
    classes,
    phone: `+92 3${["00", "21", "33", "45"][i % 4]}-${String(3110000 + i * 41777).slice(0, 7)}`,
    joined: `${2015 + (i % 9)}-0${(i % 8) + 1}-1${i % 9}`,
    salary,
    allowance,
    status: i === 13 ? "on-leave" : i === 18 ? "left" : "active",
    leaveC: 4 + (i % 8),
    leaveA: 2 + (i % 7),
    bank: ["Meezan Bank", "HBL", "UBL", "Allied Bank"][i % 4],
  }));
}

/* ---------------- fees ---------------- */
export function seedFees(students: Student[]): { vouchers: Voucher[]; payments: Payment[] } {
  const vouchers: Voucher[] = [];
  const payments: Payment[] = [];
  let rc = 1030;
  [-2, -1, 0].forEach((off) => {
    const month = monthKey(off);
    students.forEach((st, si) => {
      if (st.status !== "active") return;
      const plan = planFor(st.classId);
      const items = [
        { label: "Tuition fee", amount: plan.tuition },
        { label: "Lab & activity", amount: 300 },
      ];
      const total = items.reduce((a, b) => a + b.amount, 0);
      const lateFee = off < 0 && si % 7 === 3 ? 200 : off === 0 && st.attendancePct < 75 ? 0 : 0;
      let status: VoucherStatus;
      let paid = 0;
      if (off === 0) {
        status = si % 3 === 0 ? "paid" : si % 3 === 1 ? "generated" : "partial";
        paid = status === "paid" ? total : status === "partial" ? Math.round(total / 2) : 0;
      } else {
        status = si % 9 === 4 ? "overdue" : si % 11 === 5 ? "partial" : "paid";
        paid = status === "paid" ? total + lateFee : status === "partial" ? Math.round((total + lateFee) * 0.6) : 0;
      }
      const no = `CH-${month.slice(2).replace("-", "")}-${st.admNo.slice(4)}`;
      const v: Voucher = {
        id: `v-${st.id}-${month}`,
        no,
        studentId: st.id,
        month,
        items,
        total,
        lateFee,
        paid,
        status,
        due: `${month}-10`,
      };
      if (paid > 0) {
        const receiptNo = `RCP-${rc++}`;
        if (status === "paid") v.receiptNo = receiptNo;
        payments.push({
          id: `p-${st.id}-${month}`,
          receiptNo,
          voucherId: v.id,
          studentId: st.id,
          amount: paid,
          method: (["cash", "bank", "online"] as const)[si % 3],
          date: dateISO(off * 28 + (si % 8) - 2),
          cashier: ["Salman Butt", "Nusrat Jahan", "Rashid Minhas"][si % 3],
        });
      }
      vouchers.push(v);
    });
  });
  return { vouchers, payments: payments.reverse() };
}

/* ---------------- attendance ---------------- */
export function seedAttendanceHistory(): { monthDays: { d: string; pct: number }[]; byClass: { label: string; pct: number }[] } {
  const days: { d: string; pct: number }[] = [];
  for (let i = 19; i >= 0; i--) {
    const dt = new Date(NOW);
    dt.setDate(dt.getDate() - i);
    if (dt.getDay() === 0) continue;
    days.push({ d: `${dt.getDate()}`, pct: 84 + Math.round(rnd(i + 11) * 13) });
  }
  const byClass = CLASSES.map((c, i) => ({ label: c.name.replace("Grade ", "Gr "), pct: 85 + Math.round(rnd(i + 31) * 12) }));
  return { monthDays: days, byClass };
}

/* ---------------- exams & marks ---------------- */
export function seedExams(): Exam[] {
  return [
    { id: "ex-mid", name: "Mid-Term Examination", term: "Term 1 · Session 2025–26", status: "published", window: "10 – 21 Nov 2025" },
    { id: "ex-mon", name: "Monthly Test", term: "Term 2 · Session 2025–26", status: "entry", window: "3 – 7 Feb 2026" },
  ];
}
const MARK_SUBJECTS = ["eng", "urd", "mat", "sci", "isl", "soc"];
export function midtermMarks(students: Student[]): Record<string, Record<string, number | "AB">> {
  const out: Record<string, Record<string, number | "AB">> = {};
  students.filter((s) => s.classId === "g8" && s.section === "A").forEach((s, si) => {
    const row: Record<string, number | "AB"> = {};
    MARK_SUBJECTS.forEach((sub, sj) => {
      if (si === 5 && sj === 2) row[sub] = "AB";
      else row[sub] = clamp(38 + Math.round(rnd(si * 7 + sj * 13 + 2) * 58), 28, 98);
    });
    out[s.id] = row;
  });
  return out;
}

/* ---------------- admissions ---------------- */
export function seedLeads(): Lead[] {
  const rows: [string, string, Lead["source"], Stage, number][] = [
    ["Zaynab Tariq", "Grade 1", "walk-in", "inquiry", 1],
    ["Haris Ahmed", "Grade 6", "facebook", "inquiry", 2],
    ["Minahil Shah", "Grade 3", "website", "inquiry", 0],
    ["Abdul Rehman", "Grade 9", "referral", "application", 4],
    ["Eman Yousaf", "Grade 1", "whatsapp", "application", 3],
    ["Hassan Nawaz", "Grade 8", "website", "application", 6],
    ["Areeba Kamran", "Grade 5", "facebook", "test", 8],
    ["Shehzad Ali", "Grade 10", "referral", "test", 9],
    ["Noor ul Huda", "Grade 2", "walk-in", "offer", 12],
    ["Daniyal Akram", "Grade 7", "website", "enrolled", 18],
    ["Hafsa Imran", "Grade 4", "referral", "enrolled", 21],
  ];
  return rows.map(([name, classApplied, source, stage, days], i) => ({
    id: `ld-${i + 1}`,
    name: name as string,
    classApplied: classApplied as string,
    phone: `+92 3${["00", "21", "33", "45"][i % 4]}-${String(4010000 + i * 53211).slice(0, 7)}`,
    source: source as Lead["source"],
    stage: stage as Stage,
    ts: dateISO(-(days as number)),
  }));
}
export const LEAD_STAGES: { id: Stage; label: string }[] = [
  { id: "inquiry", label: "New Inquiry" },
  { id: "application", label: "Application" },
  { id: "test", label: "Test / Interview" },
  { id: "offer", label: "Offer Sent" },
  { id: "enrolled", label: "Enrolled" },
];

/* ---------------- library / transport / inventory ---------------- */
export function seedBooks(): Book[] {
  const rows: [string, string, string, number, number][] = [
    ["Matric Physics", "Punjab Textbook Board", "Science", 40, 12],
    ["Alif Baa'e Reader", "CTSP", "Urdu", 60, 8],
    ["New Countdown 8", "OUP", "Mathematics", 35, 15],
    ["Oxford English 5", "OUP", "English", 48, 6],
    ["Islamiyat Lazmi", "PTB", "Islamiat", 55, 4],
    ["Pakistan Studies", "PTB", "Social", 42, 9],
    ["Harry Potter & the Sorcerer's Stone", "J.K. Rowling", "Fiction", 12, 11],
    ["Peer-e-Kamil", "Umera Ahmed", "Fiction", 10, 7],
    ["Concise Biology 9", "Bashir Chaudhry", "Science", 28, 5],
    ["Computer Science 8", "PTB", "Computer", 30, 3],
    ["Atlas of Pakistan", "Survey of Pakistan", "Reference", 18, 2],
    ["Oxford Junior Dictionary", "OUP", "Reference", 15, 1],
  ];
  return rows.map(([title, author, cat, copies, issued], i) => ({
    id: `bk-${i + 1}`, title: title as string, author: author as string, cat: cat as string,
    copies: copies as number, issued: issued as number, rack: `${String.fromCharCode(65 + (i % 5))}-${(i % 4) + 1}`,
  }));
}
export function seedRoutes(): Route[] {
  return [
    { id: "rt-1", name: "Route 1 · Model Town", vehicle: "Coaster 29-seater", reg: "LEB-4821", driver: "Akram Pervez", attendant: "Shabana Bibi", stops: ["Model Town", "Faisal Town", "Garden Town"], capacity: 29, assigned: 26, fee: 800, docExpiry: dateISO(18) },
    { id: "rt-2", name: "Route 2 · Gulberg", vehicle: "Hiace 15-seater", reg: "LEA-2210", driver: "Riaz Ahmed", attendant: "—", stops: ["Gulberg III", "Gulberg V", "Cavalry Ground"], capacity: 15, assigned: 11, fee: 800, docExpiry: dateISO(74) },
    { id: "rt-3", name: "Route 3 · Johar Town", vehicle: "Coaster 29-seater", reg: "LEC-7714", driver: "Manzoor Hussain", attendant: "Aslam Pervaiz", stops: ["Johar Town", "Wapda Town", "Ichhra"], capacity: 29, assigned: 29, fee: 700, docExpiry: dateISO(140) },
    { id: "rt-4", name: "Route 4 · DHA", vehicle: "Hiace 15-seater", reg: "LED-0917", driver: "Sarwar Shah", attendant: "—", stops: ["DHA Phase 5", "Askari 10", "Cantt"], capacity: 15, assigned: 7, fee: 900, docExpiry: dateISO(-6) },
  ];
}
export function seedItems(): InvItem[] {
  return [
    { id: "it-1", name: "A4 Copy (500 sheets)", cat: "Stationery", unit: "ream", stock: 42, reorder: 20, price: 650 },
    { id: "it-2", name: "Whiteboard marker (black)", cat: "Stationery", unit: "pc", stock: 8, reorder: 24, price: 90 },
    { id: "it-3", name: "Chalk (white, box)", cat: "Stationery", unit: "box", stock: 60, reorder: 30, price: 120 },
    { id: "it-4", name: "Science lab glass beaker 250ml", cat: "Lab", unit: "pc", stock: 14, reorder: 10, price: 350 },
    { id: "it-5", name: "Printer toner HP-105A", cat: "IT", unit: "pc", stock: 3, reorder: 4, price: 14500 },
    { id: "it-6", name: "Student chair (steel)", cat: "Furniture", unit: "pc", stock: 220, reorder: 40, price: 2100 },
    { id: "it-7", name: "Football (size 4)", cat: "Sports", unit: "pc", stock: 6, reorder: 8, price: 950 },
    { id: "it-8", name: "First-aid kit refill", cat: "Medical", unit: "kit", stock: 9, reorder: 5, price: 1800 },
    { id: "it-9", name: "Generator diesel", cat: "Utility", unit: "ltr", stock: 110, reorder: 60, price: 290 },
    { id: "it-10", name: "LED panel 40W", cat: "Electrical", unit: "pc", stock: 5, reorder: 12, price: 1650 },
  ];
}

/* ---------------- events / announcements / misc ---------------- */
export function seedEvents(): SchoolEvent[] {
  return [
    { id: "ev-1", title: "Monthly Test — Grade 6 to 10", date: dateISO(2), type: "exam", audience: "Academics" },
    { id: "ev-2", title: "Parent–Teacher Meeting (Gr 8)", date: dateISO(5), type: "meeting", audience: "Parents · Grade 8" },
    { id: "ev-3", title: "Iqbal Day Assembly", date: dateISO(8), type: "event", audience: "Whole school" },
    { id: "ev-4", title: "Inter-house Cricket Final", date: dateISO(11), type: "sports", audience: "Houses · Senior" },
    { id: "ev-5", title: "Mid-term result publication", date: dateISO(-4), type: "exam", audience: "Portal · All" },
    { id: "ev-6", title: "Winter break begins", date: dateISO(24), type: "holiday", audience: "Whole school" },
    { id: "ev-7", title: "Science Fair — Grade 7 & 8", date: dateISO(15), type: "event", audience: "Middle school" },
  ];
}
export function seedAnnouncements(): Announcement[] {
  return [
    { id: "an-1", title: "Fee submission deadline", body: "November challans are due by the 10th. Late fee of Rs 200 applies after the due date. Pay at the office or via bank challan.", audience: "All parents", channels: ["app", "sms", "wa"], ts: dateISO(-1) + "T09:12", stats: { sent: 486, delivered: 471, read: 322 } },
    { id: "an-2", title: "Parent–Teacher Meeting · Grade 8", body: "PTM for Grade 8 will be held this Saturday, 9:00 am – 12:30 pm in respective classrooms. Report cards will be shared.", audience: "Parents · Grade 8", channels: ["app", "sms"], ts: dateISO(-2) + "T14:40", stats: { sent: 96, delivered: 93, read: 71 } },
    { id: "an-3", title: "Staff meeting — result finalisation", body: "All class teachers must complete mark entry for the Monthly Test before Friday. Coordinator will review on Saturday.", audience: "Teachers only", channels: ["app", "email"], ts: dateISO(-3) + "T11:05", stats: { sent: 42, delivered: 42, read: 39 } },
    { id: "an-4", title: "Iqbal Day assembly", body: "Special assembly on Iqbal Day at 8:00 am in the main hall. Students to wear complete uniform with house badges.", audience: "Whole school", channels: ["app"], ts: dateISO(-5) + "T08:20", stats: { sent: 1240, delivered: 1188, read: 934 } },
  ];
}
export function seedNotis(): Noti[] {
  return [
    { id: "nt-1", text: "12 challans are overdue for Grade 8 — reminder batch queued", channel: "sms", ts: dateISO(0) + "T08:30", read: false },
    { id: "nt-2", text: "Attendance saved for 9-A · 2 absence alerts sent", channel: "wa", ts: dateISO(0) + "T08:12", read: false },
    { id: "nt-3", text: "Receipt RCP-1042 printed by Salman Butt", channel: "app", ts: dateISO(-1) + "T15:44", read: false },
    { id: "nt-4", text: "Route 4 vehicle documents expired 6 days ago", channel: "app", ts: dateISO(-1) + "T09:00", read: true },
    { id: "nt-5", text: "Monthly Test mark entry 62% complete", channel: "app", ts: dateISO(-2) + "T17:20", read: true },
    { id: "nt-6", text: "New admission inquiry from website — Haris Ahmed (Gr 6)", channel: "email", ts: dateISO(-2) + "T10:15", read: true },
  ];
}
export function seedAudit(): AuditEntry[] {
  return [
    { id: "au-1", ts: dateISO(0) + "T08:31", user: "Salman Butt", action: "Payment posted", module: "Finance", detail: "RCP-1042 · Rs 5,300 · Ahmed Raza (DIA-2100)" },
    { id: "au-2", ts: dateISO(0) + "T08:12", user: "Saima Akhtar", action: "Attendance saved", module: "Attendance", detail: "Grade 9-A · 38 present, 2 absent" },
    { id: "au-3", ts: dateISO(-1) + "T16:02", user: "Dr. Kamran Siddiqui", action: "Result published", module: "Exams", detail: "Mid-Term · Grade 8 · 62 students" },
    { id: "au-4", ts: dateISO(-1) + "T12:47", user: "Nusrat Jahan", action: "Payroll approved", module: "HR", detail: monthLabel(monthKey(-1)) + " · 48 employees · Rs 31.4L" },
    { id: "au-5", ts: dateISO(-2) + "T10:15", user: "System", action: "Challan batch generated", module: "Finance", detail: monthLabel(monthKey(0)) + " · 486 challans" },
    { id: "au-6", ts: dateISO(-2) + "T09:40", user: "Asma Jalil", action: "Student status changed", module: "Students", detail: "Taha Siddiqui (DIA-2117) → suspended" },
    { id: "au-7", ts: dateISO(-3) + "T14:22", user: "Rashid Minhas", action: "Stock issued", module: "Inventory", detail: "2 reams A4 copy → Admin office" },
    { id: "au-8", ts: dateISO(-4) + "T11:10", user: "Dr. Kamran Siddiqui", action: "Announcement sent", module: "Communication", detail: "Iqbal Day assembly · 1,240 recipients" },
  ];
}
export function seedLeaves(): LeaveApp[] {
  return [
    { id: "lv-1", staffId: "sf-17", type: "sick", from: dateISO(1), to: dateISO(2), days: 2, reason: "Fever, doctor advised rest", status: "pending" },
    { id: "lv-2", staffId: "sf-12", type: "casual", from: dateISO(6), to: dateISO(6), days: 1, reason: "Family function in Multan", status: "pending" },
    { id: "lv-3", staffId: "sf-11", type: "annual", from: dateISO(-6), to: dateISO(-2), days: 5, reason: "Annual leave", status: "approved" },
    { id: "lv-4", staffId: "sf-13", type: "casual", from: dateISO(-12), to: dateISO(-12), days: 1, reason: "Bank work", status: "rejected" },
  ];
}
export function seedHomework(): Homework[] {
  return [
    { id: "hw-1", classId: "g8", section: "A", subject: "mat", title: "Exercise 6.2 — Q1 to Q10 (quadratic equations)", due: dateISO(1), done: false },
    { id: "hw-2", classId: "g8", section: "A", subject: "eng", title: "Essay: 'A visit to a historical place' (250 words)", due: dateISO(2), done: false },
    { id: "hw-3", classId: "g8", section: "A", subject: "sci", title: "Lab report — reflection of light experiment", due: dateISO(-1), done: true },
    { id: "hw-4", classId: "g8", section: "A", subject: "urd", title: "Nazm 'Lab Pe Aati Hai' — translation in Urdu", due: dateISO(3), done: false },
    { id: "hw-5", classId: "g8", section: "A", subject: "com", title: "Create a folder structure worksheet (page 34)", due: dateISO(-2), done: true },
  ];
}

/* ---------------- dashboard chart data ---------------- */
export function collectionSeries(): { label: string; value: number; target: number }[] {
  const base = [12.9, 14.1, 13.6, 15.2, 16.4, 9.8];
  return base.map((v, i) => ({
    label: monthShort(monthKey(i - 5)),
    value: Math.round(v * 100000),
    target: 1550000,
  }));
}
export function expenseSeries(): { label: string; value: number }[] {
  return [
    { label: "Salaries", value: 3140000 },
    { label: "Utilities", value: 386000 },
    { label: "Transport", value: 214000 },
    { label: "Supplies", value: 128000 },
    { label: "Maintenance", value: 96000 },
  ];
}
export const ENROLL_BY_CLASS = [
  { label: "Gr 1", v: 64 }, { label: "Gr 2", v: 58 }, { label: "Gr 3", v: 61 }, { label: "Gr 4", v: 55 },
  { label: "Gr 5", v: 66 }, { label: "Gr 6", v: 72 }, { label: "Gr 7", v: 69 }, { label: "Gr 8", v: 74 },
  { label: "Gr 9", v: 58 }, { label: "Gr 10", v: 49 },
];
export const LEAD_SOURCES = [
  { label: "Website", value: 34, color: "#0e6b4e" },
  { label: "Facebook", value: 26, color: "#1e4e7c" },
  { label: "Referral", value: 21, color: "#e8a226" },
  { label: "Walk-in", value: 12, color: "#8e2f3c" },
  { label: "WhatsApp", value: 7, color: "#0f6e7e" },
];
export const ENROLL_TREND = [518, 526, 531, 539, 548, 552, 560, 566, 574, 580, 588, 594];

export const NOTICEBOARD = [
  { title: "Admissions open — Session 2026–27", body: "Entry test every Saturday, 10 am. Bring B-Form copy and previous report card.", date: dateISO(-2) },
  { title: "Winter timing from 1 December", body: "School hours 8:30 am to 1:30 pm. Assembly at 8:15 am sharp.", date: dateISO(-9) },
  { title: "Naazra competition results", body: "Winners announced in morning assembly. Congratulations to House Iqbal.", date: dateISO(-14) },
];
