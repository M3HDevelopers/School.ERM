import React, { useEffect, useMemo, useState } from "react";
import { balanceOf, downloadCSV, printNow, studentById, useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, Donut, EmptyState, Field, I, Modal, PageHead, Pagination, QRSvg, Seg, Select, Tabs, tdCls, TextInput, thCls, VBars } from "../components/ui";

const PER = 8;
const ST_TONES: Record<S.VoucherStatus, string> = { paid: "ok", partial: "warn", overdue: "danger", generated: "info", waived: "neutral" };

function SchoolHeader() {
  const app = useApp();
  return (
    <div className="flex items-center gap-3 border-b-2 border-side pb-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent"><I n="cap" size={24} className="text-side" /></span>
      <div className="flex-1">
        <div className="font-display text-[17px] font-extrabold leading-tight text-ink">{app.school.name}</div>
        <div className="text-[10.5px] text-sub">{app.school.address} · {app.school.phone} · {app.school.email}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold uppercase tracking-widest text-sub">Session {app.school.session}</div>
        <div className="num text-[11px] font-semibold text-ink">TIN 77-4412-889-0</div>
      </div>
    </div>
  );
}

/* ---- printable challan ---- */
function ChallanPreview({ voucherId, onClose }: { voucherId: string | null; onClose: () => void }) {
  const app = useApp();
  const v = app.vouchers.find((x) => x.id === voucherId);
  const stu = v ? studentById(app.students, v.studentId) : null;
  if (!v || !stu) return null;
  const bal = balanceOf(v);
  return (
    <Modal open onClose={onClose} title={`Challan ${v.no}`} w="max-w-2xl"
      footer={<><Btn v="outline" onClick={onClose}>Close</Btn><Btn v="accent" icon="print" onClick={printNow}>Print / Save PDF</Btn></>}>
      <div className="print-stage rounded-lg border border-line bg-white p-6">
        <SchoolHeader />
        <div className="mt-3 flex items-center justify-between">
          <div className="font-display text-[14px] font-extrabold uppercase tracking-wide text-primarydeep">Monthly Fee Challan</div>
          <div className="num rounded bg-linesoft px-2.5 py-1 text-[12px] font-bold text-ink">{v.no}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-4">
          {[["Student", stu.name], ["Admission No", stu.admNo], ["Class", `${S.className(stu.classId)}-${stu.section}`], ["Roll", String(stu.roll)],
          ["Billing month", S.monthLabel(v.month)], ["Due date", S.fmtDate(v.due)], ["Guardian", stu.guardianName], ["Phone", stu.phone]].map(([k, val]) => (
            <div key={k}><span className="block text-[9.5px] font-bold uppercase tracking-wider text-sub">{k}</span><span className="num font-semibold text-ink">{val}</span></div>
          ))}
        </div>
        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead><tr className="bg-side text-left text-white">
            <th className="px-3 py-2 font-bold">Head</th><th className="px-3 py-2 text-right font-bold">Amount (PKR)</th>
          </tr></thead>
          <tbody>
            {v.items.map((it) => (
              <tr key={it.label} className="border-b border-linesoft"><td className="px-3 py-1.5 text-ink">{it.label}</td><td className="num px-3 py-1.5 text-right font-semibold text-ink">{it.amount.toLocaleString()}</td></tr>
            ))}
            {v.lateFee > 0 && <tr className="border-b border-linesoft"><td className="px-3 py-1.5 font-semibold text-danger">Late fee</td><td className="num px-3 py-1.5 text-right font-semibold text-danger">{v.lateFee.toLocaleString()}</td></tr>}
            {v.paid > 0 && <tr className="border-b border-linesoft"><td className="px-3 py-1.5 font-semibold text-ok">Already paid</td><td className="num px-3 py-1.5 text-right font-semibold text-ok">− {v.paid.toLocaleString()}</td></tr>}
            <tr className="bg-paper"><td className="px-3 py-2 font-extrabold text-ink">Net payable</td><td className="num px-3 py-2 text-right font-display text-[15px] font-extrabold text-primarydeep">{bal.toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="text-[10px] leading-relaxed text-sub">
            Pay at any <b className="text-ink">HBL branch</b> (free of cost) or the school office, Mon–Sat 8am–2pm.<br />
            After due date a late fee of Rs 200 applies. Please retain the duplicate copy.
          </div>
          <div className="flex items-center gap-3">
            <QRSvg seed={v.no} size={64} />
            <div className={`rotate-[-8deg] rounded border-2 px-2.5 py-1 font-display text-[13px] font-black tracking-widest ${v.status === "paid" ? "border-ok text-ok" : "border-line text-sub/50"}`}>
              {v.status === "paid" ? "PAID" : v.status === "partial" ? "PARTIAL" : "UNPAID"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---- receive payment ---- */
function ReceiveModal({ voucherId, onClose, onReceipt }: { voucherId: string | null; onClose: () => void; onReceipt: (p: S.Payment) => void }) {
  const app = useApp();
  const v = app.vouchers.find((x) => x.id === voucherId);
  const stu = v ? studentById(app.students, v.studentId) : null;
  const isPortalUser = app.session?.role === "parent" || app.session?.role === "student";
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<S.Payment["method"]>("cash");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (v) { setAmount(balanceOf(v)); setMethod(isPortalUser ? "online" : "cash"); setErr(""); }
  }, [voucherId]); // eslint-disable-line
  if (!v || !stu) return null;
  const bal = balanceOf(v);
  const submit = () => {
    if (amount <= 0) return setErr("Enter an amount greater than zero");
    if (amount > bal) return setErr(`Amount exceeds balance of ${S.fmtRs(bal)}`);
    const p = app.postPayment(v.id, amount, method);
    app.toast(`Payment of ${S.fmtRs(amount)} posted · receipt ${p.receiptNo} ${method === "cash" ? "printed at counter" : "emailed to guardian"}`);
    onClose();
    onReceipt(p);
  };
  return (
    <Modal open onClose={onClose} title="Receive Payment" w="max-w-md"
      footer={<><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="cash" onClick={submit}>{isPortalUser ? "Pay online" : "Post payment"}</Btn></>}>
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-linesoft bg-paper p-3">
        <Avatar name={stu.name} size={38} />
        <div className="flex-1">
          <div className="text-[13.5px] font-extrabold text-ink">{stu.name}</div>
          <div className="num text-[11px] text-sub">{v.no} · {S.monthLabel(v.month)}</div>
        </div>
        <div className="text-right">
          <div className="num text-[15px] font-extrabold text-danger">{S.fmtRs(bal)}</div>
          <div className="text-[10px] uppercase tracking-wide text-sub">balance</div>
        </div>
      </div>
      <div className="space-y-3.5">
        <Field label="Amount (PKR)" err={err}>
          <TextInput type="number" className="num !text-[15px] font-bold" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Btn v="outline" sz="xs" onClick={() => setAmount(bal)}>Full {S.fmtRs(bal)}</Btn>
          <Btn v="outline" sz="xs" onClick={() => setAmount(Math.round(bal / 2))}>Half</Btn>
          {v.status === "partial" && <Badge tone="warn">partial — {S.fmtRs(v.paid)} already received</Badge>}
        </div>
        <Field label={isPortalUser ? "Payment channel" : "Payment method"}>
          {isPortalUser ? (
            <div className="rounded-md border border-line bg-paper px-3 py-2.5 text-[12.5px] font-semibold text-ink">
              <I n="shield" size={13} className="mr-1.5 inline text-primary" /> 1Link / bank transfer adapter (demo — no real charge)
            </div>
          ) : (
            <Seg value={method} onChange={setMethod} options={[{ id: "cash", label: "Cash" }, { id: "bank", label: "Bank" }, { id: "online", label: "Online" }]} />
          )}
        </Field>
        <p className="rounded-md bg-infosoft px-3 py-2 text-[11.5px] font-medium text-info">
          Posting will update the student ledger, mark the challan {amount >= bal ? "PAID" : "PARTIAL"} and notify the guardian.
        </p>
      </div>
    </Modal>
  );
}

/* ---- printable receipt ---- */
function ReceiptModal({ payment, onClose }: { payment: S.Payment | null; onClose: () => void }) {
  const app = useApp();
  if (!payment) return null;
  const stu = studentById(app.students, payment.studentId);
  return (
    <Modal open onClose={onClose} title={`Receipt ${payment.receiptNo}`} w="max-w-md"
      footer={<><Btn v="outline" onClick={onClose}>Close</Btn><Btn v="accent" icon="print" onClick={printNow}>Print receipt</Btn></>}>
      <div className="print-stage rounded-lg border border-line bg-white p-5">
        <SchoolHeader />
        <div className="mt-3 flex items-center justify-between">
          <div className="font-display text-[13px] font-extrabold uppercase tracking-wide text-primarydeep">Payment Receipt</div>
          <div className="num rounded bg-oksoft px-2 py-0.5 text-[11.5px] font-bold text-ok">{payment.receiptNo}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[12px]">
          {[["Received from", stu?.guardianName ?? "—"], ["Student", `${stu?.name} (${stu?.admNo})`], ["Class", stu ? `${S.className(stu.classId)}-${stu.section}` : "—"],
          ["Method", payment.method.toUpperCase()], ["Cashier", payment.cashier], ["Date", S.fmtDate(payment.date)]].map(([k, val]) => (
            <div key={k}><span className="block text-[9.5px] font-bold uppercase tracking-wider text-sub">{k}</span><span className="font-semibold text-ink">{val}</span></div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-primarysoft p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Amount received</div>
          <div className="num font-display text-[26px] font-black text-primarydeep">{S.fmtRs(payment.amount)}</div>
        </div>
        <p className="mt-3 text-center text-[10px] text-sub">Thank you — this is a computer-generated receipt of {app.school.name}.</p>
      </div>
    </Modal>
  );
}

/* ================= main page ================= */
export default function Fees() {
  const app = useApp();
  const role = app.session?.role ?? "admin";
  const portalUser = role === "parent" || role === "student";
  const myIds = role === "parent" ? S.PARENT_CHILDREN : role === "student" ? [S.DEMO_STUDENT] : null;

  const [tab, setTab] = useState(portalUser ? "challans" : "challans");
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [monthF, setMonthF] = useState("all");
  const [stuF, setStuF] = useState("all");
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<S.Payment | null>(null);
  const [gen, setGen] = useState({ classId: "g9", section: "A", month: S.monthKey(0) });
  const [genBusy, setGenBusy] = useState(false);

  useEffect(() => {
    if (app.nav.params?.tab) setTab(app.nav.params.tab);
    if (app.nav.params?.f) setStatusF(app.nav.params.f);
    if (app.nav.params?.student) setStuF(app.nav.params.student);
  }, [app.nav.params]);

  const vouchers = useMemo(() => {
    const t = q.trim().toLowerCase();
    return app.vouchers
      .filter((v) => !myIds || myIds.includes(v.studentId))
      .filter((v) => (stuF === "all" || v.studentId === stuF))
      .filter((v) => (monthF === "all" || v.month === monthF))
      .filter((v) => (statusF === "all" || v.status === statusF))
      .filter((v) => {
        if (!t) return true;
        const stu = studentById(app.students, v.studentId);
        return `${v.no} ${stu?.name} ${stu?.admNo}`.toLowerCase().includes(t);
      })
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [app.vouchers, app.students, q, statusF, monthF, stuF, myIds]);

  const pages = Math.max(1, Math.ceil(vouchers.length / PER));
  const rows = vouchers.slice((page - 1) * PER, page * PER);
  useEffect(() => setPage(1), [q, statusF, monthF, stuF]);

  const curMonth = S.monthKey(0);
  const scope = app.vouchers.filter((v) => !myIds || myIds.includes(v.studentId));
  const collected = (myIds ? 0 : 918000) + scope.filter((v) => v.month === curMonth).reduce((a, v) => a + v.paid, 0);
  const outstanding = (myIds ? 0 : 132000) + scope.filter((v) => v.status !== "paid" && v.status !== "waived").reduce((a, v) => a + balanceOf(v), 0);
  const overdueCount = scope.filter((v) => v.status === "overdue").length;
  const byMethod = (["cash", "bank", "online"] as const).map((m, i) => ({
    label: m[0].toUpperCase() + m.slice(1),
    value: app.payments.filter((p) => p.method === m && (!myIds || myIds.includes(p.studentId))).reduce((a, p) => a + p.amount, 0),
    color: ["var(--color-primary)", "var(--color-info)", "var(--color-accent)"][i],
  }));
  const defaulters = app.students
    .map((s) => ({ s, due: app.vouchers.filter((v) => v.studentId === s.id && v.status !== "paid" && v.status !== "waived").reduce((a, v) => a + balanceOf(v), 0) }))
    .filter((x) => x.due > 0).sort((a, b) => b.due - a.due);

  const runGenerate = () => {
    setGenBusy(true);
    setTimeout(() => {
      const n = app.generateChallans(gen.classId, gen.section, gen.month);
      setGenBusy(false);
      app.toast(n > 0 ? `${n} challans generated for ${S.className(gen.classId)}-${gen.section} · parents notified via app + SMS` : "All students in this section already have challans for the month", n > 0 ? "ok" : "info");
      if (n > 0) { setTab("challans"); setMonthF(gen.month); setStatusF("all"); }
    }, 900);
  };

  const tabs = [
    { id: "challans", label: "Challans", icon: "doc" },
    { id: "receipts", label: "Receipts", icon: "cash" },
    ...(portalUser ? [] : [
      { id: "generate", label: "Challan Generator", icon: "refresh" },
      { id: "reports", label: "Collection Reports", icon: "chart" },
    ]),
  ];

  return (
    <>
      <PageHead title="Fees & Collection" sub={portalUser ? "Your challans, payments and receipts" : `Challan engine · ${S.monthLabel(curMonth)}`}>
        {!portalUser && <Btn v="outline" sz="sm" icon="download" onClick={() => downloadCSV(`challans-${S.todayISO()}`, vouchers.map((v) => { const st = studentById(app.students, v.studentId); return { challan: v.no, student: st?.name ?? "", adm_no: st?.admNo ?? "", month: v.month, total: v.total, paid: v.paid, balance: balanceOf(v), status: v.status }; }))}>Export CSV</Btn>}
      </PageHead>

      {/* stat strip */}
      <div className="stagger mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { l: "Collected · this month", v: S.fmtRs(collected), tone: "text-primarydeep", ic: "cash", s: "target Rs 15.5L" },
          { l: "Outstanding", v: S.fmtRs(outstanding), tone: "text-danger", ic: "alert", s: `${scope.filter((v) => v.status === "partial" || v.status === "generated" || v.status === "overdue").length} open challans` },
          { l: "Overdue challans", v: String(overdueCount), tone: "text-warn", ic: "clock", s: "Rs 200 late fee applies" },
          { l: "Receipts today", v: String(app.payments.filter((p) => p.date === S.todayISO()).length), tone: "text-info", ic: "doc", s: `last: ${app.payments[0]?.receiptNo ?? "—"}` },
        ].map((k) => (
          <Card key={k.l} className="!p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-sub">{k.l}</span>
              <I n={k.ic} size={15} className="text-sub" />
            </div>
            <div className={`num mt-1 font-display text-[20px] font-extrabold ${k.tone}`}>{k.v}</div>
            <div className="text-[11px] text-sub">{k.s}</div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === "challans" && (
        <Card pad={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-linesoft p-3">
            <div className="relative min-w-[200px] flex-1">
              <I n="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
              <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search challan no or student…" className="pl-8" />
            </div>
            <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="!w-36">
              <option value="all">All statuses</option><option value="generated">Generated</option><option value="partial">Partial</option>
              <option value="paid">Paid</option><option value="overdue">Overdue</option><option value="waived">Waived</option>
            </Select>
            <Select value={monthF} onChange={(e) => setMonthF(e.target.value)} className="!w-40">
              <option value="all">All months</option>
              {[-3, -2, -1, 0].map((o) => { const mk = S.monthKey(o); return <option key={mk} value={mk}>{S.monthLabel(mk)}</option>; })}
            </Select>
            {!portalUser && (
              <Select value={stuF} onChange={(e) => setStuF(e.target.value)} className="!w-40">
                <option value="all">All students</option>
                {app.students.slice(0, 30).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            )}
          </div>
          {rows.length === 0 ? (
            <div className="p-6"><EmptyState icon="doc" title="No challans found" body="Adjust filters or generate a new batch from the Challan Generator." action={!portalUser ? <Btn v="soft" sz="sm" onClick={() => setTab("generate")}>Open generator</Btn> : undefined} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead className="bg-paper"><tr>
                  <th className={thCls}>Challan</th><th className={thCls}>Student</th><th className={thCls}>Month</th>
                  <th className={thCls}>Payable</th><th className={thCls}>Paid</th><th className={thCls}>Balance</th><th className={thCls}>Due</th><th className={thCls}>Status</th><th className={thCls}></th>
                </tr></thead>
                <tbody>
                  {rows.map((v) => {
                    const stu = studentById(app.students, v.studentId);
                    const bal = balanceOf(v);
                    return (
                      <tr key={v.id} className="border-t border-linesoft transition hover:bg-primarysoft/40">
                        <td className={`${tdCls} num font-bold text-ink`}>{v.no}</td>
                        <td className={tdCls}><span className="flex items-center gap-2"><Avatar name={stu?.name ?? "?"} size={26} /><span><span className="block font-semibold">{stu?.name}</span><span className="num text-[10px] text-sub">{stu ? `${S.className(stu.classId)}-${stu.section}` : ""}</span></span></span></td>
                        <td className={`${tdCls} text-sub`}>{S.monthShort(v.month)} {v.month.slice(0, 4)}</td>
                        <td className={`${tdCls} num font-semibold`}>{S.fmtRs(v.total + v.lateFee)}</td>
                        <td className={`${tdCls} num text-ok`}>{v.paid ? S.fmtRs(v.paid) : "—"}</td>
                        <td className={`${tdCls} num font-bold ${bal > 0 ? "text-danger" : "text-sub"}`}>{bal > 0 ? S.fmtRs(bal) : "—"}</td>
                        <td className={`${tdCls} num text-sub`}>{S.fmtDate(v.due)}</td>
                        <td className={tdCls}><Badge tone={ST_TONES[v.status]} dot>{v.status}</Badge></td>
                        <td className={tdCls}>
                          <span className="flex justify-end gap-1.5">
                            <Btn v="outline" sz="xs" icon="eye" onClick={() => setViewId(v.id)}>View</Btn>
                            {bal > 0 && v.status !== "waived" && <Btn sz="xs" icon="cash" onClick={() => setPayId(v.id)}>{portalUser ? "Pay" : "Receive"}</Btn>}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pages={pages} onPage={setPage} total={vouchers.length} />
        </Card>
      )}

      {tab === "receipts" && (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="bg-paper"><tr>
                <th className={thCls}>Receipt</th><th className={thCls}>Date</th><th className={thCls}>Student</th>
                <th className={thCls}>Method</th><th className={thCls}>Cashier</th><th className={thCls}>Amount</th>
              </tr></thead>
              <tbody>
                {app.payments.filter((p) => !myIds || myIds.includes(p.studentId)).slice(0, 14).map((p) => {
                  const stu = studentById(app.students, p.studentId);
                  return (
                    <tr key={p.id} className="border-t border-linesoft transition hover:bg-linesoft/60">
                      <td className={`${tdCls} num font-bold text-primarydeep`}>{p.receiptNo}</td>
                      <td className={`${tdCls} num text-sub`}>{S.fmtDate(p.date)}</td>
                      <td className={tdCls}><span className="font-semibold">{stu?.name}</span><span className="num text-[10.5px] text-sub"> · {stu?.admNo}</span></td>
                      <td className={tdCls}><Badge tone={p.method === "cash" ? "primary" : p.method === "bank" ? "info" : "accent"}>{p.method}</Badge></td>
                      <td className={`${tdCls} text-sub`}>{p.cashier}</td>
                      <td className={`${tdCls} num font-extrabold text-ink`}>{S.fmtRs(p.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "generate" && !portalUser && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="font-display text-[15px] font-extrabold text-ink">Monthly batch generator</h3>
            <p className="mt-0.5 text-[12.5px] text-sub">Applies class fee plans automatically, skips existing challans, then notifies parents.</p>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
              <Field label="Class"><Select value={gen.classId} onChange={(e) => setGen({ ...gen, classId: e.target.value })}>{S.CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
              <Field label="Section"><Select value={gen.section} onChange={(e) => setGen({ ...gen, section: e.target.value })}>{S.SECTIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="Billing month"><Select value={gen.month} onChange={(e) => setGen({ ...gen, month: e.target.value })}>{[0, 1].map((o) => { const mk = S.monthKey(o); return <option key={mk} value={mk}>{S.monthLabel(mk)}</option>; })}</Select></Field>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-line bg-paper p-4 text-[12.5px] text-sub">
              <b className="text-ink">Preview:</b> {S.className(gen.classId)}-{gen.section} · {S.planFor(gen.classId).label} plan →
              tuition {S.fmtRs(S.planFor(gen.classId).tuition)} + lab & activity Rs 300 = <b className="num text-primarydeep">{S.fmtRs(S.planFor(gen.classId).tuition + 300)}</b> per student.
              <br />{app.students.filter((s) => s.classId === gen.classId && s.section === gen.section && s.status === "active").length} active students in section · due on 10th of the month.
            </div>
            <Btn className="mt-4 w-full !py-2.5" icon="refresh" disabled={genBusy} onClick={runGenerate}>
              {genBusy ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generating & notifying…</>) : "Generate challans"}
            </Btn>
          </Card>
          <Card>
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">How the monthly workflow runs</h3>
            <ol className="space-y-2.5">
              {["Generate dues → fee plans & discounts applied", "Unique challan numbers issued per student", "Parents notified via app + SMS with due date", "Payment received at counter or bank branch", "Receipt posted → ledger & challan status updated", "Day closed → deposit slip → collection report"].map((st, i) => (
                <li key={st} className="flex items-start gap-2.5">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primarysoft font-display text-[11px] font-extrabold text-primarydeep">{i + 1}</span>
                  <span className="text-[12.5px] leading-relaxed text-ink">{st}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-md bg-accentsoft px-3 py-2.5 text-[11.5px] font-medium text-[#8a5c07]">
              <I n="star" size={12} className="mr-1 inline" /> Every payment is written to the audit trail — nothing is editable after day-close without principal approval.
            </div>
          </Card>
        </div>
      )}

      {tab === "reports" && !portalUser && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-4">
            <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Collection by method</h3>
            <Donut data={byMethod} centerValue={S.fmtLakh(byMethod.reduce((a, b) => a + b.value, 0))} centerLabel="total" />
          </Card>
          <Card className="xl:col-span-4">
            <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Monthly collection trend</h3>
            <VBars items={S.collectionSeries().map((s) => ({ label: s.label, v: s.value }))} format={S.fmtLakh} height={170} />
          </Card>
          <Card className="xl:col-span-4" pad={false}>
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="font-display text-[15px] font-extrabold text-ink">Top defaulters</h3>
              <Btn v="outline" sz="xs" icon="send" onClick={() => app.toast(`Bulk reminder sent to ${defaulters.slice(0, 8).length} guardians via SMS + WhatsApp`, "ok")}>Send reminders</Btn>
            </div>
            <div className="mt-2 max-h-[280px] space-y-1 overflow-y-auto p-2">
              {defaulters.slice(0, 10).map(({ s, due }) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-linesoft">
                  <Avatar name={s.name} size={26} />
                  <span className="flex-1"><span className="block text-[12px] font-semibold text-ink">{s.name}</span><span className="text-[10px] text-sub">{S.className(s.classId)}-{s.section} · {s.phone}</span></span>
                  <span className="num text-[12.5px] font-extrabold text-danger">{S.fmtRs(due)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <ChallanPreview voucherId={viewId} onClose={() => setViewId(null)} />
      <ReceiveModal voucherId={payId} onClose={() => setPayId(null)} onReceipt={setReceipt} />
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
