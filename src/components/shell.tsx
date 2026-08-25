import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "../store";
import type { NavId, Role } from "../data/seed";
import { SCHOOL, timeAgo } from "../data/seed";
import { Avatar, Badge, Btn, Drawer, I, SearchInput } from "./ui";

interface NavItem { id: NavId; label: string; icon: string; roles: Role[]; group: string; mod?: string | string[]; }
export const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dash", roles: ["admin", "teacher", "student", "parent"], group: "Overview" },
  { id: "students", label: "Students", icon: "student", roles: ["admin"], group: "People", mod: "students" },
  { id: "attendance", label: "Attendance", icon: "checks", roles: ["admin", "teacher", "student", "parent"], group: "Academics", mod: "attendance" },
  { id: "academics", label: "Timetable & Classes", icon: "cal", roles: ["admin", "teacher", "student"], group: "Academics", mod: "timetable" },
  { id: "exams", label: "Exams & Results", icon: "exam", roles: ["admin", "teacher", "student", "parent"], group: "Academics", mod: "exams" },
  { id: "admissions", label: "Admissions CRM", icon: "admit", roles: ["admin"], group: "Growth", mod: "admissions" },
  { id: "fees", label: "Fees & Finance", icon: "cash", roles: ["admin", "student", "parent"], group: "Finance", mod: "fees" },
  { id: "hr", label: "HR & Payroll", icon: "brief", roles: ["admin", "teacher"], group: "Finance", mod: "hr" },
  { id: "ops", label: "Operations", icon: "box", roles: ["admin"], group: "Operations", mod: ["library", "transport", "inventory"] },
  { id: "comms", label: "Communication", icon: "megaphone", roles: ["admin", "teacher", "student", "parent"], group: "Operations", mod: "notifications" },
  { id: "reports", label: "Reports", icon: "chart", roles: ["admin"], group: "Insights", mod: "reports" },
  { id: "settings", label: "Settings & Branding", icon: "cog", roles: ["admin"], group: "System" },
  { id: "website", label: "Public Website", icon: "globe", roles: ["admin"], group: "System", mod: "public_website" },
  // control plane
  { id: "ownerDash", label: "Control Room", icon: "cpu", roles: ["owner"], group: "Control Plane" },
  { id: "tenants", label: "Schools & Tenants", icon: "building", roles: ["owner"], group: "Control Plane" },
  { id: "licenses", label: "Licenses & Trials", icon: "key", roles: ["owner"], group: "Control Plane" },
  { id: "billing", label: "Plans & Billing", icon: "card", roles: ["owner"], group: "Control Plane" },
  { id: "system", label: "System & Releases", icon: "server", roles: ["owner"], group: "Platform" },
  { id: "security", label: "Audit & Security", icon: "shield", roles: ["owner"], group: "Platform" },
  { id: "support", label: "Support Desk", icon: "life", roles: ["owner"], group: "Platform" },
];

export function Shell({ children }: { children: ReactNode }) {
  const app = useApp();
  const [sideOpen, setSideOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((s) => !s); }
      if (e.key === "Escape") { setSearchOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const role = app.session?.role ?? "admin";
  const isOwner = role === "owner";

  const items = useMemo(() => NAV.filter((n) => {
    if (!n.roles.includes(role)) return false;
    if (isOwner) return true;
    if (!n.mod) return true;
    if (Array.isArray(n.mod)) return n.mod.some((m) => app.moduleEnabled(m));
    return app.moduleEnabled(n.mod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [role, app.db.ownerTenants, isOwner]);

  const groups = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    items.forEach((n) => { (g[n.group] ??= []).push(n); });
    return g;
  }, [items]);

  const notifs = app.db.notifs.filter((n) => n.forRole.includes(role));
  const unread = notifs.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const out: { icon: string; label: string; sub: string; go: () => void }[] = [];
    if (isOwner) {
      app.db.ownerTenants.filter((t) => (t.name + t.code + t.owner.email).toLowerCase().includes(s)).slice(0, 6)
        .forEach((t) => out.push({ icon: "building", label: t.name, sub: `${t.code} · ${t.status.replace("_", " ")}`, go: () => app.go("tenants", { open: t.id }) }));
      return out;
    }
    app.db.students.filter((st) => (st.name + st.admNo + st.guardian).toLowerCase().includes(s)).slice(0, 5)
      .forEach((st) => out.push({ icon: "student", label: st.name, sub: `${st.admNo} · ${st.classId === "g8" ? "Grade 8" : st.classId}-${st.section}`, go: () => app.go("students", { open: st.id }) }));
    app.db.staff.filter((st) => st.name.toLowerCase().includes(s)).slice(0, 3)
      .forEach((st) => out.push({ icon: "brief", label: st.name, sub: `${st.role} · ${st.dept}`, go: () => app.go("hr", { open: st.id }) }));
    const acts = [
      { k: "attendance", l: "Mark today's attendance", i: "checks", id: "attendance" as NavId },
      { k: "new challan", l: "Generate fee challans", i: "cash", id: "fees" as NavId },
      { k: "results", l: "Exam results & marks", i: "exam", id: "exams" as NavId },
      { k: "reports", l: "Open reports center", i: "chart", id: "reports" as NavId },
    ].filter((a) => a.k.includes(s) || a.l.toLowerCase().includes(s)).slice(0, 3);
    acts.forEach((a) => out.push({ icon: a.i, label: a.l, sub: "Quick action", go: () => app.go(a.id) }));
    return out;
  }, [q, app.db, isOwner]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen bg-canvas">
      {/* ============ SIDEBAR ============ */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-night text-canvas transition-transform duration-300 lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-night">
            <I n="student" size={20} />
          </span>
          <div className="min-w-0">
            <p className="display truncate text-[13.5px] font-bold leading-tight text-white">{app.branding.schoolName}</p>
            <p className="text-[10.5px] font-medium tracking-wide text-canvas/50">{isOwner ? "MARKAZ CLOUD · CONTROL PLANE" : "POWERED BY MARKAZ ERP"}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="mb-4">
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-canvas/40">{g}</p>
              {list.map((n) => {
                const active = app.nav.id === n.id;
                return (
                  <button key={n.id} onClick={() => { app.go(n.id); setSideOpen(false); }}
                    className={`focus-ring group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${active ? "bg-white/12 text-white shadow-inner" : "text-canvas/65 hover:bg-white/6 hover:text-white"}`}>
                    <I n={n.icon} size={16} className={active ? "text-accent" : "text-canvas/45 group-hover:text-accent/80"} />
                    {n.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5">
            <Avatar name={app.session?.name ?? ""} size={32} tone="accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-white">{app.session?.name}</p>
              <p className="text-[10.5px] capitalize text-canvas/50">{role} · {isOwner ? "Markaz Cloud" : SCHOOL.code}</p>
            </div>
            <button onClick={app.logout} title="Sign out" className="focus-ring rounded-md p-1.5 text-canvas/50 transition hover:bg-danger/20 hover:text-white"><I n="logout" size={15} /></button>
          </div>
          <p className="mt-2 text-center text-[9.5px] text-canvas/35">Markaz ERP v2.5.0 · {isOwner ? "platform build" : "tenant build"}</p>
        </div>
      </aside>
      {sideOpen && <div className="fixed inset-0 z-30 bg-night/50 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ============ MAIN ============ */}
      <div className="lg:pl-[248px]">
        {app.db.maintenanceMode && (
          <div className="flex items-center justify-center gap-2 bg-warn px-4 py-1.5 text-[11.5px] font-semibold text-white">
            <I n="alert" size={13} /> Maintenance mode is ON — customers see a scheduled-maintenance notice. Toggle it off in System → Health.
          </div>
        )}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
            <button className="focus-ring rounded-md p-1.5 text-sub hover:bg-primarysoft lg:hidden" onClick={() => setSideOpen(true)}><I n="menu" size={18} /></button>
            <button onClick={() => setSearchOpen(true)}
              className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[12.5px] text-sub transition hover:border-primary/40 sm:max-w-sm">
              <I n="search" size={14} /> <span className="truncate">{isOwner ? "Search schools, owners, licenses…" : "Search students, staff, actions…"}</span>
              <kbd className="ml-auto hidden rounded border border-line bg-surface px-1.5 text-[10px] font-semibold text-sub sm:block">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              {isOwner && <Badge tone="accent" className="hidden sm:inline-flex"><I n="cpu" size={11} /> CONTROL PLANE</Badge>}
              <span className="hidden items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[11.5px] font-semibold text-sub md:flex"><I n="cal" size={13} /> {today}</span>
              <button onClick={() => setNotifOpen(true)} className="focus-ring relative rounded-lg border border-line bg-canvas p-2 text-sub transition hover:border-primary/40 hover:text-primarydark">
                <I n="bell" size={15} />
                {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">{unread}</span>}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1240px] p-4 lg:p-6">{children}</main>
      </div>

      {/* ============ GLOBAL SEARCH ============ */}
      {searchOpen && (
        <div className="anim-in fixed inset-0 z-50 flex items-start justify-center bg-night/55 p-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={() => setSearchOpen(false)}>
          <div className="anim-pop w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-line px-4">
              <I n="search" size={16} className="text-sub" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={isOwner ? "Search tenants, codes, owners, licenses…" : "Search students, staff or type an action…"}
                className="w-full bg-transparent py-3.5 text-[14px] text-ink outline-none placeholder:text-sub/60" />
              <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-sub">ESC</kbd>
            </div>
            <div className="max-h-[46vh] overflow-y-auto p-2">
              {q.trim().length < 2 ? (
                <p className="px-3 py-6 text-center text-[12px] text-sub">Type at least 2 characters to search {isOwner ? "the customer base" : "your school"}.</p>
              ) : searchResults.length === 0 ? (
                <p className="px-3 py-6 text-center text-[12px] text-sub">No matches for “{q}”.</p>
              ) : searchResults.map((r, i) => (
                <button key={i} onClick={() => { r.go(); setSearchOpen(false); setQ(""); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-primarysoft/70">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n={r.icon} size={15} /></span>
                  <span><span className="block text-[13px] font-semibold text-ink">{r.label}</span><span className="text-[11px] text-sub">{r.sub}</span></span>
                  <I n="chevR" size={14} className="ml-auto text-sub/60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ NOTIFICATIONS ============ */}
      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notification Center"
        sub={<>Every message is routed through the school's enabled channel adapters.</>}
        footer={<Btn v="subtle" icon="checks" onClick={() => { app.markNotifsRead(); app.toast("All notifications marked as read", "info"); }}>Mark all as read</Btn>}>
        <div className="space-y-2">
          {notifs.length === 0 && <p className="py-8 text-center text-[12.5px] text-sub">No notifications for your role yet.</p>}
          {notifs.map((n) => (
            <div key={n.id} className={`flex gap-3 rounded-lg border p-3 transition ${n.read ? "border-line bg-surface" : "border-primary/25 bg-primarysoft/50"}`}>
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.read ? "bg-line/60 text-sub" : "bg-primary text-white"}`}><I n={n.icon} size={15} /></span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                <p className="text-[12px] leading-relaxed text-sub">{n.body}</p>
                <p className="mt-1 text-[10.5px] font-medium text-sub/70">{timeAgo(n.time)}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
