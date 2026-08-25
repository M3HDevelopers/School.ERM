import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "../store";
import type { NavId } from "../data/seed";
import { timeAgo } from "../data/seed";
import { Avatar, Drawer, I } from "./ui";

interface NavItem { id: NavId; label: string; icon: string; group: string; }
const NAV: NavItem[] = [
  { id: "ownerDash", label: "Control Room", icon: "cpu", group: "Command" },
  { id: "tenants", label: "Schools & Tenants", icon: "building", group: "Command" },
  { id: "licenses", label: "Licenses & Trials", icon: "key", group: "Commercial" },
  { id: "billing", label: "Plans & Billing", icon: "card", group: "Commercial" },
  { id: "system", label: "System & Releases", icon: "server", group: "Platform" },
  { id: "security", label: "Audit & Security", icon: "shield", group: "Platform" },
  { id: "support", label: "Support Desk", icon: "life", group: "Customers" },
];

const TITLES: Record<string, string> = {
  ownerDash: "Control Room", tenants: "Schools & Tenants", licenses: "Licenses & Trials",
  billing: "Plans & Billing", system: "System & Releases", security: "Audit & Security", support: "Support Desk",
};

export function Shell({ children }: { children: ReactNode }) {
  const app = useApp();
  const [sideOpen, setSideOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((s) => !s); }
      if (e.key === "Escape") { setSearchOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const groups = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    NAV.forEach((n) => { (g[n.group] ??= []).push(n); });
    return g;
  }, []);

  const notifs = app.db.notifs.filter((n) => n.forRole.includes("owner"));
  const unread = notifs.filter((n) => !n.read).length;

  const activeSession = app.db.supportSessions.find((s) => s.active);
  const sessionLeft = activeSession ? Math.max(0, Math.floor((activeSession.expiresAt - Date.now()) / 1000)) : 0;
  const mm = String(Math.floor(sessionLeft / 60)).padStart(2, "0");
  const ss = String(sessionLeft % 60).padStart(2, "0");

  const searchResults = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const out: { icon: string; label: string; sub: string; go: () => void }[] = [];
    app.db.ownerTenants
      .filter((t) => (t.name + t.code + t.accountNo + t.license.key + t.license.id + t.owner.email + t.owner.name).toLowerCase().includes(s))
      .slice(0, 6)
      .forEach((t) => out.push({ icon: "building", label: t.name, sub: `${t.code} · ${t.license.id} · ${t.status.replace("_", " ")}`, go: () => app.go("tenants", { open: t.id }) }));
    app.db.invoices.filter((i) => (i.no + i.items).toLowerCase().includes(s)).slice(0, 3)
      .forEach((i) => out.push({ icon: "card", label: i.no, sub: `${i.items} · Rs ${i.amount.toLocaleString()} · ${i.status}`, go: () => app.go("billing") }));
    app.db.tickets.filter((t) => (t.no + t.subject + t.from).toLowerCase().includes(s)).slice(0, 3)
      .forEach((t) => out.push({ icon: "life", label: `${t.no} — ${t.subject}`, sub: `${t.from} · ${t.status}`, go: () => app.go("support") }));
    const links = [
      { k: "control room dashboard", i: "cpu", id: "ownerDash" as NavId },
      { k: "create trial license", i: "key", id: "licenses" as NavId },
      { k: "audit log security", i: "shield", id: "security" as NavId },
      { k: "onboard new school tenant", i: "plus", id: "tenants" as NavId },
    ].filter((a) => a.k.includes(s)).slice(0, 3);
    links.forEach((a) => out.push({ icon: a.i, label: a.k.replace(/\b\w/g, (c) => c.toUpperCase()), sub: "Quick link", go: () => app.go(a.id, a.id === "tenants" ? { new: "1" } : undefined) }));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, app.db]);

  const clock = new Date().toLocaleTimeString("en-PK", { hour12: false });
  void tick;

  return (
    <div className="min-h-screen bg-canvas">
      {/* ============ SIDEBAR ============ */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-white/8 bg-night text-canvas transition-transform duration-300 lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(240px 90px at 20% 0%, rgba(201,154,46,0.16), transparent 70%)" }} />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-night shadow-lg shadow-accent/20">
            <I n="cpu" size={19} />
          </span>
          <div className="relative min-w-0">
            <p className="display truncate text-[14px] font-bold leading-tight text-white">Markaz Cloud</p>
            <p className="text-[9.5px] font-bold tracking-[0.18em] text-accent/90">OPERATOR CONSOLE</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="mb-4">
              <p className="mb-1.5 px-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-canvas/35">{g}</p>
              {list.map((n) => {
                const active = app.nav.id === n.id;
                return (
                  <button key={n.id} onClick={() => { app.go(n.id); setSideOpen(false); }}
                    className={`focus-ring group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${active ? "bg-white/12 text-white" : "text-canvas/65 hover:bg-white/6 hover:text-white"}`}>
                    <I n={n.icon} size={16} className={active ? "text-accent" : "text-canvas/45 group-hover:text-accent/80"} />
                    {n.label}
                    {n.id === "support" && app.db.tickets.filter((t) => t.status === "open").length > 0 && (
                      <span className="num ml-auto rounded-md bg-danger/25 px-1.5 py-0.5 text-[10px] font-bold text-danger">{app.db.tickets.filter((t) => t.status === "open").length}</span>
                    )}
                    {active && n.id !== "support" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="mx-1 mt-2 rounded-xl border border-white/10 bg-white/4 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-canvas/40"><I n="shield" size={11} /> Data boundary</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-canvas/55">Commercial metadata only. Tenant operational records are never exposed here.</p>
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
            <Avatar name={app.session?.name ?? "Operator"} size={34} tone="accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-white">{app.session?.name}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-accent/90">{app.session?.operatorRole ?? "Operator"}</p>
            </div>
            <button title="Sign out" onClick={app.logout} className="focus-ring rounded-lg p-2 text-canvas/50 transition hover:bg-white/10 hover:text-white"><I n="logout" size={15} /></button>
          </div>
          <p className="num mt-2 px-1 text-center text-[9.5px] tracking-wider text-canvas/30">CONSOLE v2.4.1 · REGION ap-south-1</p>
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 z-30 bg-night/50 backdrop-blur-sm lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ============ MAIN ============ */}
      <div className="lg:pl-[240px]">
        {app.db.maintenanceMode && (
          <div className="flex items-center gap-2 bg-warn px-4 py-2 text-[12px] font-semibold text-white">
            <I n="alert" size={14} /> Maintenance mode is ON — tenant portals are showing a scheduled-maintenance page.
            <button className="ml-auto rounded-md bg-white/20 px-2 py-0.5 transition hover:bg-white/30" onClick={() => app.setMaintenance(false)}>Disable</button>
          </div>
        )}

        <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <button className="focus-ring rounded-lg p-2 text-sub transition hover:bg-line/60 lg:hidden" onClick={() => setSideOpen(true)}><I n="menu" size={18} /></button>
            <div className="min-w-0">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-sub/70">Markaz Cloud / {TITLES[app.nav.id] ?? "Console"}</p>
              <h1 className="display truncate text-[17px] font-bold leading-tight text-ink">{TITLES[app.nav.id] ?? "Console"}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {activeSession && (
                <button onClick={() => app.go("support")} title="Active support session — tap to manage"
                  className="hidden items-center gap-1.5 rounded-lg border border-danger/40 bg-dangersoft px-2.5 py-1.5 text-[11px] font-bold text-danger transition hover:brightness-95 md:flex">
                  <span className="dot-live h-2 w-2 rounded-full bg-danger" /> SESSION {mm}:{ss}
                </button>
              )}
              <span className="num hidden items-center gap-1.5 rounded-lg border border-line bg-canvas/70 px-2.5 py-1.5 text-[11px] font-semibold text-sub xl:flex">
                <span className="dot-live h-1.5 w-1.5 rounded-full bg-ok" /> {clock} PKT
              </span>
              <button onClick={() => setSearchOpen(true)}
                className="focus-ring flex items-center gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-1.5 text-[12px] text-sub transition hover:border-primary/40 hover:text-ink">
                <I n="search" size={14} /> <span className="hidden sm:inline">Search tenants, licenses…</span>
                <span className="num hidden rounded border border-line bg-surface px-1.5 text-[10px] sm:inline">⌘K</span>
              </button>
              <button onClick={() => { setNotifOpen(true); }} className="focus-ring relative rounded-lg border border-line bg-canvas/70 p-2 text-sub transition hover:border-primary/40 hover:text-ink">
                <I n="bell" size={16} />
                {unread > 0 && <span className="num absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white">{unread}</span>}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1240px] px-4 py-5 lg:px-6">{children}</main>

        <footer className="mx-auto max-w-[1240px] px-4 pb-6 lg:px-6">
          <p className="border-t border-line pt-3 text-[10.5px] text-sub/70">
            Markaz Cloud control plane · tenant data isolation enforced at the data-access layer · every privileged action is written to the immutable audit log.
          </p>
        </footer>
      </div>

      {/* ============ SEARCH ============ */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-night/55 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="anim-pop w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <I n="search" size={16} className="text-sub" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tenants, license keys, invoices, tickets…"
                className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-sub/60" />
              <button className="num rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] text-sub" onClick={() => setSearchOpen(false)}>ESC</button>
            </div>
            <div className="max-h-[46vh] overflow-y-auto p-2">
              {q.trim().length < 2 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-[12.5px] font-semibold text-ink">Global customer lookup</p>
                  <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-sub">Find any account by school name, tenant code, account number, owner email, license ID or invoice number — without ever opening tenant operational records.</p>
                </div>
              )}
              {q.trim().length >= 2 && searchResults.length === 0 && (
                <p className="px-3 py-6 text-center text-[12px] text-sub">No matches across tenants, licenses, invoices or tickets.</p>
              )}
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => { setSearchOpen(false); setQ(""); r.go(); }}
                  className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-primarysoft/60">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-primarydark"><I n={r.icon} size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-ink">{r.label}</span>
                    <span className="block truncate text-[11px] text-sub">{r.sub}</span>
                  </span>
                  <I n="arrowR" size={14} className="text-sub/60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ NOTIFICATIONS ============ */}
      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Commercial alerts" sub="Trial, billing, security and workflow notifications">
        <div className="space-y-2.5">
          {notifs.length === 0 && <p className="py-8 text-center text-[12.5px] text-sub">No alerts — the platform is quiet.</p>}
          {notifs.map((n) => (
            <div key={n.id} className={`rounded-xl border p-3 ${n.read ? "border-line bg-canvas/60" : "border-primary/30 bg-primarysoft/50"}`}>
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${n.read ? "bg-line/70 text-sub" : "bg-primary text-white"}`}><I n={n.icon} size={13} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold leading-snug text-ink">{n.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-sub">{n.body}</p>
                  <p className="num mt-1 text-[10px] text-sub/70">{timeAgo(n.time)}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            </div>
          ))}
          {unread > 0 && (
            <button onClick={app.markNotifsRead} className="focus-ring w-full rounded-xl border border-line bg-surface py-2.5 text-[12px] font-bold text-primarydark transition hover:bg-primarysoft/60">
              Mark all as read ({unread})
            </button>
          )}
        </div>
      </Drawer>
    </div>
  );
}
