import { useApp, downloadCSV } from "../store";
import { monthLabel } from "../data/seed";
import { Btn, Card, I, PageHead, Bars, HBars } from "../components/ui";

export default function Reports() {
  const app = useApp();
  const rep = (name: string, rows: Record<string, string | number>[]) => { downloadCSV(name, rows); app.toast(`${name}.csv exported — ${rows.length} rows`, "ok"); };

  return (
    <>
      <PageHead title="Reports & Analytics" sub="Every report supports filters in production and exports real CSV here"
        actions={<Btn v="outline" sz="sm" icon="cal" onClick={() => app.toast("Weekly management summary scheduled — every Monday 8:00 am to the principal's email", "info")}>Schedule email reports</Btn>} />

      <div className="anim-up grid gap-4 lg:grid-cols-2">
        <Card title="Fee collection report" sub="By month · PKR thousands"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("fee-collection", app.db.collectionSeries.map((s) => ({ month: s.label, collected_pkr: s.value })))}>CSV</Btn>}>
          <Bars data={app.db.collectionSeries.map((s) => ({ label: s.label, value: Math.round(s.value / 1000) }))} fmt={(v) => `${v}k`} />
        </Card>
        <Card title="Enrollment by class" sub="Active students"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("enrollment-by-class", app.db.classes.map((c) => ({ class: c.name, sections: c.sections.join("/"), strength: c.strength, teacher: c.teacher })))}>CSV</Btn>}>
          <Bars data={app.db.classes.map((c) => ({ label: c.name.replace("Grade ", "G"), value: c.strength }))} height={170} tone="var(--color-accent)" />
        </Card>
        <Card title="Attendance summary" sub="Class-wise today · %"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("attendance-summary", app.db.classes.map((c) => ({ class: c.name, attendance_pct: 84 + ((c.strength * 7) % 14) })))}>CSV</Btn>}>
          <HBars data={app.db.classes.map((c) => ({ label: c.name, v: 84 + ((c.strength * 7) % 14) }))} fmt={(v) => `${v}%`} />
        </Card>
        <Card title="Fee defaulters" sub="Outstanding by student"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("fee-defaulters", app.db.vouchers.filter((v) => v.status !== "paid").map((v) => { const s = app.db.students.find((x) => x.id === v.studentId); return { student: s?.name ?? "", challan: v.no, month: monthLabel(v.month), balance: app.balanceOf(v), status: v.status }; }))}>CSV</Btn>}>
          <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
            {app.db.vouchers.filter((v) => app.balanceOf(v) > 0).slice(0, 8).map((v) => {
              const s = app.db.students.find((x) => x.id === v.studentId);
              return (
                <div key={v.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${v.status === "overdue" ? "bg-dangersoft text-danger" : "bg-warnsoft text-warn"}`}><I n="cash" size={13} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-bold text-ink">{s?.name}</p><p className="text-[10.5px] text-sub">{v.no} · {monthLabel(v.month)}</p></div>
                  <span className="num text-[12.5px] font-bold text-danger">Rs {app.balanceOf(v).toLocaleString()}</span>
                </div>
              );
            })}
            {app.db.vouchers.every((v) => app.balanceOf(v) === 0) && <p className="py-6 text-center text-[12px] text-ok font-semibold">No defaulters — mashallah!</p>}
          </div>
        </Card>
        <Card title="Staff payroll register" sub="Net pay this month"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("payroll-register", app.db.staff.filter((s) => s.status !== "exited").map((s) => ({ employee: s.name, emp_id: s.empId, dept: s.dept, salary: Math.round(s.salary * 1.1) })))}>CSV</Btn>}>
          <HBars data={app.db.staff.filter((s) => s.status !== "exited").slice(0, 6).map((s) => ({ label: s.name, v: Math.round(s.salary * 1.1 / 1000) }))} fmt={(v) => `Rs ${v}k`} />
        </Card>
        <Card title="Admissions conversion" sub="Lead source performance"
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => rep("admissions-sources", app.db.leads.map((l) => ({ name: l.name, class: l.applyClass, source: l.source, stage: l.stage, date: l.date })))}>CSV</Btn>}>
          <div className="space-y-2">
            {app.db.leads.slice(0, 7).map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                <div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-bold text-ink">{l.name} <span className="font-normal text-sub">· {l.applyClass}</span></p><p className="text-[10.5px] text-sub">{l.source}</p></div>
                <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase ${l.stage === "enrolled" ? "bg-oksoft text-ok" : l.stage === "offered" ? "bg-accentsoft text-warn" : "bg-line/70 text-sub"}`}>{l.stage}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
