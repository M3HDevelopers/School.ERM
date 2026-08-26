import React, { useState } from "react";
import { useOwner } from "./store";
import { downloadCSV } from "../store";
import { Badge, Btn, Card, Confirm, EmptyState, I, PageHead, Tabs, tdCls, thCls, Toggle } from "../components/ui";

function SystemTab() {
  const o = useOwner();
  const svc = [
    { name: "API Gateway", status: "healthy", latency: 182 },
    { name: "Database (primary)", status: "healthy", latency: 24 },
    { name: "Notification queue", status: "healthy", latency: 96 },
    { name: "Background jobs", status: "healthy", latency: 40 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Service health</h3>
            <Btn v="outline" sz="sm" icon="refresh" onClick={() => o.toast("Health probes re-run — all green", "info")}>Re-check</Btn>
          </div>
          <div className="divide-y divide-linesoft">
            {[...svc, ...o.integrations.map((i) => ({ name: i.name, status: i.status, latency: i.latency }))].map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`h-2 w-2 rounded-full ${s.status === "healthy" ? "bg-ok pulse-dot" : s.status === "degraded" ? "bg-warn" : "bg-danger"}`} />
                <span className="flex-1 text-[12.5px] font-semibold text-ink">{s.name}</span>
                <span className="num text-[11px] text-sub">{s.status === "down" ? "unreachable" : `${s.latency}ms`}</span>
                <Badge tone={s.status === "healthy" ? "ok" : s.status === "degraded" ? "warn" : "danger"}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Backups & recovery</h3>
            <Badge tone="ok">{o.backups.filter((b) => b.status === "ok").length}/{o.backups.length} ok</Badge>
          </div>
          <div className="divide-y divide-linesoft">
            {o.backups.map((b) => {
              const t = o.tenants.find((x) => x.id === b.tenantId);
              return (
                <div key={b.tenantId} className="flex items-center gap-3 px-4 py-2.5">
                  <I n="archive" size={15} className={b.status === "ok" ? "text-ok" : "text-danger"} />
                  <span className="flex-1 text-[12.5px] font-semibold text-ink">{t?.name ?? b.tenantId}</span>
                  <span className="num text-[11px] text-sub">{b.sizeGb} GB · {new Date(b.lastOk).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  {b.status === "failed" ? <Btn v="danger" sz="xs" icon="refresh" onClick={() => o.retryBackup(b.tenantId)}>Retry</Btn> : <Badge tone="ok">ok</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Automation rules engine</h3>
          <Badge tone="primary">{o.rules.filter((r) => r.enabled).length} active</Badge>
        </div>
        <div className="divide-y divide-linesoft">
          {o.rules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primarysoft text-primarydeep"><I n="refresh" size={15} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] font-bold text-ink">When {r.trigger.toLowerCase()}</div>
                <div className="text-[11.5px] text-sub">→ {r.action}</div>
              </div>
              <span className="num text-[10.5px] text-sub">{r.runs} runs</span>
              <Toggle on={r.enabled} onChange={() => o.toast(`Rule "${r.trigger}" ${r.enabled ? "paused" : "armed"}`, "info")} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReleasesTab() {
  const o = useOwner();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Releases & rollout</h3>
            <Badge tone="primary">v{o.releases[0].version} live</Badge>
          </div>
          <div className="divide-y divide-linesoft">
            {o.releases.map((r) => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[13.5px] font-extrabold text-ink">{r.name}</div>
                  <Badge tone={r.status === "live" ? "ok" : r.status === "rolling" ? "warn" : "info"}>{r.status}</Badge>
                </div>
                <div className="num mt-0.5 text-[11px] text-sub">v{r.version} · {r.date}</div>
                <p className="mt-1 text-[12px] text-sub">{r.notes}</p>
                {r.status !== "live" && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-[10.5px]"><span className="text-sub">rollout</span><span className="num font-bold text-ink">{r.rollout}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-linesoft"><div className="anim-growx h-full rounded-full bg-[#e8a226]" style={{ width: `${r.rollout}%` }} /></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Feature flags</h3>
            <Badge tone="neutral">kill-switch ready</Badge>
          </div>
          <div className="divide-y divide-linesoft">
            {o.flags.map((f) => (
              <div key={f.key} className="flex items-center gap-3 px-4 py-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${f.enabled ? "bg-oksoft text-ok" : "bg-linesoft text-sub"}`}><I n="gear" size={15} /></span>
                <div className="flex-1">
                  <div className="text-[12.5px] font-bold text-ink">{f.label}</div>
                  <div className="num text-[10.5px] text-sub">{f.key} · {f.rollout}% rollout</div>
                </div>
                <Toggle on={f.enabled} onChange={() => o.toggleFlag(f.key)} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">System configuration</h3>
          <Badge tone="info">global defaults</Badge>
        </div>
        <div className="grid gap-x-8 p-4 text-[12.5px] md:grid-cols-2">
          {[["Default trial duration", "14 days"], ["Default grace period", "7 days"], ["Password policy", "12+ chars · 2FA for privileged"], ["License expiry policy", "auto-suspend after grace"], ["Audit retention", "7 years (immutable)"], ["Global API rate limit", "120 req/min per tenant"], ["Support access policy", "reason + time-limited + audited"], ["Backup schedule", "nightly 02:00 PKT · 30-day retention"]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-linesoft py-2 last:border-0"><span className="text-sub">{k}</span><b className="num text-right">{v}</b></div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-linesoft px-4 py-3">
          <div>
            <div className="text-[13px] font-bold text-danger">Maintenance mode</div>
            <div className="text-[11.5px] text-sub">Puts all tenant portals read-only. {o.maintenanceMode ? "Currently ON." : "Currently off."}</div>
          </div>
          <Toggle on={o.maintenanceMode} onChange={(v) => o.setMaintenance(v)} />
        </div>
      </Card>
    </div>
  );
}

function AuditTab() {
  const o = useOwner();
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
        <h3 className="font-display text-[15px] font-extrabold text-ink">Audit log — append-only</h3>
        <Btn v="outline" sz="sm" icon="download" onClick={() => downloadCSV("owner-audit", o.auditLog.map((a) => ({ time: a.time, operator: a.operator, action: a.action, target: a.target, reason: a.reason, risk: a.risk, outcome: a.outcome })))}>Export</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="bg-paper"><tr><th className={thCls}>When</th><th className={thCls}>Operator</th><th className={thCls}>Action</th><th className={thCls}>Target</th><th className={thCls}>Risk</th><th className={thCls}>Outcome</th></tr></thead>
          <tbody>
            {o.auditLog.map((a) => (
              <tr key={a.id} className="border-t border-linesoft">
                <td className={`${tdCls} num text-sub`}>{new Date(a.time).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td className={`${tdCls} font-semibold`}>{a.operator}</td>
                <td className={tdCls}><b>{a.action}</b><span className="block text-[10.5px] text-sub">{a.reason}</span></td>
                <td className={`${tdCls} text-sub`}>{a.target}</td>
                <td className={tdCls}>{a.risk === "elevated" ? <Badge tone="danger" dot>elevated</Badge> : <Badge tone="neutral">normal</Badge>}</td>
                <td className={tdCls}><Badge tone={a.outcome === "success" ? "ok" : a.outcome === "denied" ? "danger" : "warn"}>{a.outcome}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SecurityTab() {
  const o = useOwner();
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Security alerts</h3>
            <Badge tone="danger" dot>{o.security.filter((s) => s.status === "open").length} open</Badge>
          </div>
          <div className="divide-y divide-linesoft">
            {o.security.map((s) => (
              <div key={s.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${s.severity === "critical" ? "bg-dangersoft text-danger" : s.severity === "warn" ? "bg-warnsoft text-warn" : "bg-infosoft text-info"}`}><I n="alert" size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-ink">{s.type}</div>
                  <div className="text-[11.5px] text-sub">{s.detail}</div>
                </div>
                {s.status === "open" ? <Btn v="outline" sz="xs" onClick={() => o.ackSecurity(s.id)}>Acknowledge</Btn> : <Badge tone={s.status === "resolved" ? "ok" : "warn"}>{s.status}</Badge>}
              </div>
            ))}
          </div>
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Internal operators</h3>
            <Badge tone="primary">{o.operators.filter((x) => x.twoFA).length}/{o.operators.length} with 2FA</Badge>
          </div>
          <div className="divide-y divide-linesoft">
            {o.operators.map((op) => (
              <div key={op.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1420] text-[11px] font-bold text-[#e8a226]">{op.name.split(" ").map((w) => w[0]).join("")}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-ink">{op.name}</div>
                  <div className="text-[10.5px] text-sub">{op.role} · {op.email}</div>
                </div>
                {op.twoFA ? <Badge tone="ok">2FA</Badge> : <Badge tone="warn">no 2FA</Badge>}
                <Badge tone={op.status === "active" ? "ok" : "danger"} dot>{op.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="!border-danger/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[14px] font-extrabold text-danger">Danger zone</h3>
            <p className="text-[12px] text-sub">Reset the control plane back to seeded demo data. Tenant commercial changes will be cleared.</p>
          </div>
          <Btn v="danger" sz="sm" icon="refresh" onClick={() => setConfirmReset(true)}>Reset control plane</Btn>
        </div>
      </Card>
      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} onYes={o.resetOwner} title="Reset control plane?" yesLabel="Reset everything"
        body="This clears owner-side localStorage (tenants, invoices, audit, sessions) and reloads the original seed. School ERP data is unaffected." />
    </div>
  );
}

export default function Ops() {
  const [tab, setTab] = useState("system");
  return (
    <>
      <PageHead title="System · Releases · Audit" sub="Platform operations, security and governance">
        <Badge tone="ok">all regions operational</Badge>
      </PageHead>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "system", label: "System & Backups", icon: "gear" },
        { id: "releases", label: "Releases & Flags", icon: "refresh" },
        { id: "audit", label: "Audit Log", icon: "doc" },
        { id: "security", label: "Security & Operators", icon: "shield" },
      ]} />
      <div className="mt-4">
        {tab === "system" && <SystemTab />}
        {tab === "releases" && <ReleasesTab />}
        {tab === "audit" && <AuditTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </>
  );
}
