import { useMemo, useState } from "react";
import { useApp, printDoc, docHead } from "../store";
import type { Staff } from "../data/seed";
import { fmtDate, fmtPKR, monthLabel, monthKey } from "../data/seed";
import { Avatar, Badge, Btn, Card, I, PageHead, SearchInput, Tabs, Tbl, tdCls, thCls, Modal } from "../components/ui";

export default function HR() {
  const app = useApp();
  const role = app.session?.role;
  const [tab, setTab] = useState(role === "teacher" ? "payslip" : "staff");
  const [q, setQ] = useState("");
  const [slip, setSlip] = useState<Staff | null>(null);

  const staff = useMemo(() => app.db.staff.filter((s) => !q || (s.name + s.role + s.dept).toLowerCase().includes(q.toLowerCase())), [app.db.staff, q]);
  const month = monthKey(-1);

  const payslipFor = (s: Staff) => {
    const basic = s.salary;
    const allowance = Math.round(basic * 0.12);
    const deduction = s.status === "on-leave" ? Math.round(basic * 0.05) : Math.round(basic * 0.02);
    return { basic, allowance, deduction, net: basic + allowance - deduction };
  };
  const totalPayroll = app.db.staff.filter((s) => s.status !== "exited").reduce((a, s) => a + payslipFor(s).net, 0);
  const paidIds = app.db.payslipsPaid;

  const markPaid = (s: Staff) => {
    app.set((d) => ({ ...d, payslipsPaid: [...d.payslipsPaid, s.id], schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Salary paid", detail: `${s.name} — ${fmtPKR(payslipFor(s).net)} (${monthLabel(month)})` }, ...d.schoolAudit] }));
    app.notify({ title: "Salary disbursed", body: `${s.name}'s salary for ${monthLabel(month)} transferred — payslip available in staff portal.`, icon: "brief", forRole: ["admin", "teacher"] });
    app.toast(`Salary marked paid for ${s.name}`, "ok");
  };

  if (role === "teacher") {
    const me = app.db.staff.find((s) => s.name === app.session?.name) ?? app.db.staff[0];
    const p = payslipFor(me);
    return (
      <>
        <PageHead title="My Payroll & Leave" sub={`${me.role} · ${me.dept} · joined ${fmtDate(me.joined)}`} />
        <div className="anim-up grid gap-4 lg:grid-cols-3">
          <Card title={`Payslip — ${monthLabel(month)}`} className="lg:col-span-2">
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-sub">Basic salary</span><span className="num font-bold text-ink">{fmtPKR(p.basic)}</span></div>
              <div className="flex justify-between"><span className="text-sub">House rent allowance (12%)</span><span className="num font-bold text-ok">+ {fmtPKR(p.allowance)}</span></div>
              <div className="flex justify-between"><span className="text-sub">EOBI / deductions</span><span className="num font-bold text-danger">− {fmtPKR(p.deduction)}</span></div>
              <div className="flex justify-between border-t-2 border-ink pt-2 text-[15px] font-bold"><span>Net pay</span><span className="num text-primarydark">{fmtPKR(p.net)}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone="ok"><I n="check" size={11} /> Paid on {fmtDate(app.db.payrollRun.processedOn)}</Badge>
              <Btn v="outline" sz="sm" icon="print" className="ml-auto" onClick={() => setSlip(me)}>View payslip</Btn>
            </div>
          </Card>
          <Card title="Leave balance">
            {[["Casual leave", 9, 18], ["Medical leave", 4, 8], ["Earned leave", 11, 15]].map(([l, left, of]) => (
              <div key={l as string} className="mb-3">
                <div className="mb-1 flex justify-between text-[12px]"><span className="font-medium text-ink">{l}</span><span className="num font-bold text-sub">{left}/{of} left</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-line/70"><div className="h-full rounded-full bg-primary" style={{ width: `${((left as number) / (of as number)) * 100}%` }} /></div>
              </div>
            ))}
            <Btn v="subtle" sz="sm" className="w-full" icon="plus" onClick={() => app.toast("Leave application sent to principal for approval", "info")}>Apply for leave</Btn>
          </Card>
        </div>
        <SlipModal st={slip} onClose={() => setSlip(null)} calc={payslipFor} month={month} />
      </>
    );
  }

  return (
    <>
      <PageHead title="HR & Payroll" sub="Staff records · salary run · leave approvals — all changes audit-logged"
        actions={<Btn v="outline" sz="sm" icon="download" onClick={() => app.toast("Payroll journal exported for accounting", "info")}>Export payroll journal</Btn>} />

      <div className="anim-up mb-4 flex items-center gap-3">
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: "staff", label: "Staff Directory", icon: "users", count: app.db.staff.length },
          { id: "payroll", label: `Payroll — ${monthLabel(month)}`, icon: "cash" },
          { id: "leave", label: "Leave Requests", icon: "cal", count: app.db.leaves.filter((l) => l.status === "pending").length },
        ]} />
        <span className="ml-auto hidden sm:block"><Badge tone="primary">Monthly payroll: <span className="num">{fmtPKR(totalPayroll)}</span></Badge></span>
      </div>

      {tab === "staff" && (
        <Card pad={false} actions={<SearchInput value={q} onChange={setQ} placeholder="Search staff…" className="w-56" />}>
          <Tbl head={["Employee", "Role / Dept", "Subjects", "Classes", "Joined", "Salary", "Status", ""]}>
            {staff.map((s) => (
              <tr key={s.id} className="tbl-row">
                <td className={tdCls}><span className="flex items-center gap-2.5"><Avatar name={s.name} size={30} /><span><b className="block">{s.name}</b><span className="num text-[10.5px] text-sub">{s.empId}</span></span></span></td>
                <td className={tdCls}><b>{s.role}</b><span className="block text-[10.5px] text-sub">{s.dept}</span></td>
                <td className={`${tdCls} text-sub`}>{s.subjects.join(", ") || "—"}</td>
                <td className={tdCls}>{s.classes.map((c) => <Badge key={c} tone="neutral" className="mr-1">{c}</Badge>)}</td>
                <td className={`${tdCls} num text-[12px]`}>{fmtDate(s.joined)}</td>
                <td className={`${tdCls} num font-bold`}>{fmtPKR(s.salary)}</td>
                <td className={tdCls}><Badge tone={s.status === "active" ? "ok" : s.status === "on-leave" ? "warn" : "neutral"}>{s.status.replace("-", " ")}</Badge></td>
                <td className={tdCls}><Btn v="ghost" sz="xs" icon="card" onClick={() => app.toast(`ID card for ${s.name} sent to printer`, "info")}>ID</Btn></td>
              </tr>
            ))}
          </Tbl>
        </Card>
      )}

      {tab === "payroll" && (
        <Card pad={false} title={`Salary run — ${monthLabel(month)}`} sub={`Attendance-linked deductions applied · ${paidIds.length} of ${app.db.staff.length} paid`}
          actions={<Btn v="subtle" sz="xs" icon="check" onClick={() => {
            const unpaid = app.db.staff.filter((s) => !paidIds.includes(s.id) && s.status !== "exited");
            app.set((d) => ({ ...d, payslipsPaid: [...d.payslipsPaid, ...unpaid.map((u) => u.id)] }));
            app.notify({ title: "Payroll run completed", body: `${unpaid.length} remaining salaries disbursed via bank transfer. Payslips published to staff portals.`, icon: "brief", forRole: ["admin", "teacher"] });
            app.toast(`${unpaid.length} salaries marked paid — payroll period locked`, "ok");
          }}>Mark all paid & lock</Btn>}>
          <Tbl head={["Employee", "Basic", "Allowance", "Deduction", "Net pay", "Status", ""]}>
            {app.db.staff.filter((s) => s.status !== "exited").map((s) => {
              const p = payslipFor(s);
              const paid = paidIds.includes(s.id);
              return (
                <tr key={s.id} className="tbl-row">
                  <td className={tdCls}><span className="flex items-center gap-2.5"><Avatar name={s.name} size={28} /><b>{s.name}</b></span></td>
                  <td className={`${tdCls} num`}>{fmtPKR(p.basic)}</td>
                  <td className={`${tdCls} num text-ok`}>+{fmtPKR(p.allowance)}</td>
                  <td className={`${tdCls} num text-danger`}>−{fmtPKR(p.deduction)}</td>
                  <td className={`${tdCls} num font-bold`}>{fmtPKR(p.net)}</td>
                  <td className={tdCls}>{paid ? <Badge tone="ok">PAID</Badge> : <Badge tone="warn">PENDING</Badge>}</td>
                  <td className={tdCls}><span className="flex gap-1.5">
                    <Btn v="ghost" sz="xs" icon="print" onClick={() => setSlip(s)}>Slip</Btn>
                    {!paid && <Btn v="subtle" sz="xs" icon="cash" onClick={() => markPaid(s)}>Pay</Btn>}
                  </span></td>
                </tr>
              );
            })}
          </Tbl>
        </Card>
      )}

      {tab === "leave" && (
        <Card pad={false} title="Leave applications" sub="Approval chain: Coordinator → Principal">
          <Tbl head={["Employee", "Type", "Dates", "Days", "Reason", "Status", "Action"]}>
            {app.db.leaves.map((l) => (
              <tr key={l.id} className="tbl-row">
                <td className={tdCls}><b>{l.who}</b><span className="block text-[10.5px] text-sub">{l.role}</span></td>
                <td className={tdCls}>{l.type}</td>
                <td className={`${tdCls} num text-[12px]`}>{fmtDate(l.from)} → {fmtDate(l.to)}</td>
                <td className={`${tdCls} num font-bold`}>{l.days}</td>
                <td className={`${tdCls} max-w-[200px] truncate text-sub`}>{l.reason}</td>
                <td className={tdCls}><Badge tone={l.status === "approved" ? "ok" : l.status === "rejected" ? "danger" : "warn"}>{l.status.toUpperCase()}</Badge></td>
                <td className={tdCls}>{l.status === "pending" && (
                  <span className="flex gap-1.5">
                    <Btn v="subtle" sz="xs" icon="check" onClick={() => { app.set((d) => ({ ...d, leaves: d.leaves.map((x) => x.id === l.id ? { ...x, status: "approved" as const } : x) })); app.notify({ title: "Leave approved", body: `${l.type} for ${l.who} approved by principal.`, icon: "cal", forRole: ["teacher", "admin"] }); app.toast(`Leave approved for ${l.who}`); }}>Approve</Btn>
                    <Btn v="ghost" sz="xs" icon="x" onClick={() => { app.set((d) => ({ ...d, leaves: d.leaves.map((x) => x.id === l.id ? { ...x, status: "rejected" as const } : x) })); app.toast(`Leave declined for ${l.who}`, "warn"); }}>Decline</Btn>
                  </span>
                )}</td>
              </tr>
            ))}
          </Tbl>
        </Card>
      )}

      <SlipModal st={slip} onClose={() => setSlip(null)} calc={payslipFor} month={month} />
    </>
  );
}

function SlipModal({ st, onClose, calc, month }: { st: Staff | null; onClose: () => void; calc: (s: Staff) => { basic: number; allowance: number; deduction: number; net: number }; month: string }) {
  const app = useApp();
  if (!st) return null;
  const p = calc(st);
  return (
    <Modal open onClose={onClose} title={`Payslip — ${st.name}`} sub={`${monthLabel(month)} · ${st.empId} · ${st.dept}`}
      footer={<Btn icon="print" onClick={() => printDoc(`Payslip — ${st.name}`,
        docHead(app.branding, "SALARY SLIP (CONFIDENTIAL)", `${monthLabel(month)} · ${st.empId}`) +
        `<div class="grid"><div><b>Employee:</b> ${st.name}</div><div><b>Designation:</b> ${st.role}</div><div><b>Department:</b> ${st.dept}</div><div><b>Joined:</b> ${fmtDate(st.joined)}</div><div><b>Bank:</b> Meezan Bank — **** 4471</div><div><b>Type:</b> ${st.type}</div></div>
        <table><tbody>
        <tr><td>Basic salary</td><td style="text-align:right">Rs ${p.basic.toLocaleString()}</td></tr>
        <tr><td>House rent allowance (12%)</td><td style="text-align:right">Rs ${p.allowance.toLocaleString()}</td></tr>
        <tr><td>EOBI / other deductions</td><td style="text-align:right;color:#b3402f">− Rs ${p.deduction.toLocaleString()}</td></tr>
        <tr class="total-row"><td>NET PAY</td><td style="text-align:right">Rs ${p.net.toLocaleString()}</td></tr>
        </tbody></table>
        <p class="note">System-generated payslip from Markaz ERP payroll. Leave balance after this month: ${st.leaveLeft} days.</p>
        <div class="sign"><div>Employee</div><div>Accounts Officer</div></div>`,
        { schoolName: app.branding.schoolName, accent: "#c99a2e" })}>Print payslip</Btn>}>
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between"><span className="text-sub">Basic salary</span><span className="num font-bold">{fmtPKR(p.basic)}</span></div>
          <div className="flex justify-between"><span className="text-sub">House rent allowance (12%)</span><span className="num font-bold text-ok">+ {fmtPKR(p.allowance)}</span></div>
          <div className="flex justify-between"><span className="text-sub">EOBI / deductions</span><span className="num font-bold text-danger">− {fmtPKR(p.deduction)}</span></div>
          <div className="flex justify-between border-t-2 border-ink pt-2 text-[16px] font-bold"><span>Net pay</span><span className="num text-primarydark">{fmtPKR(p.net)}</span></div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-sub"><I n="lock" size={12} /> Confidential — visible only to the employee, HR and accounts.</p>
      </div>
    </Modal>
  );
}
