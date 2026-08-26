import React, { useMemo } from "react";
import { useOwner, mrrOf } from "./store";
import { STATUS_META, fmtLakh, fmtPKR } from "./data";
import { AreaChart, Badge, Btn, Card, Donut, I, PageHead, Spark, VBars, useCountUp } from "../components/ui";

function Kpi({ label, value, sub, spark, tone, prefix, onClick }: { label: string; value: number; sub: React.ReactNode; spark?: number[]; tone?: string; prefix?: string; onClick?: () => void }) {
  const v = useCountUp(value);
  return (
    <button onClick={onClick} className="group rounded-lg border border-line bg-card p-4 text-left shadow-[0_1px_2px_rgba(11,20,32,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#0b1420]/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">{label}</div>
        {spark && <Spark data={spark} w={64} h={24} color={tone ?? "#0b1420"} />}
      </div>
      <div className="num mt-1 font-display text-[24px] font-extrabold leading-none text-ink">{prefix}{v.toLocaleString()}</div>
      <div className="mt-1.5 text-[11px] text-sub">{sub}</div>
    </button>
  );
}

export default function OwnerDashboard() {
  const o = useOwner();
  const t = o.tenants;

  const stats = useMemo(() => {
    const by = (s: string) => t.filter((x) => x.status === s).length;
    return {
      total: t.length,
      active: by("active_paid"),
      trials: by("trial") + by("trial_expiring"),
      expiring: t.filter((x) => x.status === "trial" && (x.trialDaysLeft ?? 0) <= 7).length,
      grace: by("grace"),
      suspended: by("suspended"),
      expired: by("expired"),
      pending: by("pending"),
      permanent: t.filter((x) => x.license.type === "permanent").length,
      renewals: t.filter((x) => x.status === "active_paid" && x.license.expiresOn && x.license.expiresOn <= new Date(Date.now() + 45 * 86400e3).toISOString().slice(0, 10)).length,
    };
  }, [t]);

  const mrr = mrrOf(t);
  const byPlan = useMemo(() => {
    const names = ["Starter", "Professional", "Enterprise", "Lifetime License"];
    const colors = ["#5b7a99", "#0e6b4e", "#e8a226", "#8e5a2f"];
    return names.map((n, i) => ({ label: n, value: t.filter((x) => x.planId && ["starter", "professional", "enterprise", "permanent"][i] === x.planId).length, color: colors[i] })).filter((x) => x.value > 0);
  }, [t]);

  const moduleAdoption = useMemo(() => {
    const keys = ["fees", "attendance", "exams", "whatsapp", "online_payments", "transport", "library", "api"];
    const labels: Record<string, string> = { fees: "Fees", attendance: "Attendance", exams: "Exams", whatsapp: "WhatsApp", online_payments: "Online Pay", transport: "Transport", library: "Library", api: "API" };
    return keys.map((k) => ({ label: labels[k], v: t.filter((x) => x.modules.includes(k)).length }));
  }, [t]);

  const revTrend = [62, 71, 78, 84, 90, 96, 104, 112, 118, 124, 130, Math.round(mrr / 1000)];
  const openTickets = o.tickets.filter((x) => x.status !== "resolved").length;
  const openSec = o.security.filter((x) => x.status === "open").length;

  const quick: { icon: string; label: string; go: string }[] = [
    { icon: "plus", label: "Onboard School", go: "tenants" },
    { icon: "clock", label: "Extend a Trial", go: "commercial" },
    { icon: "cash", label: "Record Payment", go: "commercial" },
    { icon: "eye", label: "Support Session", go: "support" },
    { icon: "doc", label: "View Audit Log", go: "ops" },
    { icon: "alert", label: "Security Alerts", go: "ops" },
  ];

  return (
    <>
      <PageHead title="Control Room" sub={`Software owner overview · ${o.operator} · commercial metadata only`}>
        <Badge tone="primary">MRR <span className="num">{fmtLakh(mrr)}</span></Badge>
      </PageHead>

      <div className="mb-4 flex flex-wrap gap-2">
        {quick.map((q) => (
          <Btn key={q.label} v="outline" sz="sm" icon={q.icon} onClick={() => o.go(q.go)}>{q.label}</Btn>
        ))}
      </div>

      <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Schools onboarded" value={stats.total} spark={[4, 5, 6, 7, 8, 9, 10, stats.total]} sub={`${stats.pending} pending activation`} onClick={() => o.go("tenants")} />
        <Kpi label="Active paid" value={stats.active} tone="#0e6b4e" sub={`${stats.permanent} lifetime license${stats.permanent === 1 ? "" : "s"}`} onClick={() => o.go("tenants")} />
        <Kpi label="Trials running" value={stats.trials} tone="#e8a226" sub={<span className="font-bold text-warn">{stats.expiring} expiring ≤ 7d</span>} onClick={() => o.go("commercial")} />
        <Kpi label="Monthly revenue" value={Math.round(mrr / 1000)} prefix="Rs " spark={revTrend.slice(-6)} sub={`${fmtLakh(mrr)} MRR`} onClick={() => o.go("commercial")} />
        <Kpi label="Renewals due ≤45d" value={stats.renewals} sub="auto-reminder armed" onClick={() => o.go("commercial")} />
        <Kpi label="At-risk accounts" value={stats.grace + stats.suspended + stats.expired} tone="#bd4437" sub={`${stats.grace} grace · ${stats.suspended} suspended`} onClick={() => o.go("tenants")} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <div><h3 className="font-display text-[15px] font-extrabold text-ink">Recurring revenue — 12 months</h3><p className="text-[11.5px] text-sub">PKR thousands · subscription + add-ons</p></div>
            <Badge tone="ok">+{Math.round((revTrend[11] / revTrend[0] - 1) * 100)}% YoY</Badge>
          </div>
          <AreaChart labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]} values={revTrend} format={(n) => `${n}k`} height={190} color="#0b1420" />
        </Card>
        <Card className="xl:col-span-5">
          <div className="mb-3"><h3 className="font-display text-[15px] font-extrabold text-ink">Tenants by plan</h3><p className="text-[11.5px] text-sub">License distribution</p></div>
          <Donut data={byPlan} centerValue={String(stats.active + stats.trials)} centerLabel="paying + trials" />
          <div className="mt-3 border-t border-linesoft pt-2.5">
            <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-sub">Enabled modules across tenants</h4>
            <div className="flex flex-wrap gap-1.5">
              {moduleAdoption.map((m) => <Badge key={m.label} tone="neutral">{m.label} · <span className="num">{m.v}</span></Badge>)}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-4" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Module adoption</h3><Badge tone="primary">8 tracked</Badge></div>
          <div className="p-4"><VBars items={moduleAdoption} height={130} color="#0e6b4e" /></div>
        </Card>

        <Card className="xl:col-span-4" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Needs attention</h3><Badge tone="danger" dot>{openSec + openTickets + stats.expiring}</Badge></div>
          <div className="space-y-1 p-2 pb-3">
            {o.security.filter((s) => s.status === "open").map((s) => (
              <button key={s.id} onClick={() => o.go("ops")} className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-dangersoft/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-dangersoft text-danger"><I n="alert" size={14} /></span>
                <span className="min-w-0"><span className="block text-[12px] font-semibold text-ink">{s.type}</span><span className="text-[10.5px] text-sub">Security · {s.severity}</span></span>
              </button>
            ))}
            {o.tickets.filter((x) => x.status !== "resolved").slice(0, 3).map((tk) => (
              <button key={tk.id} onClick={() => o.go("support")} className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-infosoft/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-infosoft text-info"><I n="msg" size={14} /></span>
                <span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-ink">{tk.subject}</span><span className="text-[10.5px] text-sub">{tk.no} · {tk.priority}</span></span>
              </button>
            ))}
            {stats.expiring > 0 && (
              <button onClick={() => o.go("commercial")} className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-warnsoft/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-warnsoft text-warn"><I n="clock" size={14} /></span>
                <span className="min-w-0"><span className="block text-[12px] font-semibold text-ink">{stats.expiring} trial(s) expiring soon</span><span className="text-[10.5px] text-sub">Send renewal nudge</span></span>
              </button>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-4" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Tenant status mix</h3></div>
          <div className="space-y-1.5 p-4">
            {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => {
              const n = t.filter((x) => x.status === s).length;
              if (!n) return null;
              return (
                <div key={s} className="flex items-center gap-2 text-[12px]">
                  <span className="w-28 truncate text-sub">{STATUS_META[s].label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-linesoft"><span className="anim-growx block h-full rounded-full bg-[#0b1420]" style={{ width: `${(n / t.length) * 100}%` }} /></span>
                  <span className="num w-5 text-right font-bold text-ink">{n}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="xl:col-span-12" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Recent privileged activity</h3><Btn v="ghost" sz="sm" onClick={() => o.go("ops")}>Full audit log <I n="arrowR" size={13} /></Btn></div>
          <div className="grid gap-x-6 gap-y-0.5 p-3 pb-4 md:grid-cols-2">
            {o.auditLog.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 rounded-md px-2 py-1.5">
                <I n={a.risk === "elevated" ? "shield" : "doc"} size={13} className={`mt-0.5 shrink-0 ${a.risk === "elevated" ? "text-danger" : "text-sub"}`} />
                <div className="min-w-0">
                  <span className="text-[12.5px] text-ink"><b>{a.action}</b> · {a.target}</span>
                  <span className="num block text-[10.5px] text-sub">{a.operator} · {new Date(a.time).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · <span className={a.outcome === "denied" ? "font-bold text-danger" : ""}>{a.outcome}</span></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
