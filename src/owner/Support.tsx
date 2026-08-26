import React, { useEffect, useState } from "react";
import { useOwner } from "./store";
import { Badge, Btn, Card, EmptyState, Field, I, Modal, PageHead, Select, Tabs, tdCls, TextArea, TextInput, thCls } from "../components/ui";

const PR_TONE: Record<string, string> = { high: "danger", medium: "warn", low: "neutral" };
const ST_TONE: Record<string, string> = { open: "danger", "in-progress": "warn", resolved: "ok" };

function TicketsTab() {
  const o = useOwner();
  const [detail, setDetail] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const tk = o.tickets.find((x) => x.id === detail);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Support queue — {o.tickets.filter((t) => t.status !== "resolved").length} open</h3>
          <Badge tone="primary">SLA tracked</Badge>
        </div>
        <div className="divide-y divide-linesoft">
          {o.tickets.map((t) => {
            const tenant = o.tenants.find((x) => x.id === t.tenantId);
            return (
              <button key={t.id} onClick={() => { setDetail(t.id); setNote(t.notes); }} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-primarysoft/40">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${t.priority === "high" ? "bg-dangersoft text-danger" : t.priority === "medium" ? "bg-warnsoft text-warn" : "bg-linesoft text-sub"}`}><I n="msg" size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-ink">{t.subject}</div>
                  <div className="num text-[10.5px] text-sub">{t.no} · {tenant?.name ?? t.from} · {t.category}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={PR_TONE[t.priority]}>{t.priority}</Badge>
                  <Badge tone={ST_TONE[t.status]} dot>{t.status}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">{tk ? tk.no : "Ticket detail"}</h3>
          {tk && <Badge tone="neutral">SLA {tk.sla}</Badge>}
        </div>
        {!tk ? (
          <div className="p-4"><EmptyState icon="msg" title="Select a ticket" body="Choose a ticket from the queue to triage it." /></div>
        ) : (
          <div className="space-y-3 p-4">
            <div>
              <div className="font-display text-[14px] font-extrabold text-ink">{tk.subject}</div>
              <div className="mt-0.5 text-[11.5px] text-sub">{tk.from} · {tk.category} · opened {tk.created}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assignee">
                <Select value={tk.assignee} onChange={(e) => o.assignTicket(tk.id, e.target.value)}>
                  {["Mina Baig", "Danish Iqbal", "Kashif Niazi", "Ayesha Siddiqui"].map((x) => <option key={x}>{x}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={tk.status} onChange={(e) => o.setTicketStatus(tk.id, e.target.value as typeof tk.status)}>
                  <option value="open">open</option><option value="in-progress">in-progress</option><option value="resolved">resolved</option>
                </Select>
              </Field>
            </div>
            <Field label="Internal note">
              <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Diagnostic info, next steps…" />
            </Field>
            <div className="flex gap-2">
              <Btn v="soft" sz="sm" icon="check" onClick={() => { o.setTicketStatus(tk.id, "resolved"); o.toast("Ticket resolved — customer notified", "ok"); }}>Resolve</Btn>
              <Btn v="outline" sz="sm" icon="eye" onClick={() => { o.go("tenants"); }}>Open tenant account</Btn>
            </div>
            <p className="rounded-md bg-infosoft px-3 py-2 text-[11px] text-info">Need to look inside the tenant? Open an audited support session from the tenant drawer — never raw data access.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function SessionsTab() {
  const o = useOwner();
  const [, force] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
        <h3 className="font-display text-[15px] font-extrabold text-ink">Support / impersonation sessions</h3>
        <Badge tone={o.sessions.some((s) => s.active) ? "warn" : "ok"} dot>{o.sessions.filter((s) => s.active).length} live</Badge>
      </div>
      {o.sessions.length === 0 ? (
        <div className="p-4"><EmptyState icon="eye" title="No sessions" body="Open an audited support session from a tenant drawer." /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-paper"><tr><th className={thCls}>Operator</th><th className={thCls}>Tenant</th><th className={thCls}>Reason</th><th className={thCls}>Mode</th><th className={thCls}>Time left</th><th className={thCls}></th></tr></thead>
            <tbody>
              {o.sessions.map((s) => {
                const t = o.tenants.find((x) => x.id === s.tenantId);
                const left = Math.max(0, Math.round((s.expiresAt - Date.now()) / 1000));
                const mm = Math.floor(left / 60); const ss = String(left % 60).padStart(2, "0");
                return (
                  <tr key={s.id} className="border-t border-linesoft">
                    <td className={`${tdCls} font-semibold`}>{s.operator}</td>
                    <td className={tdCls}>{t?.name ?? s.tenantId}</td>
                    <td className={`${tdCls} max-w-[220px] truncate text-sub`}>{s.reason}</td>
                    <td className={tdCls}>{s.readOnly ? <Badge tone="info">read-only</Badge> : <Badge tone="warn">write</Badge>}</td>
                    <td className={tdCls}>{s.active ? <span className="num font-bold text-warn">{mm}:{ss}</span> : <Badge tone="neutral">ended</Badge>}</td>
                    <td className={tdCls}>{s.active && <Btn v="danger" sz="xs" icon="x" onClick={() => o.endImpersonation(s.id)}>Terminate</Btn>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-linesoft px-4 py-3 text-[11px] text-sub">Every session records operator, tenant, reason, start/end and actions. Sessions auto-terminate on expiry.</p>
    </Card>
  );
}

function AnnounceTab() {
  const o = useOwner();
  const [a, setA] = useState({ title: "", body: "", audience: "All tenants" });
  const send = () => {
    if (a.title.trim().length < 3 || a.body.trim().length < 10) return o.toast("Write a title and message first", "danger");
    o.audit("Customer announcement", a.audience, a.title.trim());
    o.toast(`Announcement queued to ${a.audience.toLowerCase()} via email + in-app`, "ok");
    setA({ title: "", body: "", audience: "All tenants" });
  };
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <h3 className="font-display text-[15px] font-extrabold text-ink">Broadcast to customers</h3>
        <div className="mt-3 space-y-3.5">
          <Field label="Audience">
            <Select value={a.audience} onChange={(e) => setA({ ...a, audience: e.target.value })}>
              <option>All tenants</option><option>Active paid only</option><option>Trial users</option><option>Expired / churned</option>
            </Select>
          </Field>
          <Field label="Title"><TextInput value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} placeholder="e.g. Scheduled maintenance window" /></Field>
          <Field label="Message"><TextArea value={a.body} onChange={(e) => setA({ ...a, body: e.target.value })} placeholder="What should customers know?" /></Field>
          <Btn className="w-full !py-2.5" icon="send" onClick={send}>Send announcement</Btn>
        </div>
      </Card>
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Sent history</h3>
          <Badge tone="primary">{o.announcements.length}</Badge>
        </div>
        <div className="divide-y divide-linesoft">
          {o.announcements.map((x) => (
            <div key={x.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[12.5px] font-bold text-ink">{x.title}</div>
                <span className="num text-[10.5px] text-sub">{x.date}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-sub">{x.body}</p>
              <div className="num mt-1.5 flex gap-3 text-[10.5px] text-sub">
                <span>{x.audience}</span><span>delivered <b className="text-ok">{x.delivered}</b></span><span>read <b className="text-info">{x.read}</b></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function Support() {
  const o = useOwner();
  const [tab, setTab] = useState("tickets");
  return (
    <>
      <PageHead title="Support Desk" sub="Customer tickets, assisted access and announcements">
        <Badge tone="warn">{o.tickets.filter((t) => t.status !== "resolved").length} open tickets</Badge>
      </PageHead>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "tickets", label: "Tickets", icon: "msg" },
        { id: "sessions", label: "Support Sessions", icon: "eye" },
        { id: "announce", label: "Announcements", icon: "send" },
      ]} />
      <div className="mt-4">
        {tab === "tickets" && <TicketsTab />}
        {tab === "sessions" && <SessionsTab />}
        {tab === "announce" && <AnnounceTab />}
      </div>
    </>
  );
}
