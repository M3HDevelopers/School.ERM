import React from "react";
import { balanceOf, downloadCSV, studentById, useApp } from "../store";
import * as S from "../data/seed";
import { AreaChart, Btn, Card, I, PageHead, VBars, Donut } from "../components/ui";

export default function Reports() {
  const app = useApp();
  const series = S.collectionSeries();

  const reports = [
    {
      title: "Enrollment report", desc: "Students by class with section split", icon: "users",
      export: () => downloadCSV("enrollment-report", S.ENROLL_BY_CLASS.map((c) => ({ class: c.label, students: c.v, capacity: 80, utilization_pct: Math.round((c.v / 80) * 100) }))),
    },
    {
      title: "Fee collection report", desc: "Monthly collection vs target", icon: "cash",
      export: () => downloadCSV("collection-report", series.map((s) => ({ month: s.label, collected_pkr: s.value, target_pkr: s.target, achievement_pct: Math.round((s.value / s.target) * 100) }))),
    },
    {
      title: "Outstanding & defaulters", desc: "Every unpaid challan with balance", icon: "alert",
      export: () => downloadCSV("defaulters-report", app.vouchers.filter((v) => balanceOf(v) > 0 && v.status !== "waived").map((v) => { const st = studentById(app.students, v.studentId); return { challan: v.no, student: st?.name ?? "", class: st ? `${S.className(st.classId)}-${st.section}` : "", month: v.month, payable: v.total + v.lateFee, paid: v.paid, balance: balanceOf(v), status: v.status }; })),
    },
    {
      title: "Attendance register", desc: "Student-wise attendance percentage", icon: "check",
      export: () => downloadCSV("attendance-report", app.students.map((s) => ({ admission_no: s.admNo, student: s.name, class: `${S.className(s.classId)}-${s.section}`, attendance_pct: s.attendancePct, status: s.attendancePct < 75 ? "chronic absentee" : "ok" }))),
    },
    {
      title: "Payroll summary", desc: "Gross, deductions and net by employee", icon: "wallet",
      export: () => downloadCSV("payroll-summary", app.staff.map((e) => ({ employee: e.name, emp_no: e.empNo, department: e.dept, gross: e.salary + e.allowance, eoobi: Math.round(e.salary * 0.01), net_approx: e.salary + e.allowance - Math.round(e.salary * 0.01) }))),
    },
    {
      title: "Admissions pipeline", desc: "Leads by stage and source", icon: "cap",
      export: () => downloadCSV("admissions-pipeline", app.leads.map((l) => ({ name: l.name, class: l.classApplied, source: l.source, stage: l.stage, since: l.ts }))),
    },
  ];

  return (
    <>
      <PageHead title="Reports & Analytics" sub="Operational reports · every export respects role permissions">
        <Btn v="outline" sz="sm" icon="cal" onClick={() => app.toast("Weekly management summary scheduled — every Monday 8:00 am to principal's email", "info")}>Schedule email reports</Btn>
      </PageHead>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <div><h3 className="font-display text-[15px] font-extrabold text-ink">Revenue trend</h3><p className="text-[11.5px] text-sub">Collection vs monthly target · PKR</p></div>
            <Btn v="outline" sz="sm" icon="download" onClick={() => reports[1].export()}>CSV</Btn>
          </div>
          <AreaChart labels={series.map((s) => s.label)} values={series.map((s) => s.value)} compare={series.map((s) => s.target)} format={S.fmtLakh} height={200} />
        </Card>
        <Card className="xl:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <div><h3 className="font-display text-[15px] font-extrabold text-ink">Expense heads — this month</h3><p className="text-[11.5px] text-sub">Basic accounting layer</p></div>
          </div>
          <Donut data={S.expenseSeries().map((e, i) => ({ label: e.label, value: e.value, color: ["var(--color-primary)", "var(--color-info)", "var(--color-accent)", "var(--color-danger)", "var(--color-sub)"][i] }))} centerValue={S.fmtLakh(S.expenseSeries().reduce((a, b) => a + b.value, 0))} centerLabel="spent" />
        </Card>

        <Card className="xl:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <div><h3 className="font-display text-[15px] font-extrabold text-ink">Enrollment by class</h3><p className="text-[11.5px] text-sub">Capacity 80 per class</p></div>
            <Btn v="outline" sz="sm" icon="download" onClick={() => reports[0].export()}>CSV</Btn>
          </div>
          <VBars items={S.ENROLL_BY_CLASS.map((c) => ({ label: c.label, v: c.v, tone: c.v >= 72 ? "var(--color-accent)" : "var(--color-primary)" }))} height={150} />
        </Card>
        <Card className="xl:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <div><h3 className="font-display text-[15px] font-extrabold text-ink">Enrollment growth — 12 months</h3><p className="text-[11.5px] text-sub">518 → 594 students · +14.7%</p></div>
          </div>
          <AreaChart labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]} values={S.ENROLL_TREND} format={(n) => String(n)} height={170} />
        </Card>
      </div>

      {/* report library */}
      <h2 className="mb-3 mt-6 font-display text-[17px] font-extrabold tracking-tight text-ink">Report library</h2>
      <div className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} className="group flex flex-col transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primarysoft text-primarydeep transition group-hover:bg-primary group-hover:text-white"><I n={r.icon} size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-ink">{r.title}</div>
                <p className="text-[11.5px] text-sub">{r.desc}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-linesoft pt-3">
              <span className="text-[11px] font-semibold text-sub">XLSX · CSV · PDF</span>
              <Btn v="soft" sz="sm" icon="download" onClick={() => { r.export(); app.toast(`${r.title} exported — check your downloads`, "ok"); }}>Export CSV</Btn>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[11.5px] text-sub"><I n="shield" size={13} className="text-primary" /> Exports are watermarked with the requesting user and written to the audit trail.</p>
    </>
  );
}
