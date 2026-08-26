import React, { useEffect, useMemo, useState } from "react";
import { useOwner } from "./store";
import { downloadCSV } from "../store";
import { OwnerTenant, STATUS_META, TenantStatus, planById, moduleLabel, MODULE_REGISTRY, monthlyValue, fmtPKR } from "./data";
import { Badge, Btn, Card, Drawer, EmptyState, Field, I, Modal, PageHead, Pagination, QRSvg, Select, Tabs, tdCls, TextInput, thCls, Toggle } from "../components/ui";

const PER = 9;

function OnboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const o = useOwner();
  const [f, setF] = useState({ name: "", type: "School" as OwnerTenant["type"], ownerName: "", ownerEmail: "", mode: "trial" as "trial" | "paid", planId: "professional", trialDays: 14 });
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<OwnerTenant | null>(null);

  useEffect(() => { if (open) { setF({ name: "", type: "School", ownerName: "", ownerEmail: "", mode: "trial", planId: "professional", trialDays: 14 }); setErr(""); setCreated(null); } }, [open]);

  const submit = () => {
    if (f.name.trim().length < 3) return setErr("Institution name is required");
    if (f.ownerName.trim().length < 3) return setErr("Owner name is required");
    if (!/^\S+@\S+\.\S+$/.test(f.ownerEmail)) return setErr("Valid owner email is required");
    setErr("");
    const tn = o.createTenant({ name: f.name.trim(), type: f.type, planId: f.mode === "paid" ? f.planId : null, trialDays: f.trialDays, ownerName: f.ownerName.trim(), ownerEmail: f.ownerEmail.trim() });
    setCreated(tn);
  };

  return (
    <Modal open={open} onClose={onClose} title={created ? "Tenant provisioned ✓" : "Onboard School / Institute"} w="max-w-xl"
      footer={created
        ? <Btn icon="check" onClick={onClose}>Done</Btn>
        : <><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="plus" onClick={submit}>Create tenant</Btn></>}>
      {!created ? (
        <div className="space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Institution name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Sunrise Model School" /></Field>
            <Field label="Institution type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as OwnerTenant["type"] })}><option>School</option><option>College</option><option>Academy</option><option>Institute</option></Select></Field>
            <Field label="Owner full name"><TextInput value={f.ownerName} onChange={(e) => setF({ ...f, ownerName: e.target.value })} placeholder="Primary account holder" /></Field>
            <Field label="Owner business email"><TextInput value={f.ownerEmail} onChange={(e) => setF({ ...f, ownerEmail: e.target.value })} placeholder="owner@school.edu.pk" /></Field>
          </div>
          <Field label="Billing mode">
            <div className="flex gap-2">
              {(["trial", "paid"] as const).map((m) => (
                <button key={m} onClick={() => setF({ ...f, mode: m })} className={`flex-1 rounded-md border px-3 py-2 text-[12.5px] font-bold transition ${f.mode === m ? "border-[#0b1420] bg-[#0b1420] text-white" : "border-line bg-card text-sub"}`}>
                  {m === "trial" ? "Free trial" : "Paid plan"}
                </button>
              ))}
            </div>
          </Field>
          {f.mode === "trial" ? (
            <Field label="Trial duration"><Select value={String(f.trialDays)} onChange={(e) => setF({ ...f, trialDays: Number(e.target.value) })}><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></Select></Field>
          ) : (
            <Field label="Plan"><Select value={f.planId} onChange={(e) => setF({ ...f, planId: e.target.value })}><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option><option value="permanent">Lifetime License</option></Select></Field>
          )}
          {err && <p className="anim-pop rounded-md border border-danger/30 bg-dangersoft px-3 py-2 text-[12px] font-semibold text-danger">{err}</p>}
          <p className="rounded-md bg-infosoft px-3 py-2 text-[11.5px] text-info">Tenant ID, account number and owner credentials are generated automatically. The temporary password is shown once and never stored in plain text.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-ok/40 bg-oksoft p-4">
            <div className="font-display text-[15px] font-extrabold text-ink">{created.name} is live</div>
            <p className="mt-0.5 text-[12px] text-sub">Activation instructions emailed to {created.owner.email}. {created.status === "trial" ? `Trial runs ${created.trialDaysLeft} days.` : "License activated."}</p>
          </div>
          <div className="num grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-line bg-paper p-4 text-[12px]">
            <div><span className="block text-[10px] font-bold uppercase text-sub">Tenant ID</span><b>{created.id}</b></div>
            <div><span className="block text-[10px] font-bold uppercase text-sub">Account No</span><b>{created.accountNo}</b></div>
            <div><span className="block text-[10px] font-bold uppercase text-sub">School code</span><b>{created.code}-2026</b></div>
            <div><span className="block text-[10px] font-bold uppercase text-sub">Owner login</span><b>{created.owner.email}</b></div>
            <div className="col-span-2"><span className="block text-[10px] font-bold uppercase text-sub">Temp password (shown once)</span><b className="text-danger">Sch@{created.accountNo.slice(4)}!x</b></div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function TenantDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const o = useOwner();
  const t = o.tenants.find((x) => x.id === id);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [reveal, setReveal] = useState(false);
  const [impOpen, setImpOpen] = useState(false);
  const [imp, setImp] = useState({ reason: "", minutes: 30, readOnly: true });

  useEffect(() => { if (id) { setTab("overview"); setReveal(false); const tt = o.tenants.find((x) => x.id === id); setNote(tt?.notes ?? ""); } }, [id]); // eslint-disable-line
  if (!t) return null;
  const plan = planById(t.planId);
  const invoices = o.invoices.filter((i) => i.tenantId === t.id);
  const mrr = monthlyValue(t);

  const usageRows: [string, number, number, string][] = [
    ["Students / records", t.usage.students, t.limits.students, ""],
    ["Active users", t.usage.users, t.limits.users, ""],
    ["Campuses", t.usage.campuses, t.limits.campuses, ""],
    ["Storage (GB)", t.usage.storageGb, t.limits.storageGb, "GB"],
    ["SMS credits", t.usage.sms, t.limits.sms, ""],
    ["API calls / mo", t.usage.api, t.limits.api, ""],
  ];

  return (
    <>
      <Drawer open={!!id} onClose={onClose} w="max-w-3xl"
        title={<span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1420] font-display text-[13px] font-extrabold text-[#e8a226]">{t.shortName}</span>{t.name}<Badge tone={STATUS_META[t.status].tone} dot>{STATUS_META[t.status].label}</Badge></span>}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{t.type}</Badge>
          <Badge tone="neutral">{t.accountNo}</Badge>
          <Badge tone="neutral">Manager: {t.manager}</Badge>
          <Badge tone="primary">{plan ? plan.name : "No plan"}</Badge>
          {mrr > 0 && <Badge tone="ok">{fmtPKR(mrr)}/mo</Badge>}
          <span className="ml-auto flex gap-2">
            {t.status !== "suspended" && t.status !== "archived" && <Btn v="outline" sz="sm" icon="x" onClick={() => o.setTenantStatus(t.id, "suspended", "Suspended by operator")}>Suspend</Btn>}
            {["suspended", "expired", "grace"].includes(t.status) && <Btn v="soft" sz="sm" icon="refresh" onClick={() => o.setTenantStatus(t.id, "active_paid", "Restored by operator")}>Restore</Btn>}
          </span>
        </div>

        <Tabs value={tab} onChange={setTab} tabs={[
          { id: "overview", label: "Overview", icon: "grid" },
          { id: "license", label: "License", icon: "shield" },
          { id: "modules", label: "Modules", icon: "doc" },
          { id: "usage", label: "Usage", icon: "chart" },
          { id: "billing", label: "Billing", icon: "wallet" },
          { id: "timeline", label: "Timeline", icon: "clock" },
        ]} />

        {tab === "overview" && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card pad={false}>
              <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Customer owner</h4>
              <div className="space-y-2 p-4 text-[12.5px]">
                <div className="flex justify-between"><span className="text-sub">Name</span><b>{t.owner.name}</b></div>
                <div className="flex justify-between"><span className="text-sub">Email</span><b>{t.owner.email}</b></div>
                <div className="flex justify-between"><span className="text-sub">Phone</span><b className="num">{t.owner.phone}</b></div>
                <div className="flex items-center justify-between">
                  <span className="text-sub">CNIC</span>
                  <span className="num flex items-center gap-2">
                    <b>{reveal ? "35202-4817291-" + t.owner.cnicMasked.slice(-1) : t.owner.cnicMasked}</b>
                    <button onClick={() => { setReveal(!reveal); if (!reveal) o.audit("Sensitive field revealed", `${t.name} owner CNIC`, "Verification", "elevated"); }} className="text-[10.5px] font-bold text-primary underline-offset-2 hover:underline">{reveal ? "mask" : "reveal"}</button>
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-sub">Verified</span>{t.owner.verified ? <Badge tone="ok">yes</Badge> : <Badge tone="warn">pending</Badge>}</div>
                <div className="flex justify-between"><span className="text-sub">2FA</span>{t.owner.twoFA ? <Badge tone="ok">on</Badge> : <Badge tone="neutral">off</Badge>}</div>
                <div className="flex justify-between"><span className="text-sub">Last login</span><b className="num">{t.owner.lastLogin}</b></div>
              </div>
            </Card>
            <Card pad={false}>
              <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Commercial profile</h4>
              <div className="space-y-2 p-4 text-[12.5px]">
                <div className="flex justify-between"><span className="text-sub">Source</span><b>{t.source}</b></div>
                <div className="flex justify-between"><span className="text-sub">Created</span><b className="num">{t.createdAt}</b></div>
                <div className="flex justify-between"><span className="text-sub">Onboarding</span><b className="num">{t.onboarding}%</b></div>
                <div className="flex justify-between"><span className="text-sub">Last active</span><b className="num">{t.lastActive}</b></div>
                <div className="flex justify-between"><span className="text-sub">Health score</span><b className={`num ${t.health < 60 ? "text-warn" : "text-ok"}`}>{t.health}/100</b></div>
              </div>
              <div className="border-t border-linesoft p-4">
                <Field label="Internal note"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sales / owner note…" /></Field>
                <Btn v="soft" sz="sm" className="mt-2" icon="check" onClick={() => o.addNote(t.id, note)}>Save note</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "license" && (
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
            <Card pad={false}>
              <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">License {t.license.id}</h4>
              <div className="space-y-2 p-4 text-[12.5px]">
                <div className="flex justify-between"><span className="text-sub">Type</span><Badge tone="primary">{t.license.type}</Badge></div>
                <div className="flex justify-between"><span className="text-sub">Status</span><Badge tone={t.license.status === "active" ? "ok" : "danger"} dot>{t.license.status}</Badge></div>
                <div className="flex justify-between"><span className="text-sub">Activated</span><b className="num">{t.license.activatedOn}</b></div>
                <div className="flex justify-between"><span className="text-sub">Expires</span><b className="num">{t.license.expiresOn ?? "Never (lifetime)"}</b></div>
                {t.trialDaysLeft !== null && <div className="flex justify-between"><span className="text-sub">Trial days left</span><b className={`num ${t.trialDaysLeft <= 7 ? "text-warn" : "text-ink"}`}>{t.trialDaysLeft}</b></div>}
                <div className="num rounded-md bg-paper px-3 py-2 text-[11.5px]"><span className="text-sub">Key: </span><b>{t.license.key}</b></div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-linesoft p-4">
                {t.license.type === "trial" && <Btn v="soft" sz="sm" icon="clock" onClick={() => o.extendTrial(t.id, 7, "Operator extension")}>+7d trial</Btn>}
                {t.status === "trial" && <Btn v="accent" sz="sm" icon="cash" onClick={() => o.convertToPaid(t.id, t.planId ?? "professional", "monthly")}>Convert to paid</Btn>}
                {t.status === "active_paid" && <Btn v="soft" sz="sm" icon="refresh" onClick={() => o.renewLicense(t.id, 1)}>Renew +1mo</Btn>}
                <Btn v="danger" sz="sm" icon="alert" onClick={() => o.setTenantStatus(t.id, "revoked", "License revoked — requires reissue")}>Revoke</Btn>
              </div>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center">
              <QRSvg seed={t.license.key} size={110} />
              <p className="mt-2 text-[10.5px] text-sub">License certificate QR<br />verify.markaz.cloud</p>
            </Card>
          </div>
        )}

        {tab === "modules" && (
          <Card className="mt-4" pad={false}>
            <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
              <h4 className="font-display text-[13px] font-extrabold text-ink">Feature entitlement — {t.modules.length}/{MODULE_REGISTRY.length} enabled</h4>
              <Badge tone="neutral">source: {plan ? plan.name : "manual"}</Badge>
            </div>
            <div className="grid gap-x-6 p-4 md:grid-cols-2">
              {MODULE_REGISTRY.map((m) => {
                const on = t.modules.includes(m.key);
                return (
                  <div key={m.key} className="flex items-center justify-between border-b border-linesoft py-1.5 last:border-0">
                    <span className={`text-[12.5px] ${on ? "font-semibold text-ink" : "text-sub/70"}`}>{m.label}<span className="ml-1.5 text-[9.5px] uppercase text-sub/60">{m.group}</span></span>
                    <Toggle on={on} onChange={() => o.toggleModule(t.id, m.key)} />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tab === "usage" && (
          <div className="mt-4">
            <Card pad={false}>
              <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
                <h4 className="font-display text-[13px] font-extrabold text-ink">License consumption</h4>
                <Badge tone="info">aggregated only</Badge>
              </div>
              <div className="space-y-3 p-4">
                {usageRows.map(([label, used, max, unit]) => {
                  const pct = Math.min(100, (used / max) * 100);
                  return (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-[12px]"><span className="font-medium text-ink">{label}</span><span className="num text-sub">{used}{unit} / {max}{unit}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-linesoft"><div className="anim-growx h-full rounded-full" style={{ width: `${pct}%`, background: pct > 90 ? "var(--color-danger)" : pct > 75 ? "var(--color-accent)" : "#0e6b4e" }} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <p className="mt-3 flex items-start gap-2 rounded-md bg-infosoft px-3 py-2.5 text-[11.5px] text-info"><span className="mt-0.5"><I n="shield" size={13} /></span> Operational records (students, marks, fees, payroll) never leave the tenant environment. Only usage counters and license metadata are visible here.</p>
          </div>
        )}

        {tab === "billing" && (
          <Card className="mt-4" pad={false}>
            <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
              <h4 className="font-display text-[13px] font-extrabold text-ink">Invoices & payments</h4>
              <Btn v="soft" sz="sm" icon="plus" onClick={() => o.createInvoice(t.id, plan?.price ?? 15000, plan ? `${plan.name} subscription` : "Custom charge", "February 2026")}>New invoice</Btn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-paper"><tr><th className={thCls}>Invoice</th><th className={thCls}>Period</th><th className={thCls}>Amount</th><th className={thCls}>Status</th><th className={thCls}></th></tr></thead>
                <tbody>
                  {invoices.length === 0 && <tr><td colSpan={5} className={tdCls}><EmptyState icon="wallet" title="No invoices yet" body="Generate the first subscription invoice." /></td></tr>}
                  {invoices.map((i) => (
                    <tr key={i.id} className="border-t border-linesoft">
                      <td className={`${tdCls} num font-bold`}>{i.no}</td>
                      <td className={tdCls}>{i.period}</td>
                      <td className={`${tdCls} num font-semibold`}>{fmtPKR(i.amount)}</td>
                      <td className={tdCls}><Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "warn"} dot>{i.status}</Badge></td>
                      <td className={tdCls}>{i.status !== "paid" && <Btn v="soft" sz="xs" icon="cash" onClick={() => o.recordPayment(i.id, "Bank Transfer")}>Record payment</Btn>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "timeline" && (
          <Card className="mt-4">
            <div className="space-y-0">
              {[...t.timeline].reverse().map((e, i, arr) => (
                <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < arr.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-22px)] w-px bg-line" />}
                  <span className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${e.kind === "payment" ? "bg-oksoft text-ok" : e.kind === "status" ? "bg-dangersoft text-danger" : e.kind === "license" ? "bg-accentsoft text-[#8a5c07]" : "bg-primarysoft text-primarydeep"}`}>
                    <I n={e.kind === "payment" ? "cash" : e.kind === "status" ? "alert" : e.kind === "license" ? "shield" : "plus"} size={13} />
                  </span>
                  <div><div className="text-[12.5px] font-semibold text-ink">{e.text}</div><div className="num text-[10.5px] text-sub">{e.date}</div></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Drawer>

      <Modal open={impOpen} onClose={() => setImpOpen(false)} title="Open support session (impersonation)" w="max-w-md"
        footer={<><Btn v="outline" onClick={() => setImpOpen(false)}>Cancel</Btn><Btn v="danger" icon="eye" onClick={() => { if (imp.reason.trim().length < 5) { o.toast("Reason is required for elevated access", "danger"); return; } o.startImpersonation(t.id, imp.reason.trim(), imp.minutes, imp.readOnly); setImpOpen(false); }}>Start audited session</Btn></>}>
        <div className="space-y-3.5">
          <p className="rounded-md bg-warnsoft px-3 py-2 text-[11.5px] font-medium text-warn">Elevated access is exceptional, reason-logged and time-limited. Every action is recorded.</p>
          <Field label="Reason (required)"><TextInput value={imp.reason} onChange={(e) => setImp({ ...imp, reason: e.target.value })} placeholder="e.g. Debug fee challan generation" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration"><Select value={String(imp.minutes)} onChange={(e) => setImp({ ...imp, minutes: Number(e.target.value) })}><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min</option></Select></Field>
            <Field label="Access mode"><Select value={imp.readOnly ? "ro" : "rw"} onChange={(e) => setImp({ ...imp, readOnly: e.target.value === "ro" })}><option value="ro">Read-only</option><option value="rw">Write (needed)</option></Select></Field>
          </div>
        </div>
      </Modal>
      <div className="mt-4 flex justify-end">
        <Btn v="outline" sz="sm" icon="eye" onClick={() => setImpOpen(true)}>Open support session…</Btn>
      </div>
    </>
  );
}

export default function Tenants() {
  const o = useOwner();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [onboard, setOnboard] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return o.tenants.filter((x) => {
      if (status !== "all" && x.status !== status) return false;
      if (t && !(`${x.name} ${x.code} ${x.accountNo} ${x.owner.name} ${x.owner.email}`.toLowerCase().includes(t))) return false;
      return true;
    });
  }, [o.tenants, q, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const rows = filtered.slice((page - 1) * PER, page * PER);
  useEffect(() => setPage(1), [q, status]);

  return (
    <>
      <PageHead title="Schools & Tenants" sub={`${o.tenants.length} customer accounts · commercial metadata only`}>
        <Btn v="outline" sz="sm" icon="download" onClick={() => downloadCSV("tenants", filtered.map((x) => ({ tenant: x.name, code: x.code, account: x.accountNo, status: x.status, plan: planById(x.planId)?.name ?? "—", mrr: monthlyValue(x), students: x.usage.students, manager: x.manager })))}>Export CSV</Btn>
        <Btn sz="sm" icon="plus" onClick={() => setOnboard(true)}>Onboard School</Btn>
      </PageHead>

      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-linesoft p-3">
          <div className="relative min-w-[240px] flex-1">
            <I n="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, code, account no, owner…" className="pl-8" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-44">
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_META) as TenantStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </Select>
          <span className="num ml-auto text-[11.5px] text-sub">{filtered.length} found</span>
        </div>
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon="building" title="No tenants match" body="Adjust search or filters." action={<Btn v="soft" sz="sm" onClick={() => { setQ(""); setStatus("all"); }}>Clear</Btn>} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-paper"><tr>
                <th className={thCls}>Tenant</th><th className={thCls}>Status</th><th className={thCls}>Plan</th>
                <th className={thCls}>MRR</th><th className={thCls}>Students</th><th className={thCls}>Health</th><th className={thCls}>Last active</th>
              </tr></thead>
              <tbody>
                {rows.map((x) => {
                  const plan = planById(x.planId);
                  const mrr = monthlyValue(x);
                  return (
                    <tr key={x.id} onClick={() => setOpenId(x.id)} className="cursor-pointer border-t border-linesoft transition hover:bg-primarysoft/40">
                      <td className={tdCls}>
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1420] font-display text-[11px] font-extrabold text-[#e8a226]">{x.shortName}</span>
                          <span><span className="block font-bold text-ink">{x.name}</span><span className="num text-[10.5px] text-sub">{x.accountNo} · {x.type}</span></span>
                        </span>
                      </td>
                      <td className={tdCls}><Badge tone={STATUS_META[x.status].tone} dot>{STATUS_META[x.status].label}</Badge></td>
                      <td className={tdCls}><span className="font-medium">{plan?.name ?? "—"}</span></td>
                      <td className={`${tdCls} num font-bold`}>{mrr ? fmtPKR(mrr) : "—"}</td>
                      <td className={`${tdCls} num`}>{x.usage.students} / {x.limits.students}</td>
                      <td className={tdCls}><span className={`num font-bold ${x.health < 60 ? "text-warn" : "text-ok"}`}>{x.health}</span></td>
                      <td className={`${tdCls} num text-sub`}>{x.lastActive}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} />
      </Card>

      <TenantDrawer id={openId} onClose={() => setOpenId(null)} />
      <OnboardModal open={onboard} onClose={() => setOnboard(false)} />
    </>
  );
}
