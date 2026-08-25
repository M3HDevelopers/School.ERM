import { useEffect, useMemo, useState } from "react";
import { useApp, downloadCSV, printDoc, docHead } from "../store";
import type { Voucher, VoucherStatus, Payment } from "../data/seed";
import { fmtPKR, monthKey, monthLabel, fmtDate, dayKey, SCHOOL } from "../data/seed";
import { Badge, Btn, Card, I, Kpi, LineChart, Modal, PageHead, QRBox, SearchInput, Select, Tabs, Tbl, tdCls, thCls, TextInput, EmptyState } from "../components/ui";

const STATUS_TONE: Record<string, string> = { paid: "ok", partial: "warn", overdue: "danger", generated: "neutral", waived: "accent" };

export default function Fees() {
  const app = useApp();
  const role = app.session?.role;
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const t = app.nav.params?.tab;
    if (t) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (role === "student" || role === "parent") return <PortalFees />;

  const cur = monthKey(0);
  const collected = 918000 + app.db.vouchers.filter((v) => v.month === cur).reduce((a, v) => a + v.paid, 0);
  const outstanding = 132000 + app.db.vouchers.filter((v) => v.status !== "paid" && v.status !== "waived").reduce((a, v) => a + app.balanceOf(v), 0);
  const overdueCount = app.db.vouchers.filter((v) => v.status === "overdue" || v.status === "partial").length;

  return (
    <>
      <PageHead title="Fees & Finance" sub="Digital fee office: plans → challans → receipts → reports"
        actions={<Btn v="outline" sz="sm" icon="download" onClick={() => {
          downloadCSV("fee-register", app.db.vouchers.map((v) => { const st = app.db.students.find((s) => s.id === v.studentId); return { challan: v.no, student: st?.name ?? "", adm_no: st?.admNo ?? "", month: v.month, total: v.total, paid: v.paid, balance: app.balanceOf(v), status: v.status }; }));
          app.toast("Fee register exported to CSV");
        }}>Export register</Btn>} />

      <div className="anim-up mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Collected this month" value={collected} prefix="Rs " sub={<span><span className="num font-bold text-ok">{Math.round((collected / 1550000) * 100)}%</span> of Rs 15.5L target</span>} />
        <Kpi label="Outstanding" value={outstanding} prefix="Rs " tone="var(--color-danger)" sub={`${overdueCount} challans need follow-up`} />
        <Kpi label="Challans issued" value={app.db.vouchers.length} sub={`${monthLabel(monthKey(-2))} → ${monthLabel(cur)}`} />
        <Kpi label="Concessions given" value={app.db.vouchers.reduce((a, v) => a + v.discount, 0)} prefix="Rs " sub="Merit & sibling discounts" />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "overview", label: "Overview", icon: "chart" },
        { id: "challans", label: "Challans", icon: "cash", count: app.db.vouchers.length },
        { id: "generate", label: "Generate", icon: "plus" },
        { id: "collection", label: "Collection Report", icon: "download" },
      ]} />

      <div className="mt-4">
        {tab === "overview" && <Overview />}
        {tab === "challans" && <Challans />}
        {tab === "generate" && <Generate />}
        {tab === "collection" && <CollectionReport />}
      </div>
    </>
  );
}

function Overview() {
  const app = useApp();
  const recent = app.db.vouchers.flatMap((v) => v.payments.map((p) => ({ ...p, v }))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  return (
    <div className="anim-up grid gap-4 lg:grid-cols-3">
      <Card title="Collection trend" sub="PKR thousands · last 8 months" className="lg:col-span-2">
        <LineChart data={app.db.collectionSeries.map((s) => ({ label: s.label, value: s.value / 1000 }))} fmt={(v) => `Rs ${v}k`} />
      </Card>
      <Card title="Latest receipts" sub="Cashier: Kashif Mehmood">
        <div className="space-y-2">
          {recent.map((p) => {
            const st = app.db.students.find((s) => s.id === p.v.studentId);
            return (
              <div key={p.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-oksoft text-ok"><I n="check" size={13} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink">{st?.name}</p><p className="text-[10.5px] text-sub">{p.receipt} · {p.method} · {fmtDate(p.date)}</p></div>
                <span className="num text-[12.5px] font-bold text-ok">{fmtPKR(p.amount)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Challans() {
  const app = useApp();
  const [f, setF] = useState(app.nav.params?.f === "overdue" ? "overdue" : "all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Voucher | null>(null);
  const [pay, setPay] = useState<Voucher | null>(null);

  useEffect(() => {
    const pid = app.nav.params?.pay;
    if (pid) { const v = app.db.vouchers.find((x) => x.id === pid); if (v) setPay(v); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => app.db.vouchers.filter((v) => {
    const st = app.db.students.find((s) => s.id === v.studentId);
    if (f === "due") return v.status === "generated" || v.status === "overdue" || v.status === "partial";
    if (f !== "all" && v.status !== f) return false;
    if (q && !((st?.name ?? "") + v.no + (st?.admNo ?? "")).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.month.localeCompare(a.month)), [app.db.vouchers, app.db.students, f, q]);

  const remindAll = () => {
    const cnt = app.db.vouchers.filter((v) => v.status === "overdue" || v.status === "partial").length;
    app.notify({ title: `Bulk fee reminders sent (${cnt})`, body: "WhatsApp + SMS reminder with challan PDF delivered to all defaulters.", icon: "wa", forRole: ["admin"] });
    app.toast(`${cnt} reminders queued via WhatsApp & SMS adapters`, "info");
  };

  return (
    <div className="anim-up space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search challan no, student…" className="w-full sm:w-72" />
        <Select value={f} onChange={(e) => setF(e.target.value)} className="w-auto">
          <option value="all">All statuses</option><option value="due">Due (any)</option><option value="generated">Generated</option><option value="partial">Partial</option><option value="overdue">Overdue</option><option value="paid">Paid</option>
        </Select>
        <Btn v="subtle" sz="sm" icon="wa" className="ml-auto" onClick={remindAll}>Send bulk reminders</Btn>
      </div>
      <Card pad={false}>
        <Tbl head={["Challan", "Student", "Month", "Payable", "Paid", "Balance", "Due date", "Status", "Actions"]}>
          {list.slice(0, 14).map((v) => {
            const st = app.db.students.find((s) => s.id === v.studentId);
            const bal = app.balanceOf(v);
            return (
              <tr key={v.id} className="tbl-row">
                <td className={`${tdCls} num font-bold`}>{v.no}</td>
                <td className={tdCls}><span className="block font-bold">{st?.name}</span><span className="num text-[10.5px] text-sub">{st?.admNo}</span></td>
                <td className={tdCls}>{monthLabel(v.month)}</td>
                <td className={`${tdCls} num`}>{fmtPKR(v.total)}</td>
                <td className={`${tdCls} num text-ok`}>{fmtPKR(v.paid)}</td>
                <td className={`${tdCls} num font-bold ${bal > 0 ? "text-danger" : "text-sub"}`}>{fmtPKR(bal)}</td>
                <td className={`${tdCls} num text-[12px] ${v.status === "overdue" ? "text-danger font-bold" : "text-sub"}`}>{v.dueDate.slice(5)}</td>
                <td className={tdCls}><Badge tone={STATUS_TONE[v.status]}>{v.status.toUpperCase()}</Badge></td>
                <td className={tdCls}>
                  <span className="flex gap-1">
                    <button title="View challan" className="focus-ring rounded-md p-1.5 text-sub transition hover:bg-primarysoft hover:text-primarydark" onClick={() => setView(v)}><I n="eye" size={14} /></button>
                    {bal > 0 && <button title="Receive payment" className="focus-ring rounded-md p-1.5 text-sub transition hover:bg-oksoft hover:text-ok" onClick={() => setPay(v)}><I n="cash" size={14} /></button>}
                  </span>
                </td>
              </tr>
            );
          })}
        </Tbl>
      </Card>
      <ChallanView v={view} onClose={() => setView(null)} />
      <PayModal v={pay} onClose={() => setPay(null)} />
    </div>
  );
}

function ChallanView({ v, onClose }: { v: Voucher | null; onClose: () => void }) {
  const app = useApp();
  if (!v) return null;
  const st = app.db.students.find((s) => s.id === v.studentId);
  const bal = app.balanceOf(v);
  return (
    <Modal open onClose={onClose} wide title={`Fee Challan ${v.no}`} sub={`${st?.name} · ${monthLabel(v.month)} · Grade 8-${st?.section}`}
      footer={<>
        <Btn v="outline" icon="download" onClick={() => app.toast("Challan PDF downloaded", "info")}>Download PDF</Btn>
        <Btn icon="print" onClick={() => printDoc(`Challan ${v.no}`,
          docHead(app.branding, "FEE CHALLAN (DUPLICATE)", `${SCHOOL.address} · ${SCHOOL.phone}`) +
          `<div class="grid"><div><b>Student:</b> ${st?.name}</div><div><b>Admission No:</b> ${st?.admNo}</div><div><b>Class:</b> Grade 8-${st?.section} · Roll ${st?.roll}</div><div><b>Billing Month:</b> ${monthLabel(v.month)}</div><div><b>Challan No:</b> ${v.no}</div><div><b>Due Date:</b> ${fmtDate(v.dueDate)}</div><div><b>Guardian:</b> ${st?.guardian}</div><div><b>Phone:</b> ${st?.phone}</div></div>
          <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
          ${v.lines.map((l) => `<tr><td>${l.desc}</td><td style="text-align:right">Rs ${l.amount.toLocaleString()}</td></tr>`).join("")}
          ${v.discount ? `<tr><td>Concession / discount</td><td style="text-align:right;color:#1d7a4f">− Rs ${v.discount.toLocaleString()}</td></tr>` : ""}
          ${v.lateFee ? `<tr><td>Late fee</td><td style="text-align:right;color:#b3402f">+ Rs ${v.lateFee.toLocaleString()}</td></tr>` : ""}
          <tr class="total-row"><td>NET PAYABLE</td><td style="text-align:right">Rs ${v.total.toLocaleString()}</td></tr>
          ${v.paid ? `<tr><td>Received</td><td style="text-align:right;color:#1d7a4f">Rs ${v.paid.toLocaleString()}</td></tr>` : ""}
          </tbody></table>
          <div class="note">Pay at school accounts office or via bank transfer — Meezan Bank, A/C 0102-3344-5566 (Dar-e-Ilm Academy). Quote challan number. Late fee Rs 200 after due date.</div>
          <div class="sign"><div>Depositor</div><div>Cashier</div><div>Accountant</div></div>`,
          { schoolName: app.branding.schoolName, accent: "#c99a2e" })}>Print A4 challan</Btn>
      </>}>
      <div className="relative rounded-xl border border-line bg-surface p-5">
        {v.status === "paid" && <span className="stamp absolute right-6 top-6" style={{ display: "inline-block", border: "2px solid #1d7a4f", color: "#1d7a4f", padding: "3px 14px", fontWeight: 700, letterSpacing: 2, borderRadius: 4, transform: "rotate(-4deg)" }}>PAID</span>}
        <div className="flex items-start justify-between gap-4 border-b-2 pb-3" style={{ borderColor: "var(--color-accent)" }}>
          <div><p className="display text-[16px] font-bold text-ink">{app.branding.schoolName}</p><p className="text-[10.5px] text-sub">{SCHOOL.address} · {SCHOOL.phone}</p></div>
          <QRBox seed={v.no} size={62} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] sm:grid-cols-4">
          {[["Student", st?.name ?? ""], ["Admission No", st?.admNo ?? ""], ["Class", `Grade 8-${st?.section}`], ["Month", monthLabel(v.month)], ["Due date", fmtDate(v.dueDate)], ["Guardian", st?.guardian ?? ""], ["Challan No", v.no], ["Status", v.status.toUpperCase()]].map(([l, val]) => (
            <p key={l}><span className="text-sub">{l}: </span><b className="text-ink">{val}</b></p>
          ))}
        </div>
        <table className="mt-4 w-full text-[12.5px]">
          <thead><tr>{["Description", "Amount"].map((h) => <th key={h} className={`${thCls} ${h === "Amount" ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>
            {v.lines.map((l) => <tr key={l.desc}><td className={tdCls}>{l.desc}</td><td className={`${tdCls} num text-right`}>{fmtPKR(l.amount)}</td></tr>)}
            {v.discount > 0 && <tr><td className={`${tdCls} text-ok`}>Concession / discount</td><td className={`${tdCls} num text-right text-ok`}>− {fmtPKR(v.discount)}</td></tr>}
            {v.lateFee > 0 && <tr><td className={`${tdCls} text-danger`}>Late fee</td><td className={`${tdCls} num text-right text-danger`}>+ {fmtPKR(v.lateFee)}</td></tr>}
            <tr className="bg-canvas/70"><td className={`${tdCls} font-bold`}>NET PAYABLE</td><td className={`${tdCls} num text-right font-bold`}>{fmtPKR(v.total)}</td></tr>
            {v.paid > 0 && <tr><td className={`${tdCls} text-ok`}>Received</td><td className={`${tdCls} num text-right font-bold text-ok`}>{fmtPKR(v.paid)}</td></tr>}
            {bal > 0 && <tr><td className={`${tdCls} font-bold text-danger`}>BALANCE DUE</td><td className={`${tdCls} num text-right font-bold text-danger`}>{fmtPKR(bal)}</td></tr>}
          </tbody>
        </table>
        <p className="mt-3 rounded-lg border-l-2 bg-canvas/70 px-3 py-2 text-[11px] text-sub" style={{ borderColor: "var(--color-accent)" }}>Bank: Meezan Bank · A/C 0102-3344-5566 · Title: {app.branding.schoolName}. Online: JazzCash / Easypaisa via parent portal.</p>
      </div>
    </Modal>
  );
}

function PayModal({ v, onClose }: { v: Voucher | null; onClose: () => void }) {
  const app = useApp();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Cash");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  useEffect(() => { if (v) setAmount(app.balanceOf(v)); }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return null;
  const st = app.db.students.find((s) => s.id === v.studentId);
  const bal = app.balanceOf(v);

  const post = () => {
    if (amount <= 0) { app.toast("Enter a valid amount", "warn"); return; }
    if (amount > bal) { app.toast(`Amount exceeds balance due (${fmtPKR(bal)})`, "warn"); return; }
    const pay: Payment = { id: `p${Date.now()}`, date: dayKey(0), amount, method, receipt: `RCP-${11900 + app.db.vouchers.flatMap((x) => x.payments).length}`, by: app.session?.name ?? "Kashif Mehmood" };
    app.set((d) => ({
      ...d,
      vouchers: d.vouchers.map((x) => {
        if (x.id !== v.id) return x;
        const paid = x.paid + amount;
        return { ...x, paid, status: (paid >= x.total ? "paid" : "partial") as VoucherStatus, payments: [...x.payments, pay] };
      }),
      schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Payment posted", detail: `${pay.receipt} — ${fmtPKR(amount)} (${st?.name}, ${v.no}) via ${method}` }, ...d.schoolAudit],
    }));
    app.notify({ title: "Fee receipt issued", body: `${pay.receipt} — ${fmtPKR(amount)} received for ${st?.name} (${v.no}). Receipt sent to parent's WhatsApp.`, icon: "cash", forRole: ["admin", "parent"] });
    setReceipt(pay);
    app.toast(`Receipt ${pay.receipt} posted — ledger updated`, "ok");
  };

  return (
    <Modal open onClose={onClose} title={receipt ? "Payment posted ✓" : "Receive Payment"} sub={receipt ? "Receipt is printable and already sent to the parent portal" : `${st?.name} · ${v.no} · balance ${fmtPKR(bal)}`}
      footer={receipt ? <Btn icon="check" onClick={onClose}>Done</Btn> : <><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="cash" onClick={post}>Post Payment</Btn></>}>
      {receipt ? (
        <div className="anim-pop space-y-3">
          <div className="rounded-xl border-2 border-ok/40 bg-oksoft/50 p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ok">Official Receipt</p>
            <p className="num display mt-1 text-[24px] font-bold text-ink">{receipt.receipt}</p>
            <p className="mt-1 text-[13px] text-ink">{st?.name} · {v.no} · {monthLabel(v.month)}</p>
            <p className="num mt-2 text-[20px] font-bold text-ok">{fmtPKR(receipt.amount)}</p>
            <p className="text-[11px] text-sub">via {receipt.method} · {fmtDate(receipt.date)} · by {receipt.by}</p>
          </div>
          <Btn className="w-full" icon="print" onClick={() => printDoc(`Receipt ${receipt.receipt}`,
            docHead(app.branding, "FEE RECEIPT", `${SCHOOL.address} · ${SCHOOL.phone}`) +
            `<div class="grid"><div><b>Receipt No:</b> ${receipt.receipt}</div><div><b>Date:</b> ${fmtDate(receipt.date)}</div><div><b>Student:</b> ${st?.name} (${st?.admNo})</div><div><b>Challan:</b> ${v.no} — ${monthLabel(v.month)}</div><div><b>Payment Method:</b> ${receipt.method}</div><div><b>Received By:</b> ${receipt.by}</div></div>
            <table><tbody><tr class="total-row"><td>AMOUNT RECEIVED</td><td style="text-align:right">Rs ${receipt.amount.toLocaleString()}</td></tr><tr><td>Balance after payment</td><td style="text-align:right">Rs ${Math.max(0, bal - receipt.amount).toLocaleString()}</td></tr></tbody></table>
            <p class="note">Thank you for your payment. This receipt is valid with the school seal. Duplicate available on the parent portal.</p>
            <div class="sign"><div>Depositor</div><div>Cashier</div></div>`,
            { schoolName: app.branding.schoolName, accent: "#c99a2e" })}>Print receipt</Btn>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Amount (PKR)</span>
              <TextInput type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label>
            <label className="block"><span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Method</span>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>{["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Cheque"].map((m) => <option key={m}>{m}</option>)}</Select></label>
          </div>
          <div className="flex gap-2">
            <Btn v="subtle" sz="xs" onClick={() => setAmount(bal)}>Full balance</Btn>
            <Btn v="ghost" sz="xs" onClick={() => setAmount(Math.round(bal / 2))}>Half (partial)</Btn>
          </div>
          <div className="rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11.5px] text-sub">
            Posting will: update the student ledger · mark challan {amount >= bal ? "<b className='text-ok'>PAID</b>" : "<b className='text-warn'>PARTIAL</b>"} · send receipt to parent portal &amp; WhatsApp · write an audit entry.
          </div>
        </div>
      )}
    </Modal>
  );
}

function Generate() {
  const app = useApp();
  const [month, setMonth] = useState(monthKey(0));
  const [target, setTarget] = useState("g8A");
  const students = app.db.students.filter((s) => s.classId === "g8" && s.section === (target === "g8A" ? "A" : "B") && s.status === "active");
  const existing = (id: string) => app.db.vouchers.some((v) => v.studentId === id && v.month === month);
  const pending = students.filter((s) => !existing(s.id));
  const preview = pending.map((s) => {
    const tuition = 3200, lab = 300, transport = s.route ? 1500 : 0;
    const gross = tuition + lab + transport;
    const discount = Math.round((gross * s.scholarship) / 100);
    return { s, gross, discount, net: gross - discount };
  });
  const totalNet = preview.reduce((a, p) => a + p.net, 0);

  const generate = () => {
    if (!pending.length) { app.toast("All challans for this month already exist", "info"); return; }
    let cn = 48210 + app.db.vouchers.length;
    app.set((d) => ({
      ...d,
      vouchers: [...d.vouchers, ...preview.map((p) => {
        const lines = [{ desc: "Tuition Fee", amount: 3200 }, { desc: "Lab & Activity Charges", amount: 300 }];
        if (p.s.route) lines.push({ desc: "Transport Fee", amount: 1500 });
        return { id: `v-${p.s.id}-${month}`, no: `CHN-${cn++}`, studentId: p.s.id, month, lines, discount: p.discount, lateFee: 0, total: p.net, paid: 0, dueDate: `${month}-10`, status: "generated" as VoucherStatus, payments: [] };
      })],
      schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Challans generated", detail: `${preview.length} challans for ${monthLabel(month)} — Grade 8-${target.slice(-1)}` }, ...d.schoolAudit],
    }));
    app.notify({ title: `Fee challans generated (${preview.length})`, body: `${monthLabel(month)} challans issued for Grade 8-${target.slice(-1)}. Parents notified via WhatsApp & SMS.`, icon: "cash", forRole: ["admin", "parent"] });
    app.toast(`${preview.length} challans generated — parents notified with PDF challans`, "ok");
  };

  return (
    <div className="anim-up grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card title="Bulk generation" sub="Applies each student's fee plan, concessions and transport automatically">
        <div className="space-y-3">
          <label className="block"><span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Billing month</span>
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>{[-1, 0, 1].map((o) => { const m = monthKey(o); return <option key={m} value={m}>{monthLabel(m)}</option>; })}</Select></label>
          <label className="block"><span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Class / section</span>
            <Select value={target} onChange={(e) => setTarget(e.target.value)}><option value="g8A">Grade 8-A (14 students)</option><option value="g8B">Grade 8-B (14 students)</option></Select></label>
          <div className="rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[12px] text-sub">
            <p className="flex justify-between"><span>Students to bill</span><b className="num text-ink">{pending.length}</b></p>
            <p className="flex justify-between"><span>Already generated</span><b className="num text-ink">{students.length - pending.length}</b></p>
            <p className="flex justify-between border-t border-line pt-1.5 font-bold"><span>Total receivable</span><span className="num text-primarydark">{fmtPKR(totalNet)}</span></p>
          </div>
          <Btn className="w-full" icon="zap" onClick={generate} disabled={!pending.length}>Generate {pending.length ? `${pending.length} challans` : "— all done"}</Btn>
          <p className="text-[11px] text-sub">Each challan gets a unique number, due date on the 10th, and a printable A4/thermal layout. Generation is logged to the audit trail.</p>
        </div>
      </Card>
      <Card title="Preview" sub={`${monthLabel(month)} · Grade 8-${target.slice(-1)}`} pad={false}>
        {pending.length === 0 ? (
          <EmptyState icon="check" title="Nothing to generate" body="Every active student already has a challan for this month." />
        ) : (
          <div className="max-h-[430px] overflow-y-auto">
            <Tbl head={["Student", "Gross", "Concession", "Net payable"]}>
              {preview.map(({ s, gross, discount, net }) => (
                <tr key={s.id} className="tbl-row">
                  <td className={tdCls}><span className="block font-bold">{s.name}</span><span className="text-[10.5px] text-sub">Roll {s.roll}{s.route ? " · transport" : ""}</span></td>
                  <td className={`${tdCls} num`}>{fmtPKR(gross)}</td>
                  <td className={`${tdCls} num ${discount ? "text-ok font-semibold" : "text-sub"}`}>{discount ? `− ${fmtPKR(discount)}` : "—"}</td>
                  <td className={`${tdCls} num font-bold`}>{fmtPKR(net)}</td>
                </tr>
              ))}
            </Tbl>
          </div>
        )}
      </Card>
    </div>
  );
}

function CollectionReport() {
  const app = useApp();
  const pays = app.db.vouchers.flatMap((v) => { const st = app.db.students.find((s) => s.id === v.studentId); return v.payments.map((p) => ({ ...p, student: st?.name ?? "", cls: `8-${st?.section ?? "A"}`, month: v.month })); });
  const byMethod: Record<string, number> = {};
  pays.forEach((p) => { byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount; });
  return (
    <div className="anim-up grid gap-4 lg:grid-cols-3">
      <Card title="By payment method" className="lg:col-span-1">
        <div className="space-y-2.5">
          {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
            <div key={m} className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
              <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink"><I n={m === "Cash" ? "cash" : "card"} size={14} className="text-primarydark" /> {m}</span>
              <span className="num text-[13px] font-bold text-ink">{fmtPKR(v)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-primarysoft px-3 py-2 text-[11.5px] text-primarydark">Day closing: total cash tallied against the deposit register at 2:30 pm daily.</p>
      </Card>
      <Card title="Receipts ledger" className="lg:col-span-2" pad={false}
        actions={<Btn v="ghost" sz="xs" icon="download" onClick={() => { downloadCSV("collections", pays.map((p) => ({ receipt: p.receipt, date: p.date, student: p.student, month: p.month, method: p.method, amount: p.amount, cashier: p.by }))); app.toast("Collection report exported"); }}>Export CSV</Btn>}>
        <div className="max-h-[440px] overflow-y-auto">
          <Tbl head={["Receipt", "Date", "Student", "Month", "Method", "Cashier", "Amount"]}>
            {pays.sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
              <tr key={p.id + p.receipt} className="tbl-row">
                <td className={`${tdCls} num font-bold`}>{p.receipt}</td>
                <td className={`${tdCls} num text-[12px]`}>{p.date}</td>
                <td className={tdCls}><span className="font-medium">{p.student}</span> <span className="text-[10.5px] text-sub">({p.cls})</span></td>
                <td className={tdCls}>{monthLabel(p.month)}</td>
                <td className={tdCls}><Badge tone={p.method === "Cash" ? "accent" : "primary"}>{p.method}</Badge></td>
                <td className={`${tdCls} text-sub`}>{p.by}</td>
                <td className={`${tdCls} num font-bold text-ok`}>{fmtPKR(p.amount)}</td>
              </tr>
            ))}
          </Tbl>
        </div>
      </Card>
    </div>
  );
}

// ================= student / parent portal =================
function PortalFees() {
  const app = useApp();
  const isParent = app.session?.role === "parent";
  const me = app.db.students[0];
  const myV = app.db.vouchers.filter((v) => v.studentId === me.id).sort((a, b) => b.month.localeCompare(a.month));
  const due = myV.reduce((a, v) => a + app.balanceOf(v), 0);
  const [pay, setPay] = useState<Voucher | null>(null);
  useEffect(() => {
    const pid = app.nav.params?.pay;
    if (pid) { const v = app.db.vouchers.find((x) => x.id === pid); if (v) setPay(v); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [method, setMethod] = useState("JazzCash");
  const [done, setDone] = useState(false);

  const payOnline = () => {
    if (!pay) return;
    const bal = app.balanceOf(pay);
    const rec: Payment = { id: `p${Date.now()}`, date: dayKey(0), amount: bal, method, receipt: `RCP-ON-${2200 + app.db.vouchers.flatMap((x) => x.payments).length}`, by: "Online Gateway" };
    app.set((d) => ({ ...d, vouchers: d.vouchers.map((x) => x.id === pay.id ? { ...x, paid: x.paid + bal, status: "paid" as VoucherStatus, payments: [...x.payments, rec] } : x) }));
    app.notify({ title: "Online payment received", body: `${fmtPKR(bal)} via ${method} for ${pay.no}. Receipt ${rec.receipt} issued.`, icon: "cash", forRole: ["admin", "student", "parent"] });
    setDone(true);
    app.toast(`Payment successful — receipt ${rec.receipt} saved`, "ok");
  };

  return (
    <>
      <PageHead title={isParent ? "Fees & Challans" : "My Fees"} sub={`${me.name} · Grade 8-${me.section} · all challans, receipts and dues in one place`} />
      <div className="anim-up mb-4 grid gap-3 sm:grid-cols-3">
        <Kpi label="Total outstanding" value={due} prefix="Rs " tone={due > 0 ? "var(--color-danger)" : undefined} sub={due > 0 ? "Pay before the 10th to avoid late fee" : "All clear — no dues"} />
        <Kpi label="Challans" value={myV.length} sub="This session" />
        <Kpi label="Paid on time" value={Math.round((myV.filter((v) => v.status === "paid").length / Math.max(1, myV.length)) * 100)} suffix="%" sub="Punctuality score" />
      </div>
      <Card pad={false} title="Challan history" actions={<Btn v="ghost" sz="xs" icon="download" onClick={() => app.toast("Statement PDF downloaded", "info")}>Statement PDF</Btn>}>
        <Tbl head={["Challan", "Month", "Payable", "Paid", "Status", ""]}>
          {myV.map((v) => (
            <tr key={v.id} className="tbl-row">
              <td className={`${tdCls} num font-bold`}>{v.no}</td>
              <td className={tdCls}>{monthLabel(v.month)}</td>
              <td className={`${tdCls} num`}>{fmtPKR(v.total)}</td>
              <td className={`${tdCls} num text-ok`}>{fmtPKR(v.paid)}</td>
              <td className={tdCls}><Badge tone={STATUS_TONE[v.status]}>{v.status.toUpperCase()}</Badge></td>
              <td className={tdCls}>
                <span className="flex gap-1.5">
                  {app.balanceOf(v) > 0 && <Btn v="subtle" sz="xs" icon="cash" onClick={() => { setPay(v); setDone(false); }}>Pay online</Btn>}
                  {v.payments.length > 0 && <Btn v="ghost" sz="xs" icon="print" onClick={() => app.toast(`Receipt ${v.payments[0].receipt} downloaded`, "info")}>Receipt</Btn>}
                </span>
              </td>
            </tr>
          ))}
        </Tbl>
      </Card>

      <Modal open={!!pay} onClose={() => setPay(null)} title={done ? "Payment successful 🎉" : "Online Payment"} sub={pay ? `${pay.no} · ${monthLabel(pay.month)}` : ""}
        footer={done ? <Btn icon="check" onClick={() => setPay(null)}>Done</Btn> : <><Btn v="outline" onClick={() => setPay(null)}>Cancel</Btn><Btn icon="zap" onClick={payOnline}>Pay {pay ? fmtPKR(app.balanceOf(pay)) : ""}</Btn></>}>
        {pay && (done ? (
          <div className="anim-pop rounded-xl border-2 border-ok/40 bg-oksoft/50 p-5 text-center">
            <p className="num display text-[22px] font-bold text-ink">{fmtPKR(pay.paid)}</p>
            <p className="mt-1 text-[12.5px] text-sub">paid via {method} · receipt issued · school accounts reconciled instantly</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {["JazzCash", "Easypaisa", "Bank Card"].map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`focus-ring rounded-lg border p-3 text-center transition ${method === m ? "border-primary bg-primarysoft" : "border-line bg-surface hover:border-primary/40"}`}>
                  <I n={m === "Bank Card" ? "card" : "phone"} size={18} className={`mx-auto ${method === m ? "text-primarydark" : "text-sub"}`} />
                  <p className="mt-1 text-[11.5px] font-bold text-ink">{m}</p>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11.5px] text-sub">Demo gateway adapter — no real money moves. In production this routes to the payment provider configured for the school.</div>
          </div>
        ))}
      </Modal>
    </>
  );
}
