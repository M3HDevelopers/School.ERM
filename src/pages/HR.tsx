import React, { useEffect, useState } from "react";
import { printNow, staffById, useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, Drawer, EmptyState, I, Modal, PageHead, Select, Tabs, tdCls, thCls, Confirm } from "../components/ui";

function PayslipModal({ slip, onClose }: { slip: S.Slip | null; onClose: () => void }) {
  const app = useApp();
  if (!slip) return null;
  const emp = staffById(app.staff, slip.staffId);
  if (!emp) return null;
  const run = app.payrollRuns.find((r) => r.slips.some((s) => s.id === slip.id));
  return (
    <Modal open onClose={onClose} title={`Payslip — ${emp.name}`} w="max-w-lg"
      footer={<><Btn v="outline" onClick={onClose}>Close</Btn><Btn v="accent" icon="print" onClick={printNow}>Print payslip</Btn></>}>
      <div className="print-stage rounded-lg border border-line bg-white p-5">
        <div className="flex items-center gap-3 border-b-2 border-side pb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"><I n="cap" size={22} className="text-side" /></span>
          <div className="flex-1">
            <div className="font-display text-[15px] font-extrabold text-ink">{app.school.name}</div>
            <div className="text-[10px] text-sub">{app.school.address} · Salary Statement {run ? S.monthLabel(run.month) : ""}</div>
          </div>
          <div className="num text-[10px] font-bold uppercase tracking-wider text-sub">{emp.empNo}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[12px] sm:grid-cols-3">
          {[["Employee", emp.name], ["Designation", emp.designation], ["Department", emp.dept], ["Bank", emp.bank], ["Joined", S.fmtDate(emp.joined)], ["Status", slip.status.toUpperCase()]].map(([k, v]) => (
            <div key={k}><span className="block text-[9px] font-bold uppercase tracking-wider text-sub">{k}</span><span className="font-semibold text-ink">{v}</span></div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-linesoft p-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ok">Earnings</div>
            <div className="flex justify-between text-[12px] py-0.5"><span>Basic salary</span><span className="num font-semibold">{S.fmtRs(slip.basic)}</span></div>
            <div className="flex justify-between text-[12px] py-0.5"><span>Allowances</span><span className="num font-semibold">{S.fmtRs(slip.allowance)}</span></div>
            <div className="mt-1 flex justify-between border-t border-linesoft pt-1.5 text-[12.5px] font-extrabold"><span>Gross</span><span className="num">{S.fmtRs(slip.basic + slip.allowance)}</span></div>
          </div>
          <div className="rounded-lg border border-linesoft p-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-danger">Deductions</div>
            <div className="flex justify-between text-[12px] py-0.5"><span>EOBI (1%)</span><span className="num font-semibold">{S.fmtRs(Math.round(slip.basic * 0.01))}</span></div>
            <div className="flex justify-between text-[12px] py-0.5"><span>Absence / other</span><span className="num font-semibold">{S.fmtRs(slip.deduction - Math.round(slip.basic * 0.01))}</span></div>
            <div className="mt-1 flex justify-between border-t border-linesoft pt-1.5 text-[12.5px] font-extrabold"><span>Total</span><span className="num">{S.fmtRs(slip.deduction)}</span></div>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-primarysoft p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Net pay</div>
          <div className="num font-display text-[24px] font-black text-primarydeep">{S.fmtRs(slip.net)}</div>
          {slip.paidOn && <div className="num text-[10.5px] text-sub">paid on {S.fmtDate(slip.paidOn)} · ref {slip.id.slice(-6).toUpperCase()}</div>}
        </div>
      </div>
    </Modal>
  );
}

export default function HR() {
  const app = useApp();
  const role = app.session?.role ?? "admin";
  const [tab, setTab] = useState("staff");
  const [openId, setOpenId] = useState<string | null>(null);
  const [slip, setSlip] = useState<S.Slip | null>(null);
  const [month, setMonth] = useState(S.monthKey(0));
  const [runBusy, setRunBusy] = useState(false);
  const [confirmRun, setConfirmRun] = useState(false);

  useEffect(() => {
    if (app.nav.params?.tab) setTab(app.nav.params.tab);
    if (app.nav.params?.open) { setTab("staff"); setOpenId(app.nav.params.open); }
  }, [app.nav.params]);

  const run = app.payrollRuns.find((r) => r.month === month);
  const staffRec = app.staff.find((s) => s.id === openId);

  const doRun = () => {
    setRunBusy(true);
    setTimeout(() => {
      app.runPayroll(month);
      setRunBusy(false);
      app.toast(`Payroll computed for ${S.monthLabel(month)} · ${app.staff.filter((e) => e.status !== "left").length} employees · sent for approval`);
    }, 1000);
  };

  const isTeacher = role === "teacher";
  const visibleStaff = isTeacher ? app.staff.filter((s) => s.id === "sf-10") : app.staff;

  return (
    <>
      <PageHead title={isTeacher ? "My HR Record" : "HR & Payroll"} sub={isTeacher ? "Your profile, leave and payslips" : "Employees · payroll · leave management"}>
        <div className="flex items-center gap-2">
          <Select value={month} onChange={(e) => setMonth(e.target.value)} className="!w-44">
            {[-1, 0].map((o) => { const mk = S.monthKey(o); return <option key={mk} value={mk}>{S.monthLabel(mk)}</option>; })}
          </Select>
        </div>
      </PageHead>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "staff", label: "Employees", icon: "users" },
        { id: "payroll", label: "Payroll", icon: "wallet" },
        ...(isTeacher ? [] : [{ id: "leave", label: "Leave", icon: "clock" }]),
      ]} />

      {tab === "staff" && (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="bg-paper"><tr>
                <th className={thCls}>Employee</th><th className={thCls}>Department</th><th className={thCls}>Designation</th>
                <th className={thCls}>Joined</th><th className={thCls}>Salary</th><th className={thCls}>Status</th>
              </tr></thead>
              <tbody>
                {visibleStaff.map((s) => (
                  <tr key={s.id} onClick={() => setOpenId(s.id)} className="cursor-pointer border-t border-linesoft transition hover:bg-primarysoft/40">
                    <td className={tdCls}><span className="flex items-center gap-2.5"><Avatar name={s.name} size={30} /><span><span className="block font-bold text-ink">{s.name}</span><span className="num text-[10px] text-sub">{s.empNo}</span></span></span></td>
                    <td className={tdCls}><Badge tone={s.dept === "Academics" ? "primary" : s.dept === "Accounts" ? "accent" : "neutral"}>{s.dept}</Badge></td>
                    <td className={`${tdCls} font-medium`}>{s.designation}</td>
                    <td className={`${tdCls} num text-sub`}>{S.fmtDate(s.joined)}</td>
                    <td className={`${tdCls} num font-bold text-ink`}>{S.fmtRs(s.salary + s.allowance)}</td>
                    <td className={tdCls}><Badge tone={s.status === "active" ? "ok" : s.status === "on-leave" ? "warn" : "neutral"} dot>{s.status === "on-leave" ? "on leave" : s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "payroll" && (
        <>
          {!run ? (
            <Card>
              <EmptyState icon="wallet" title={`No payroll run for ${S.monthLabel(month)}`}
                body="Compute salaries from attendance, allowances and deductions — payslips will be generated for every active employee."
                action={<Btn icon="refresh" disabled={runBusy} onClick={() => setConfirmRun(true)}>{runBusy ? "Computing…" : "Run payroll"}</Btn>} />
              {runBusy && <div className="mt-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skel h-9 rounded-md" />)}</div>}
            </Card>
          ) : (
            <>
              <div className="stagger mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  ["Employees", String(run.slips.length), "text-ink"],
                  ["Gross total", S.fmtLakh(run.slips.reduce((a, s) => a + s.basic + s.allowance, 0)), "text-primarydeep"],
                  ["Deductions", S.fmtLakh(run.slips.reduce((a, s) => a + s.deduction, 0)), "text-danger"],
                  ["Paid out", `${run.slips.filter((s) => s.status === "paid").length}/${run.slips.length}`, "text-ok"],
                ].map(([l, v, tc]) => (
                  <Card key={l} className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">{l}</div><div className={`num font-display text-[20px] font-extrabold ${tc}`}>{v}</div></Card>
                ))}
              </div>
              <Card pad={false}>
                <div className="flex items-center justify-between border-b border-linesoft p-3">
                  <h3 className="font-display text-[15px] font-extrabold text-ink">Payslips — {S.monthLabel(run.month)}</h3>
                  <Btn v="outline" sz="sm" icon="check" onClick={() => { run.slips.filter((s) => s.status === "unpaid").forEach((s) => app.markSlipPaid(run.id, s.id)); app.toast("All pending salaries marked paid · bank file exported"); }}>Mark all paid</Btn>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead className="bg-paper"><tr>
                      <th className={thCls}>Employee</th><th className={thCls}>Basic</th><th className={thCls}>Allowance</th>
                      <th className={thCls}>Deduction</th><th className={thCls}>Net pay</th><th className={thCls}>Status</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {run.slips.map((sl) => {
                        const emp = staffById(app.staff, sl.staffId);
                        return (
                          <tr key={sl.id} className="border-t border-linesoft transition hover:bg-linesoft/50">
                            <td className={tdCls}><span className="flex items-center gap-2"><Avatar name={emp?.name ?? "?"} size={26} /><span className="font-semibold">{emp?.name}</span></span></td>
                            <td className={`${tdCls} num`}>{S.fmtRs(sl.basic)}</td>
                            <td className={`${tdCls} num text-ok`}>+{S.fmtRs(sl.allowance)}</td>
                            <td className={`${tdCls} num text-danger`}>−{S.fmtRs(sl.deduction)}</td>
                            <td className={`${tdCls} num font-extrabold`}>{S.fmtRs(sl.net)}</td>
                            <td className={tdCls}><Badge tone={sl.status === "paid" ? "ok" : "warn"} dot>{sl.status}</Badge></td>
                            <td className={tdCls}>
                              <span className="flex justify-end gap-1.5">
                                {sl.status === "unpaid" && <Btn v="soft" sz="xs" icon="cash" onClick={() => { app.markSlipPaid(run.id, sl.id); app.toast(`Salary paid to ${emp?.name} · ${S.fmtRs(sl.net)}`); }}>Pay</Btn>}
                                <Btn v="outline" sz="xs" icon="doc" onClick={() => setSlip(sl)}>Slip</Btn>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {tab === "leave" && !isTeacher && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-7" pad={false}>
            <h3 className="border-b border-linesoft px-4 py-3 font-display text-[15px] font-extrabold text-ink">Leave applications</h3>
            <div className="divide-y divide-linesoft">
              {app.leaves.map((l) => {
                const emp = staffById(app.staff, l.staffId);
                return (
                  <div key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <Avatar name={emp?.name ?? "?"} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-ink">{emp?.name} <Badge tone={l.type === "sick" ? "danger" : l.type === "annual" ? "info" : "neutral"}>{l.type}</Badge></div>
                      <div className="num text-[11px] text-sub">{S.fmtDate(l.from)} → {S.fmtDate(l.to)} · {l.days} day(s) · "{l.reason}"</div>
                    </div>
                    {l.status === "pending" ? (
                      <span className="flex gap-1.5">
                        <Btn v="soft" sz="sm" icon="check" onClick={() => { app.leaveDecision(l.id, true); app.toast(`Leave approved for ${emp?.name} · calendar updated`); }}>Approve</Btn>
                        <Btn v="outline" sz="sm" icon="x" onClick={() => { app.leaveDecision(l.id, false); app.toast(`Leave rejected for ${emp?.name}`, "info"); }}>Reject</Btn>
                      </span>
                    ) : (
                      <Badge tone={l.status === "approved" ? "ok" : "danger"} dot>{l.status}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Leave policy 2025–26</h3>
            {[["Casual leave", "12 days / year"], ["Sick leave", "8 days (medical cert. after 2)"], ["Annual leave", "10 days"], ["Maternity leave", "90 days"], ["Paternity leave", "5 days"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-linesoft py-2 text-[12.5px] last:border-0">
                <span className="font-semibold text-ink">{k}</span><span className="num text-sub">{v}</span>
              </div>
            ))}
            <p className="mt-3 rounded-md bg-infosoft px-3 py-2 text-[11.5px] font-medium text-info">Attendance-linked deductions apply automatically in payroll for unapproved absence.</p>
          </Card>
        </div>
      )}

      {/* staff drawer */}
      <Drawer open={!!openId} onClose={() => setOpenId(null)} title={staffRec ? `${staffRec.name} · ${staffRec.empNo}` : ""} w="max-w-lg">
        {staffRec && (
          <div className="space-y-4">
            <Card className="!bg-side !border-sideline text-sidetext">
              <div className="flex items-center gap-3.5">
                <Avatar name={staffRec.name} size={52} className="ring-2 ring-accent" />
                <div className="flex-1">
                  <div className="font-display text-[16px] font-extrabold text-white">{staffRec.name}</div>
                  <div className="text-[12px] text-sidetext">{staffRec.designation} · {staffRec.dept}</div>
                  <div className="num text-[10.5px] text-accent">{staffRec.phone}</div>
                </div>
                <Badge tone={staffRec.status === "active" ? "ok" : "warn"} dot>{staffRec.status}</Badge>
              </div>
            </Card>
            <div className="grid grid-cols-3 gap-2.5">
              {[["Joined", S.fmtDate(staffRec.joined)], ["Gross salary", S.fmtRs(staffRec.salary + staffRec.allowance)], ["Bank", staffRec.bank]].map(([k, v]) => (
                <Card key={k} className="!p-3 text-center"><div className="text-[9.5px] font-bold uppercase tracking-wider text-sub">{k}</div><div className="num mt-0.5 text-[12.5px] font-extrabold text-ink">{v}</div></Card>
              ))}
            </div>
            <Card>
              <h4 className="mb-1.5 font-display text-[13px] font-extrabold text-ink">Leave balance</h4>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-center gap-2"><span className="w-24 text-sub">Casual</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-linesoft"><span className="block h-full rounded-full bg-primary" style={{ width: `${(staffRec.leaveC / 12) * 100}%` }} /></span><span className="num font-bold">{staffRec.leaveC}/12</span></div>
                <div className="flex items-center gap-2"><span className="w-24 text-sub">Annual</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-linesoft"><span className="block h-full rounded-full bg-accent" style={{ width: `${(staffRec.leaveA / 10) * 100}%` }} /></span><span className="num font-bold">{staffRec.leaveA}/10</span></div>
              </div>
            </Card>
            {staffRec.subjects.length > 0 && (
              <Card>
                <h4 className="mb-2 font-display text-[13px] font-extrabold text-ink">Teaching load</h4>
                <div className="flex flex-wrap gap-1.5">
                  {staffRec.subjects.map((sid) => <Badge key={sid} tone="primary">{S.subjectOf(sid).name}</Badge>)}
                  {staffRec.classes.map((c) => <Badge key={c} tone="neutral">{c.replace(/g(\d+)/, "Gr $1-")}</Badge>)}
                </div>
                <p className="mt-2 text-[11.5px] text-sub">26 periods / week · 2 exam duties this term.</p>
              </Card>
            )}
            <Card pad={false}>
              <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Documents</h4>
              <div className="flex flex-wrap gap-2 p-4">
                {["CNIC copy", "Appointment letter", "Qualification certs", "Contract 2025–26"].map((d) => (
                  <button key={d} onClick={() => app.toast(`Opening ${d} (demo)`, "info")} className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-[11.5px] font-semibold transition hover:border-primary/40 hover:bg-primarysoft"><I n="doc" size={12} className="text-primary" />{d}</button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      <PayslipModal slip={slip} onClose={() => setSlip(null)} />
      <Confirm open={confirmRun} onClose={() => setConfirmRun(false)} onYes={doRun} title="Run payroll?" yesLabel="Run payroll"
        body={`This will compute salaries for all active employees for ${S.monthLabel(month)} using attendance and leave inputs. The run stays editable until you lock it.`} />
    </>
  );
}
