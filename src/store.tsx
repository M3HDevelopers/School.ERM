import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as S from "./data/seed";

const KEY = "markaz-erp-v3";

export interface Session {
  role: S.Role;
  name: string;
  id: string;
  title: string;
}
export interface Toast {
  id: number;
  msg: string;
  type: "ok" | "info" | "danger";
}
export interface Nav {
  page: string;
  params?: Record<string, string>;
}

export interface AppState {
  session: Session | null;
  nav: Nav;
  students: S.Student[];
  staff: S.Staff[];
  vouchers: S.Voucher[];
  payments: S.Payment[];
  announcements: S.Announcement[];
  leads: S.Lead[];
  exams: S.Exam[];
  books: S.Book[];
  routes: S.Route[];
  items: S.InvItem[];
  events: S.SchoolEvent[];
  payrollRuns: S.PayrollRun[];
  audit: S.AuditEntry[];
  notis: S.Noti[];
  leaves: S.LeaveApp[];
  homework: S.Homework[];
  attendance: Record<string, Record<string, S.AttMark>>;
  marks: Record<string, Record<string, Record<string, number | "AB">>>;
  school: S.SchoolCfg;
  toasts: Toast[];
}

function fresh(): AppState {
  const students = S.seedStudents();
  const { vouchers, payments } = S.seedFees(students);
  return {
    session: null,
    nav: { page: "login" },
    students,
    staff: S.seedStaff(),
    vouchers,
    payments,
    announcements: S.seedAnnouncements(),
    leads: S.seedLeads(),
    exams: S.seedExams(),
    books: S.seedBooks(),
    routes: S.seedRoutes(),
    items: S.seedItems(),
    events: S.seedEvents(),
    payrollRuns: [],
    audit: S.seedAudit(),
    notis: S.seedNotis(),
    leaves: S.seedLeaves(),
    homework: S.seedHomework(),
    attendance: {},
    marks: { "ex-mid|g8A": S.midtermMarks(students) },
    school: { ...S.DEFAULT_SCHOOL },
    toasts: [],
  };
}

const PERSIST: (keyof AppState)[] = [
  "students", "staff", "vouchers", "payments", "announcements", "leads", "books", "routes",
  "items", "events", "payrollRuns", "audit", "notis", "leaves", "homework", "attendance",
  "marks", "school", "session",
];

function init(): AppState {
  const base = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...base, ...saved, toasts: [], nav: saved.session ? { page: "dashboard" } : { page: "login" } };
    }
  } catch {
    /* corrupted storage → fresh */
  }
  return base;
}

export interface Store extends AppState {
  login: (role: S.Role) => void;
  logout: () => void;
  go: (page: string, params?: Record<string, string>) => void;
  toast: (msg: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;
  addStudent: (d: Partial<S.Student>) => S.Student;
  updateStudent: (id: string, patch: Partial<S.Student>, auditAction?: string) => void;
  saveAttendance: (classId: string, section: string, date: string, marks: Record<string, S.AttMark>) => { absent: number; total: number };
  generateChallans: (classId: string, section: string, month: string) => number;
  postPayment: (voucherId: string, amount: number, method: S.Payment["method"]) => S.Payment;
  cancelVoucher: (voucherId: string) => void;
  sendAnnouncement: (a: { title: string; body: string; audience: string; channels: string[] }) => void;
  addLead: (l: { name: string; classApplied: string; phone: string; source: S.Lead["source"]; note?: string }) => void;
  moveLead: (id: string, stage: S.Stage) => void;
  runPayroll: (month: string) => S.PayrollRun;
  markSlipPaid: (runId: string, slipId: string) => void;
  toggleBook: (bookId: string) => void;
  returnBook: (bookId: string) => void;
  stockMove: (itemId: string, delta: number) => void;
  addEvent: (e: { title: string; date: string; type: S.SchoolEvent["type"]; audience: string }) => void;
  leaveDecision: (id: string, ok: boolean) => void;
  toggleHomework: (id: string) => void;
  saveMarks: (key: string, m: Record<string, Record<string, number | "AB">>) => void;
  setTheme: (id: string) => void;
  saveSchool: (patch: Partial<S.SchoolCfg>) => void;
  markNotisRead: () => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);
export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("store missing");
  return c;
};

export const balanceOf = (v: S.Voucher) => Math.max(0, v.total + v.lateFee - v.paid);
export const studentById = (list: S.Student[], id: string) => list.find((s) => s.id === id);
export const staffById = (list: S.Staff[], id: string) => list.find((s) => s.id === id);

export function applyTheme(id: string) {
  const t = S.THEMES.find((x) => x.id === id) ?? S.THEMES[0];
  const r = document.documentElement.style;
  r.setProperty("--color-primary", t.primary);
  r.setProperty("--color-primarydeep", t.primarydeep);
  r.setProperty("--color-primarysoft", t.primarysoft);
  r.setProperty("--color-accent", t.accent);
  r.setProperty("--color-accentsoft", t.accentsoft);
  r.setProperty("--color-side", t.side);
  r.setProperty("--color-sideline", t.sideline);
}

export function downloadCSV(name: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name.endsWith(".csv") ? name : `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function printNow() {
  document.body.classList.add("printing");
  const cleanup = () => document.body.classList.remove("printing");
  window.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(() => window.print(), 60);
  setTimeout(cleanup, 3000);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<AppState>(init);
  const tid = useRef(1);

  useEffect(() => {
    applyTheme(st.school.themeId);
  }, [st.school.themeId]);

  useEffect(() => {
    const slim: Record<string, unknown> = {};
    PERSIST.forEach((k) => (slim[k] = st[k]));
    try {
      localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      /* storage full — ignore in demo */
    }
  }, [st]);

  const toast = (msg: string, type: Toast["type"] = "ok") => {
    const id = tid.current++;
    setSt((s) => ({ ...s, toasts: [...s.toasts, { id, msg, type }] }));
    window.setTimeout(() => setSt((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })), 4200);
  };

  const audit = (s: AppState, action: string, module: string, detail: string): AppState => ({
    ...s,
    audit: [
      { id: `au-${Date.now()}`, ts: new Date().toISOString().slice(0, 16), user: s.session?.name ?? "System", action, module, detail },
      ...s.audit,
    ],
  });

  const store: Store = {
    ...st,
    toast,
    dismissToast: (id) => setSt((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })),
    login: (role) => {
      const c = S.CREDENTIALS[role];
      setSt((s) => ({ ...s, session: { role, name: c.name, id: role, title: c.title }, nav: { page: "dashboard" } }));
      toast(`Assalam-o-Alaikum, ${c.name.split(" ")[0]} — signed in as ${c.title}`, "ok");
    },
    logout: () => setSt((s) => ({ ...s, session: null, nav: { page: "login" } })),
    go: (page, params) => setSt((s) => ({ ...s, nav: { page, params } })),

    addStudent: (d) => {
      const nextNum = 2100 + st.students.length + Math.round(Math.random() * 5);
      const mates = st.students.filter((x) => x.classId === d.classId && x.section === d.section);
      const rec: S.Student = {
        id: `st-${Date.now()}`,
        admNo: `DIA-${nextNum}`,
        name: d.name ?? "New Student",
        gender: d.gender ?? "M",
        dob: d.dob ?? "2014-01-01",
        classId: d.classId ?? "g8",
        section: d.section ?? "A",
        roll: mates.length + 1,
        house: S.HOUSES[mates.length % 4],
        guardianName: d.guardianName ?? "—",
        relation: d.relation ?? "Father",
        phone: d.phone ?? "—",
        address: d.address ?? "Lahore",
        blood: d.blood ?? "B+",
        status: "active",
        admissionDate: S.todayISO(),
        feePlan: S.planFor(d.classId ?? "g8").label,
        attendancePct: 100,
        docs: ["Photos (2)", "B-Form copy"],
      };
      setSt((s) => audit({ ...s, students: [rec, ...s.students] }, "Student admitted", "Students", `${rec.name} (${rec.admNo}) → ${S.className(rec.classId)}-${rec.section}`));
      toast(`${rec.name} admitted · ${rec.admNo} · Roll ${rec.roll}`);
      return rec;
    },
    updateStudent: (id, patch, auditAction) =>
      setSt((s) => {
        const rec = s.students.find((x) => x.id === id);
        const next = { ...s, students: s.students.map((x) => (x.id === id ? { ...x, ...patch } : x)) };
        if (auditAction && rec)
          return audit(next, auditAction, "Students", `${rec.name} (${rec.admNo}) → ${Object.values(patch).join(", ")}`);
        return next;
      }),

    saveAttendance: (classId, section, date, marks) => {
      const absent = Object.values(marks).filter((m) => m !== "P").length;
      setSt((s) => {
        const next = { ...s, attendance: { ...s.attendance, [`${date}|${classId}${section}`]: marks } };
        const n = audit(next, "Attendance saved", "Attendance", `${S.className(classId)}-${section} · ${Object.keys(marks).length - absent} present, ${absent} absent/late`);
        return {
          ...n,
          notis: [{ id: `nt-${Date.now()}`, text: `Attendance saved ${S.className(classId)}-${section} · ${absent} absence alert(s) sent to parents`, channel: absent > 0 ? "wa" as const : "app" as const, ts: new Date().toISOString().slice(0, 16), read: false }, ...n.notis],
        };
      });
      return { absent, total: Object.keys(marks).length };
    },

    generateChallans: (classId, section, month) => {
      const targets = st.students.filter((x) => x.classId === classId && x.section === section && x.status === "active");
      let made = 0;
      const created: S.Voucher[] = [];
      targets.forEach((stu) => {
        if (st.vouchers.some((v) => v.studentId === stu.id && v.month === month)) return;
        const plan = S.planFor(classId);
        const items = [
          { label: "Tuition fee", amount: plan.tuition },
          { label: "Lab & activity", amount: 300 },
        ];
        created.push({
          id: `v-${stu.id}-${month}`,
          no: `CH-${month.slice(2).replace("-", "")}-${stu.admNo.slice(4)}`,
          studentId: stu.id,
          month,
          items,
          total: items.reduce((a, b) => a + b.amount, 0),
          lateFee: 0,
          paid: 0,
          status: "generated",
          due: `${month}-10`,
        });
        made++;
      });
      if (made > 0)
        setSt((s) =>
          audit({ ...s, vouchers: [...created, ...s.vouchers] }, "Challan batch generated", "Finance", `${S.className(classId)}-${section} · ${S.monthLabel(month)} · ${made} challans`)
        );
      return made;
    },

    postPayment: (voucherId, amount, method) => {
      const maxNo = st.payments.reduce((m, p) => Math.max(m, parseInt(p.receiptNo.slice(4), 10) || 0), 1000);
      const rec: S.Payment = {
        id: `p-${Date.now()}`,
        receiptNo: `RCP-${maxNo + 1}`,
        voucherId,
        studentId: st.vouchers.find((v) => v.id === voucherId)?.studentId ?? "",
        amount,
        method,
        date: S.todayISO(),
        cashier: st.session?.name ?? "Cashier",
      };
      setSt((s) => {
        const vouchers = s.vouchers.map((v) => {
          if (v.id !== voucherId) return v;
          const paid = v.paid + amount;
          const due = v.total + v.lateFee;
          return { ...v, paid, status: paid >= due ? ("paid" as const) : ("partial" as const), receiptNo: paid >= due ? rec.receiptNo : v.receiptNo };
        });
        const stu = s.students.find((x) => x.id === rec.studentId);
        return audit({ ...s, vouchers, payments: [rec, ...s.payments] }, "Payment posted", "Finance", `${rec.receiptNo} · Rs ${amount.toLocaleString()} · ${stu?.name ?? rec.studentId} (${method})`);
      });
      return rec;
    },

    cancelVoucher: (voucherId) =>
      setSt((s) => {
        const v = s.vouchers.find((x) => x.id === voucherId);
        const next = { ...s, vouchers: s.vouchers.map((x) => (x.id === voucherId ? { ...x, status: "waived" as const } : x)) };
        return v ? audit(next, "Challan waived", "Finance", `${v.no} waived by ${s.session?.name}`) : next;
      }),

    sendAnnouncement: ({ title, body, audience, channels }) => {
      const size = audience.includes("All parents") ? 486 : audience.includes("Teachers") ? 42 : audience.includes("Whole school") ? 1240 : 96;
      const rec: S.Announcement = {
        id: `an-${Date.now()}`,
        title,
        body,
        audience,
        channels,
        ts: new Date().toISOString().slice(0, 16),
        stats: { sent: size, delivered: Math.round(size * 0.97), read: 0 },
      };
      setSt((s) => audit({ ...s, announcements: [rec, ...s.announcements] }, "Announcement sent", "Communication", `${title} · ${size} recipients · ${channels.join("+")}`));
      toast(`Announcement queued to ${size} recipients via ${channels.join(", ").toUpperCase()}`);
    },

    addLead: ({ name, classApplied, phone, source, note }) =>
      setSt((s) => ({
        ...s,
        leads: [{ id: `ld-${Date.now()}`, name, classApplied, phone, source, stage: "inquiry" as const, ts: S.todayISO(), note }, ...s.leads],
      })),

    moveLead: (id, stage) => {
      const lead = st.leads.find((l) => l.id === id);
      if (!lead) return;
      setSt((s) => {
        let next: AppState = { ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) };
        if (stage === "enrolled") {
          const classId = "g" + (parseInt(lead.classApplied.replace(/\D/g, ""), 10) || 1);
          const stu: S.Student = {
            id: `st-${Date.now()}`,
            admNo: `DIA-${2100 + s.students.length + 1}`,
            name: lead.name,
            gender: "M",
            dob: "2015-01-01",
            classId,
            section: "A",
            roll: s.students.filter((x) => x.classId === classId).length + 1,
            house: S.HOUSES[s.students.length % 4],
            guardianName: "—",
            relation: "Father",
            phone: lead.phone,
            address: "Lahore",
            blood: "—",
            status: "active",
            admissionDate: S.todayISO(),
            feePlan: S.planFor(classId).label,
            attendancePct: 100,
            docs: ["Application form"],
          };
          next = { ...next, students: [stu, ...next.students] };
          next = audit(next, "Lead enrolled", "Admissions", `${lead.name} → student ${stu.admNo} (${S.className(classId)}-A)`);
        }
        return next;
      });
      if (stage === "enrolled") toast(`${lead.name} enrolled — student record created automatically`);
    },

    runPayroll: (month) => {
      const slips: S.Slip[] = st.staff
        .filter((e) => e.status !== "left")
        .map((e, i) => ({
          id: `sl-${month}-${e.id}`,
          staffId: e.id,
          basic: e.salary,
          allowance: e.allowance,
          deduction: Math.round(e.salary * 0.01) + (i % 5 === 0 ? Math.round(e.salary / 26) : 0),
          net: 0,
          status: "unpaid" as const,
        }))
        .map((sl) => ({ ...sl, net: sl.basic + sl.allowance - sl.deduction }));
      const run: S.PayrollRun = { id: `run-${month}`, month, ts: new Date().toISOString().slice(0, 16), slips };
      setSt((s) =>
        audit({ ...s, payrollRuns: [run, ...s.payrollRuns] }, "Payroll run created", "HR", `${S.monthLabel(month)} · ${slips.length} employees · Rs ${Math.round(slips.reduce((a, b) => a + b.net, 0) / 100000)}L`)
      );
      return run;
    },
    markSlipPaid: (runId, slipId) =>
      setSt((s) => ({
        ...s,
        payrollRuns: s.payrollRuns.map((r) =>
          r.id === runId ? { ...r, slips: r.slips.map((sl) => (sl.id === slipId ? { ...sl, status: "paid" as const, paidOn: S.todayISO() } : sl)) } : r
        ),
      })),

    toggleBook: (bookId) =>
      setSt((s) => ({ ...s, books: s.books.map((b) => (b.id === bookId && b.issued < b.copies ? { ...b, issued: b.issued + 1 } : b)) })),
    returnBook: (bookId) =>
      setSt((s) => ({ ...s, books: s.books.map((b) => (b.id === bookId && b.issued > 0 ? { ...b, issued: b.issued - 1 } : b)) })),
    stockMove: (itemId, delta) =>
      setSt((s) => ({ ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, stock: Math.max(0, it.stock + delta) } : it)) })),
    addEvent: ({ title, date, type, audience }) =>
      setSt((s) => ({ ...s, events: [{ id: `ev-${Date.now()}`, title, date, type, audience }, ...s.events] })),
    leaveDecision: (id, ok) =>
      setSt((s) => ({ ...s, leaves: s.leaves.map((l) => (l.id === id ? { ...l, status: ok ? ("approved" as const) : ("rejected" as const) } : l)) })),
    toggleHomework: (id) =>
      setSt((s) => ({ ...s, homework: s.homework.map((h) => (h.id === id ? { ...h, done: !h.done } : h)) })),
    saveMarks: (key, m) => {
      setSt((s) => audit({ ...s, marks: { ...s.marks, [key]: m } }, "Marks saved", "Exams", `Mark entry · ${key.replace("|", " · ")}`));
      toast("Marks saved — result will compute automatically");
    },
    setTheme: (id) => setSt((s) => ({ ...s, school: { ...s.school, themeId: id } })),
    saveSchool: (patch) => {
      setSt((s) => ({ ...s, school: { ...s.school, ...patch } }));
      toast("School profile saved — applied across portals & print templates");
    },
    markNotisRead: () => setSt((s) => ({ ...s, notis: s.notis.map((n) => ({ ...n, read: true })) })),
    resetDemo: () => {
      localStorage.removeItem(KEY);
      window.location.reload();
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
