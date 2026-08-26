import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Drawer, I } from "./ui";

/* ---------------- navigation model ---------------- */
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}
const NAV: Record<S.Role, { group: string; items: NavItem[] }[]> = {
  admin: [
    { group: "Overview", items: [{ id: "dashboard", label: "Executive Dashboard", icon: "grid" }] },
    { group: "People", items: [{ id: "students", label: "Students", icon: "users" }, { id: "admissions", label: "Admissions CRM", icon: "cap" }] },
    { group: "Academics", items: [{ id: "attendance", label: "Attendance", icon: "check" }, { id: "exams", label: "Exams & Results", icon: "doc" }, { id: "timetable", label: "Timetable", icon: "clock" }] },
    { group: "Finance", items: [{ id: "fees", label: "Fees & Collection", icon: "cash" }, { id: "hr", label: "HR & Payroll", icon: "wallet" }] },
    { group: "Operations", items: [{ id: "operations", label: "Library · Transport · Stock", icon: "building" }, { id: "comms", label: "Communication", icon: "send" }] },
    { group: "Insights", items: [{ id: "reports", label: "Reports & Analytics", icon: "chart" }] },
    { group: "System", items: [{ id: "settings", label: "Settings & Branding", icon: "gear" }] },
  ],
  teacher: [
    { group: "My Day", items: [{ id: "dashboard", label: "Teacher Dashboard", icon: "grid" }] },
    { group: "Academics", items: [{ id: "students", label: "My Classes", icon: "users" }, { id: "attendance", label: "Mark Attendance", icon: "check" }, { id: "exams", label: "Marks Entry", icon: "doc" }, { id: "timetable", label: "Timetable", icon: "clock" }] },
    { group: "School", items: [{ id: "comms", label: "Announcements", icon: "send" }] },
  ],
  student: [
    { group: "My School", items: [{ id: "dashboard", label: "My Dashboard", icon: "grid" }, { id: "timetable", label: "Timetable", icon: "clock" }, { id: "attendance", label: "My Attendance", icon: "check" }] },
    { group: "Money & Marks", items: [{ id: "fees", label: "Fee Challans", icon: "cash" }, { id: "exams", label: "Results", icon: "doc" }] },
  ],
  parent: [
    { group: "Family", items: [{ id: "dashboard", label: "Parent Dashboard", icon: "grid" }, { id: "fees", label: "Fees & Receipts", icon: "cash" }, { id: "attendance", label: "Attendance", icon: "check" }, { id: "exams", label: "Results", icon: "doc" }] },
    { group: "School", items: [{ id: "comms", label: "Announcements", icon: "send" }] },
  ],
  owner: [],
};
const LABELS: Record<string, string> = {
  dashboard: "Dashboard", students: "Students", admissions: "Admissions", attendance: "Attendance",
  exams: "Exams & Results", timetable: "Timetable", fees: "Fees", hr: "HR & Payroll",
  operations: "Operations", comms: "Communication", reports: "Reports", settings: "Settings",
};

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-accent text-side shadow-sm" style={{ width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 21V12a7 7 0 0 1 14 0v9h-3.4v-8.6a3.6 3.6 0 0 0-7.2 0V21z" />
      </svg>
    </span>
  );
}

/* ---------------- global search ---------------- */
function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => ref.current?.focus(), 60);
    }
  }, [open]);
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return { students: [], staff: [] as S.Staff[] };
    return {
      students: app.students.filter((s) => s.name.toLowerCase().includes(t) || s.admNo.toLowerCase().includes(t) || s.guardianName.toLowerCase().includes(t)).slice(0, 6),
      staff: app.staff.filter((s) => s.name.toLowerCase().includes(t) || s.empNo.toLowerCase().includes(t)).slice(0, 4),
    };
  }, [q, app.students, app.staff]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/45 p-4 pt-[12vh] anim-fade" onMouseDown={onClose}>
      <div className="mx-auto max-w-xl anim-pop overflow-hidden rounded-xl border border-line bg-card shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-linesoft px-4">
          <I n="search" className="text-sub" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students, admission no, guardian, staff…"
            className="w-full bg-transparent py-3.5 text-[14px] outline-none placeholder:text-sub/60" />
          <kbd className="rounded border border-line bg-linesoft px-1.5 py-0.5 text-[10px] font-semibold text-sub">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q && (
            <div className="p-3 text-center text-[12.5px] text-sub">
              Try <span className="num rounded bg-linesoft px-1.5 py-0.5 font-semibold">DIA-2104</span> or a name like <span className="rounded bg-linesoft px-1.5 py-0.5 font-semibold">Fatima</span>
            </div>
          )}
          {res.students.length > 0 && <div className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-sub">Students</div>}
          {res.students.map((s) => (
            <button key={s.id} onClick={() => { app.go("students", { open: s.id }); onClose(); }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-primarysoft">
              <Avatar name={s.name} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">{s.name}</span>
                <span className="block text-[11px] text-sub">{S.className(s.classId)}-{s.section} · Guardian: {s.guardianName}</span>
              </span>
              <span className="num text-[11px] text-sub">{s.admNo}</span>
            </button>
          ))}
          {res.staff.length > 0 && <div className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-sub">Staff</div>}
          {res.staff.map((s) => (
            <button key={s.id} onClick={() => { app.go("hr", { open: s.id }); onClose(); }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-primarysoft">
              <Avatar name={s.name} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">{s.name}</span>
                <span className="block text-[11px] text-sub">{s.designation}</span>
              </span>
              <span className="num text-[11px] text-sub">{s.empNo}</span>
            </button>
          ))}
          {q && res.students.length === 0 && res.staff.length === 0 && (
            <div className="p-4 text-center text-[12.5px] text-sub">No matches for “{q}”.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- shell ---------------- */
export function AppShell({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notisOpen, setNotisOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const page = app.nav.page;
  const role = app.session?.role ?? "admin";
  const groups = NAV[role];
  const unread = app.notis.filter((n) => !n.read).length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.querySelector("#main-scroll")?.scrollTo(0, 0);
    setMobileNav(false);
  }, [page, app.nav.params]);

  const sidebar = (
    <aside className="flex h-full w-[232px] flex-col border-r border-sideline bg-side text-sidetext">
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        <Logo />
        <div className="min-w-0">
          <div className="truncate font-display text-[14px] font-extrabold leading-tight text-white">{app.school.name}</div>
          <div className="text-[10.5px] font-medium tracking-wide text-sidetext/80">Session {app.school.session}</div>
        </div>
      </div>
      <div className="mx-4 mb-3 flex items-center justify-between rounded-md border border-sideline bg-white/5 px-2.5 py-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-widest text-accent">{app.school.portalTitle}</span>
        <span className="num text-[10px] text-sidetext/70">v2.1</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        {groups.map((g) => (
          <div key={g.group} className="mt-3">
            <div className="px-2 pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-sidetext/55">{g.group}</div>
            {g.items.map((it) => {
              const active = page === it.id;
              return (
                <button key={it.id} onClick={() => app.go(it.id)}
                  className={`group relative mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[12.5px] font-semibold transition-all ${active ? "bg-white/10 text-white" : "text-sidetext hover:bg-white/5 hover:text-white"}`}>
                  {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-accent" />}
                  <I n={it.icon} size={16} className={active ? "text-accent" : "text-sidetext/70 group-hover:text-sidetext"} />
                  <span className="truncate">{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sideline p-3">
        <div className="flex items-center gap-2.5 rounded-md bg-white/5 px-2.5 py-2">
          <Avatar name={app.session?.name ?? "U"} size={30} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-bold text-white">{app.session?.name}</div>
            <div className="truncate text-[10.5px] text-sidetext/80">{app.session?.title}</div>
          </div>
          <button onClick={app.logout} title="Sign out" className="rounded-md p-1.5 text-sidetext/70 transition hover:bg-white/10 hover:text-white">
            <I n="logout" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <div className="hidden lg:block">{sidebar}</div>
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden" onMouseDown={() => setMobileNav(false)}>
          <div className="absolute inset-0 bg-ink/50 anim-fade" />
          <div className="absolute left-0 top-0 h-full anim-slideL" onMouseDown={(e) => e.stopPropagation()}>{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[54px] shrink-0 items-center gap-3 border-b border-line bg-card px-4">
          <button className="rounded-md p-1.5 text-sub hover:bg-linesoft lg:hidden" onClick={() => setMobileNav(true)}><I n="menu" /></button>
          <div className="hidden items-center gap-1.5 text-[12.5px] text-sub sm:flex">
            <span className="font-semibold text-primarydeep">{app.school.short}</span>
            <I n="chevR" size={12} />
            <span className="font-semibold text-ink">{LABELS[page] ?? page}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-1.5 text-[12px] text-sub transition hover:border-primary/40 hover:text-ink">
              <I n="search" size={14} />
              <span className="hidden md:inline">Search students, staff…</span>
              <kbd className="hidden rounded border border-line bg-card px-1.5 text-[10px] font-bold md:inline">⌘K</kbd>
            </button>
            <Badge tone="primary" dot>{app.school.code}</Badge>
            <button onClick={() => setNotisOpen(true)} className="relative rounded-md p-2 text-sub transition hover:bg-linesoft hover:text-ink" title="Notifications">
              <I n="bell" size={17} />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white">{unread}</span>}
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-linesoft">
                <Avatar name={app.session?.name ?? "U"} size={30} />
                <I n="chevD" size={13} className="text-sub" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-[110%] z-40 w-52 anim-pop rounded-lg border border-line bg-card p-1.5 shadow-xl">
                    <div className="border-b border-linesoft px-2.5 pb-2 pt-1">
                      <div className="text-[13px] font-bold text-ink">{app.session?.name}</div>
                      <div className="text-[11px] text-sub">{app.session?.title}</div>
                    </div>
                    <button onClick={() => { setMenuOpen(false); app.go("settings"); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-medium text-ink hover:bg-linesoft"><I n="gear" size={14} /> Preferences</button>
                    <button onClick={() => { setMenuOpen(false); app.go("site"); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-medium text-ink hover:bg-linesoft"><I n="home" size={14} /> Public website</button>
                    <button onClick={app.logout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-semibold text-danger hover:bg-dangersoft"><I n="logout" size={14} /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main id="main-scroll" className="flex-1 overflow-y-auto">
          <div key={page + JSON.stringify(app.nav.params ?? {})} className="anim-rise mx-auto max-w-[1240px] px-4 py-5 sm:px-6">{children}</div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Drawer open={notisOpen} onClose={() => setNotisOpen(false)} title={<span className="flex items-center gap-2">Notification Center {unread > 0 && <Badge tone="danger">{unread} unread</Badge>}</span>} w="max-w-md">
        <div className="mb-3 flex justify-end">
          <Btn v="outline" sz="sm" icon="check" onClick={app.markNotisRead}>Mark all read</Btn>
        </div>
        <div className="space-y-2">
          {app.notis.map((n) => (
            <div key={n.id} className={`flex gap-3 rounded-lg border p-3 transition ${n.read ? "border-linesoft bg-card" : "border-line bg-primarysoft/50"}`}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card text-primarydeep shadow-sm ring-1 ring-line">
                <I n={n.channel === "wa" ? "wa" : n.channel === "sms" ? "sms" : n.channel === "email" ? "mail" : "app"} size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium leading-snug text-ink">{n.text}</p>
                <p className="num mt-0.5 text-[10.5px] text-sub">{S.timeAgo(n.ts)} · via {n.channel.toUpperCase()}</p>
              </div>
              {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent pulse-dot" />}
            </div>
          ))}
        </div>
      </Drawer>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(380px,90vw)] flex-col gap-2">
        {app.toasts.map((t) => (
          <div key={t.id} className={`anim-toast pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-card p-3 shadow-xl ${t.type === "danger" ? "border-danger/40" : "border-line"}`}>
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.type === "ok" ? "bg-oksoft text-ok" : t.type === "danger" ? "bg-dangersoft text-danger" : "bg-infosoft text-info"}`}>
              <I n={t.type === "danger" ? "alert" : t.type === "info" ? "bell" : "check"} size={13} />
            </span>
            <p className="flex-1 text-[12.5px] font-medium leading-snug text-ink">{t.msg}</p>
            <button onClick={() => app.dismissToast(t.id)} className="text-sub hover:text-ink"><I n="x" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
