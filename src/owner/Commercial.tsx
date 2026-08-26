import React, { useMemo, useState } from "react";
import { useOwner } from "./store";
import { downloadCSV } from "../store";
import { OWNER_PLANS, OWNER_ADDONS, STATUS_META, planById, fmtPKR, fmtLakh, monthlyValue, moduleLabel } from "./data";
import { Badge, Btn, Card, EmptyState, I, PageHead, Tabs, tdCls, thCls } from "../components/ui";

function PlansTab() {
  const o = useOwner();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {OWNER_PLANS.map((p) => {
        const count = o.tenants.filter((t) => t.planId === p.id).length;
        return (
          <Card key={p.id} className={`relative flex flex-col ${p.popular ? "!border-[#e8a226]" : ""}`}>
            {p.popular && <span className="absolute right-3 top-3 rounded-full bg-[#e8a226] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0b1420]">Most sold</span>}
            <div className="font-display text-[16px] font-extrabold text-ink">{p.name}</div>
            <div className="num mt-1 font-display text-[26px] font-black text-[#0b1420]">{fmtPKR(p.price)}<span className="text-[12px] font-semibold text-sub"> /{p.interval === "one-time" ? "once" : p.interval === "annual" ? "yr" : "mo"}</span></div>
            <div className="num mt-0.5 text-[11px] text-sub">Setup {fmtPKR(p.setup)} · {count} tenant{count === 1 ? "" : "s"}</div>
            <div className="mt-3 space-y-1.5 border-t border-linesoft pt-3 text-[12px]">
              <div className="flex justify-between"><span className="text-sub">Students</span><b className="num">{p.students.toLocaleString()}</b></div>
              <div className="flex justify-between"><span className="text-sub">Users</span><b className="num">{p.users}</b></div>
              <div className="flex justify-between"><span className="text-sub">Campuses</span><b className="num">{p.campuses}</b></div>
              <div className="flex justify-between"><span className="text-sub">Storage</span><b className="num">{p.storageGb} GB</b></div>
              <div className="flex justify-between"><span className="text-sub">Support</span><b>{p.support}</b></div>
              <div className="flex justify-between"><span className="text-sub">White-label</span>{p.whiteLabel ? <Badge tone="ok">yes</Badge> : <Badge tone="neutral">no</Badge>}</div>
              <div className="flex justify-between"><span className="text-sub">Custom domain</span>{p.customDomain ? <Badge tone="ok">yes</Badge> : <Badge tone="neutral">no</Badge>}</div>
            </div>
            <div className="mt-3 border-t border-linesoft pt-3">
              <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-sub">{p.modules.length} modules included</div>
              <div className="flex flex-wrap gap-1">
                {p.modules.slice(0, 6).map((m) => <Badge key={m} tone="neutral">{moduleLabel(m)}</Badge>)}
                {p.modules.length > 6 && <Badge tone="primary">+{p.modules.length - 6} more</Badge>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function LicensesTab() {
  const o = useOwner();
  const trials = o.tenants.filter((t) => t.status === "trial" || t.status === "trial_expiring");
  const licensed = o.tenants.filter((t) => t.status !== "pending");
  return (
    <div className="space-y-4">
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Trial engine — {trials.length} running</h3>
          <Badge tone="warn">auto-expiry armed</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-paper"><tr><th className={thCls}>Tenant</th><th className={thCls}>Trial package</th><th className={thCls}>Days left</th><th className={thCls}>Expires</th><th className={thCls}>Actions</th></tr></thead>
            <tbody>
              {trials.length === 0 && <tr><td colSpan={5} className={tdCls}><EmptyState icon="clock" title="No active trials" body="Onboard a school with a free trial to see it here." /></td></tr>}
              {trials.map((t) => {
                const expiring = (t.trialDaysLeft ?? 0) <= 7;
                return (
                  <tr key={t.id} className="border-t border-linesoft">
                    <td className={tdCls}><span className="font-bold text-ink">{t.name}</span><span className="block num text-[10.5px] text-sub">{t.accountNo}</span></td>
                    <td className={tdCls}>{planById(t.planId)?.name ?? "Trial package"}</td>
                    <td className={tdCls}><Badge tone={expiring ? "warn" : "info"} dot>{t.trialDaysLeft}d</Badge></td>
                    <td className={`${tdCls} num`}>{t.license.expiresOn}</td>
                    <td className={tdCls}>
                      <span className="flex gap-1.5">
                        <Btn v="outline" sz="xs" icon="clock" onClick={() => o.extendTrial(t.id, 7, "Operator extension")}>+7d</Btn>
                        <Btn v="accent" sz="xs" icon="cash" onClick={() => o.convertToPaid(t.id, t.planId ?? "professional", "monthly")}>Convert</Btn>
                        <Btn v="ghost" sz="xs" icon="x" onClick={() => o.setTenantStatus(t.id, "cancelled", "Trial cancelled early")}>Cancel</Btn>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">All licenses — {licensed.length}</h3>
          <Btn v="outline" sz="sm" icon="download" onClick={() => downloadCSV("licenses", licensed.map((t) => ({ tenant: t.name, license: t.license.id, type: t.license.type, key: t.license.key, status: t.license.status, expires: t.license.expiresOn ?? "lifetime" })))}>Export</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-paper"><tr><th className={thCls}>License</th><th className={thCls}>Tenant</th><th className={thCls}>Type</th><th className={thCls}>Status</th><th className={thCls}>Expires</th><th className={thCls}></th></tr></thead>
            <tbody>
              {licensed.map((t) => (
                <tr key={t.id} className="border-t border-linesoft">
                  <td className={`${tdCls} num font-bold`}>{t.license.id}</td>
                  <td className={tdCls}><span className="font-semibold">{t.name}</span><span className="block num text-[10.5px] text-sub">{t.license.key}</span></td>
                  <td className={tdCls}><Badge tone={t.license.type === "permanent" ? "accent" : t.license.type === "trial" ? "info" : "primary"}>{t.license.type}</Badge></td>
                  <td className={tdCls}><Badge tone={STATUS_META[t.status].tone} dot>{STATUS_META[t.status].label}</Badge></td>
                  <td className={`${tdCls} num`}>{t.license.expiresOn ?? "Never"}</td>
                  <td className={tdCls}>
                    {t.status === "active_paid" && <Btn v="soft" sz="xs" icon="refresh" onClick={() => o.renewLicense(t.id, 1)}>Renew</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BillingTab() {
  const o = useOwner();
  const paid = o.invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.paidAmount, 0);
  const outstanding = o.invoices.filter((i) => i.status !== "paid" && i.status !== "refunded").reduce((a, b) => a + b.amount, 0);
  return (
    <div className="space-y-4">
      <div className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[["Collected", fmtLakh(paid), "text-ok"], ["Outstanding", fmtLakh(outstanding), "text-danger"], ["Invoices", String(o.invoices.length), "text-ink"], ["Overdue", String(o.invoices.filter((i) => i.status === "overdue").length), "text-warn"]].map(([l, v, tc]) => (
          <Card key={l} className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">{l}</div><div className={`num font-display text-[20px] font-extrabold ${tc}`}>{v}</div></Card>
        ))}
      </div>
      <Card pad={false}>
        <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Commercial invoices</h3>
          <Btn v="outline" sz="sm" icon="download" onClick={() => downloadCSV("invoices", o.invoices.map((i) => ({ invoice: i.no, tenant: o.tenants.find((t) => t.id === i.tenantId)?.name ?? "", period: i.period, amount: i.amount, status: i.status, method: i.method })))}>Export</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-paper"><tr><th className={thCls}>Invoice</th><th className={thCls}>Tenant</th><th className={thCls}>Period</th><th className={thCls}>Amount</th><th className={thCls}>Method</th><th className={thCls}>Status</th><th className={thCls}></th></tr></thead>
            <tbody>
              {o.invoices.map((i) => {
                const t = o.tenants.find((x) => x.id === i.tenantId);
                return (
                  <tr key={i.id} className="border-t border-linesoft">
                    <td className={`${tdCls} num font-bold`}>{i.no}</td>
                    <td className={tdCls}><span className="font-semibold">{t?.name ?? "—"}</span></td>
                    <td className={tdCls}>{i.period}</td>
                    <td className={`${tdCls} num font-bold`}>{fmtPKR(i.amount)}</td>
                    <td className={`${tdCls} text-sub`}>{i.method}</td>
                    <td className={tdCls}><Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "warn"} dot>{i.status}</Badge></td>
                    <td className={tdCls}>{i.status !== "paid" && i.status !== "refunded" && <Btn v="soft" sz="xs" icon="cash" onClick={() => o.recordPayment(i.id, "Bank Transfer")}>Mark paid</Btn>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AddonsTab() {
  const o = useOwner();
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {OWNER_ADDONS.map((a) => (
        <Card key={a.id} className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="font-display text-[14.5px] font-extrabold text-ink">{a.name}</div>
            <Badge tone={a.recurring ? "primary" : "neutral"}>{a.recurring ? "recurring" : "one-time"}</Badge>
          </div>
          <p className="mt-1 flex-1 text-[12px] text-sub">{a.desc}</p>
          <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3">
            <span className="num font-display text-[17px] font-black text-[#0b1420]">{fmtPKR(a.price)}{a.recurring ? "/mo" : ""}</span>
            <Badge tone="ok">{a.adoption} tenants</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function Commercial() {
  const o = useOwner();
  const [tab, setTab] = useState("plans");
  const mrr = useMemo(() => o.tenants.filter((t) => t.status === "active_paid").reduce((a, t) => a + monthlyValue(t), 0), [o.tenants]);
  return (
    <>
      <PageHead title="Plans · Licenses · Billing" sub={`Commercial engine · MRR ${fmtLakh(mrr)}`}>
        <Badge tone="primary">{o.tenants.filter((t) => t.status === "active_paid").length} paying</Badge>
      </PageHead>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "plans", label: "Plans & Packages", icon: "grid" },
        { id: "licenses", label: "Licenses & Trials", icon: "shield" },
        { id: "billing", label: "Billing & Invoices", icon: "wallet" },
        { id: "addons", label: "Add-ons", icon: "plus" },
      ]} />
      <div className="mt-4">
        {tab === "plans" && <PlansTab />}
        {tab === "licenses" && <LicensesTab />}
        {tab === "billing" && <BillingTab />}
        {tab === "addons" && <AddonsTab />}
      </div>
    </>
  );
}
