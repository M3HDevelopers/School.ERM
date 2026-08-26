import React, { useEffect, useState } from "react";
import { useOwner } from "./store";
import { I } from "../components/ui";

const NAV: { group: string; items: { id: string; label: string; icon: string }[] }[] = [
  { group: "Overview", items: [{ id: "control", label: "Control Room", icon: "grid" }] },
  { group: "Customers", items: [
    { id: "tenants", label: "Schools & Tenants", icon: "building" },
    { id: "commercial", label: "Plans · Licenses · Billing", icon: "wallet" },
  ] },
  { group: "Platform", items: [
    { id: "ops", label: "System · Releases · Audit", icon: "gear" },
  ] },
  { group: "Service", items: [{ id: "support", label: "Support Desk", icon: "msg" }] },
];

function Uptime() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  const base = 14 * 86400 + 6 * 3600 + 41 * 60 + s;
  const d = Math.floor(base / 86400);
  const hh = String(Math.floor((base % 86400) / 3600)).padStart(2, "0");
  const mm = String(Math.floor((base % 3600) / 60)).padStart(2, "0");
  const ss = String(base % 60).padStart(2, "0");
  return <span className="num">{d}d {hh}:{mm}:{ss}</span>;
}

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const o = useOwner();
  const [mobile, setMobile] = useState(false);
  const unread = o.notis.filter((n) => !n.read).length;
  const activeSessions = o.sessions.filter((s) => s.active).length;

  const sidebar = (
    <aside className="flex h-full w-[236px] flex-col border-r border-[#1e2a38] bg-[#0b1420] text-[#9fb3c8]">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8a226] text-[#0b1420]"><I n="shield" size={19} /></span>
        <div className="min-w-0">
          <div className="font-display text-[14px] font-extrabold leading-tight text-white">Markaz Cloud</div>
          <div className="text-[9.5px] font-bold tracking-[0.16em] text-[#e8a226]">OPERATOR CONSOLE</div>
        </div>
      </div>
      <div className="mx-4 mb-2 flex items-center justify-between rounded-md border border-[#1e2a38] bg-white/[0.04] px-2.5 py-1.5">
        <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#9fb3c8]/70">Control Plane</span>
        <span className="num text-[9.5px] text-[#9fb3c8]/60">v2.4.1</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        {NAV.map((g) => (
          <div key={g.group} className="mt-3">
            <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#9fb3c8]/50">{g.group}</div>
            {g.items.map((it) => {
              const active = o.page === it.id;
              return (
                <button key={it.id} onClick={() => { o.go(it.id); setMobile(false); }}
                  className={`group relative mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[12.5px] font-semibold transition-all ${active ? "bg-white/[0.09] text-white" : "hover:bg-white/[0.04] hover:text-white"}`}>
                  {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-[#e8a226]" />}
                  <I n={it.icon} size={16} className={active ? "text-[#e8a226]" : "text-[#9fb3c8]/70"} />
                  <span className="truncate">{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-[#1e2a38] p-3">
        <div className="rounded-md bg-white/[0.04] px-2.5 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8a226]/20 text-[11px] font-bold text-[#e8a226]">
              {o.operator.split(" ").map((w) => w[0]).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-white">{o.operator}</div>
              <div className="truncate text-[10px] text-[#9fb3c8]/70">{o.operatorRole}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#1e2a38] pt-2 text-[10px] text-[#9fb3c8]/60">
            <span className="flex items-center gap-1"><I n="shield" size={11} /> 2FA verified</span>
            {activeSessions > 0 && <span className="flex items-center gap-1 text-[#e8a226]"><I n="eye" size={11} /> {activeSessions} support live</span>}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f3ec]">
      <div className="hidden lg:block">{sidebar}</div>
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden" onMouseDown={() => setMobile(false)}>
          <div className="absolute inset-0 bg-[#0b1420]/60 anim-fade" />
          <div className="absolute left-0 top-0 h-full anim-slideL" onMouseDown={(e) => e.stopPropagation()}>{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* command strip */}
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line bg-card px-4">
          <button className="rounded-md p-1.5 text-sub hover:bg-linesoft lg:hidden" onClick={() => setMobile(true)}><I n="menu" /></button>
          <span className="flex items-center gap-2 rounded-md border border-ok/30 bg-oksoft px-2.5 py-1 text-[11px] font-bold text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok pulse-dot" /> All systems operational
          </span>
          <span className="num hidden items-center gap-1.5 text-[11px] text-sub md:flex"><I n="clock" size={12} /> uptime <Uptime /></span>
          <span className="num hidden items-center gap-1.5 text-[11px] text-sub xl:flex"><I n="doc" size={12} /> queue {3 + (unread % 5)}</span>
          {o.maintenanceMode && (
            <span className="flex items-center gap-1.5 rounded-md border border-warn/40 bg-warnsoft px-2.5 py-1 text-[11px] font-bold text-warn"><I n="alert" size={12} /> Maintenance mode</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-[11px] text-sub sm:block">Tenant data is isolated — <b className="text-ink">commercial metadata only</b></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={o.page} className="anim-rise mx-auto max-w-[1280px] px-4 py-5 sm:px-6">{children}</div>
        </main>
      </div>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(380px,90vw)] flex-col gap-2">
        {o.toasts.map((t) => (
          <div key={t.id} className={`anim-toast pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-card p-3 shadow-xl ${t.type === "danger" ? "border-danger/40" : "border-line"}`}>
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.type === "ok" ? "bg-oksoft text-ok" : t.type === "danger" ? "bg-dangersoft text-danger" : "bg-infosoft text-info"}`}>
              <I n={t.type === "danger" ? "alert" : t.type === "info" ? "bell" : "check"} size={13} />
            </span>
            <p className="flex-1 text-[12.5px] font-medium leading-snug text-ink">{t.msg}</p>
            <button onClick={() => o.dismissToast(t.id)} className="text-sub hover:text-ink"><I n="x" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
