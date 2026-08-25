import { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import type { Student } from "../data/seed";
import { dayKey, fmtDate } from "../data/seed";
import { Badge, Bars, Btn, Card, I, PageHead, Select, StatusDot, Tbl, tdCls, thCls, Avatar } from "../components/ui";

type Mark = "P" | "A" | "L";

export default function Attendance() {
  const app = useApp();
  const role = app.session?.role;
  const [date, setDate] = useState(dayKey(0));
  const [classId, setClassId] = useState("g8");
  const [section, setSection] = useState("A");

  useEffect(() => {
    const cls = app.nav.params?.cls;
    if (cls) {
      const m = /^g(\d+)([AB])$/.exec(cls);
      if (m) { setClassId(`g${m[1]}`); setSection(m[2]); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const students = useMemo(() => app.db.students.filter((s) => s.classId === classId && s.section === section && s.status === "active"), [app.db.students, classId, section]);
  const key = `${date}|${classId}${section}`;
  const saved = app.db.attendance[key];

  const [marks, setMarks] = useState<Record<string, Mark>>(saved ?? {});
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setMarks(app.db.attendance[key] ?? {}); setDirty(false); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (role === "student" || role === "parent") return <MyAttendance />;

  const counts = { P: 0, A: 0, L: 0 };
  students.forEach((s) => { const m = marks[s.id]; if (m) counts[m]++; });
  const marked = counts.P + counts.A + counts.L;

  const setMark = (id: string, m: Mark) => { setMarks((prev) => ({ ...prev, [id]: m })); setDirty(true); };
  const bulk = (m: Mark) => { const all: Record<string, Mark> = {}; students.forEach((s) => (all[s.id] = m)); setMarks(all); setDirty(true); };

  const saveAttendance = () => {
    if (marked < students.length) { app.toast(`Mark all students first — ${students.length - marked} remaining`, "warn"); return; }
    app.set((d) => ({ ...d, attendance: { ...d.attendance, [key]: marks } }));
    setDirty(false);
    const absentees = students.filter((s) => marks[s.id] === "A");
    if (absentees.length) {
      app.notify({ title: `Absence alerts sent (${absentees.length})`, body: `WhatsApp/SMS alert delivered to parents of ${absentees.map((a) => a.name.split(" ")[0]).join(", ")} — ${fmtDate(date)}.`, icon: "wa", forRole: ["admin", "teacher"] });
      app.toast(`Attendance saved · ${absentees.length} absence alert(s) auto-sent to parents via WhatsApp`, "ok");
    } else {
      app.toast("Attendance saved — full house today!", "ok");
    }
    app.set((d) => ({ ...d, schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Attendance saved", detail: `${classId.toUpperCase()}-${section}, ${fmtDate(date)} — ${counts.P}P/${counts.A}A/${counts.L}L` }, ...d.schoolAudit] }));
  };

  return (
    <>
      <PageHead title="Attendance Register" sub="Daily register · absence alerts route through the school's enabled channels"
        actions={<>
          <Btn v="outline" sz="sm" icon="chart" onClick={() => app.go("reports")}>Reports</Btn>
          <Btn sz="sm" icon="check" onClick={saveAttendance} disabled={!dirty && !!saved}>Save & notify parents</Btn>
        </>} />

      <div className="anim-up mb-4 flex flex-wrap items-center gap-2">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-auto">{app.db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select value={section} onChange={(e) => setSection(e.target.value)} className="w-auto"><option>A</option><option>B</option></Select>
        <input type="date" value={date} max={dayKey(0)} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary" />
        {saved && <Badge tone="ok"><I n="check" size={11} /> Saved</Badge>}
        <div className="ml-auto flex gap-1.5">
          <Btn v="subtle" sz="xs" onClick={() => bulk("P")}>All Present</Btn>
          <Btn v="ghost" sz="xs" onClick={() => bulk("A")}>All Absent</Btn>
        </div>
      </div>

      <div className="anim-up mb-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Marked", `${marked}/${students.length}`, "primary", "checks"],
          ["Present", counts.P, "ok", "check"],
          ["Absent", counts.A, "danger", "x"],
          ["Late", counts.L, "warn", "clock"],
        ].map(([l, v, t, i]) => (
          <div key={l as string} className={`rounded-xl border p-3.5 ${t === "ok" ? "border-ok/25 bg-oksoft/60" : t === "danger" ? "border-danger/25 bg-dangersoft/60" : t === "warn" ? "border-warn/25 bg-warnsoft/60" : "border-line bg-surface"}`}>
            <p className={`flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide ${t === "primary" ? "text-primarydark" : `text-${t}`}`}><I n={i as string} size={12} /> {l}</p>
            <p className={`num display mt-1 text-[20px] font-bold ${t === "primary" ? "text-ink" : `text-${t}`}`}>{v}</p>
          </div>
        ))}
      </div>

      <Card pad={false}>
        <Tbl head={["#", "Student", "House", "Mark P", "Mark A", "Mark L", "Note"]}>
          {students.map((s, i) => (
            <tr key={s.id} className="tbl-row">
              <td className={`${tdCls} num w-10 text-sub`}>{s.roll}</td>
              <td className={tdCls}><span className="flex items-center gap-2.5"><Avatar name={s.name} size={28} /><span className="font-bold">{s.name}</span></span></td>
              <td className={`${tdCls} text-sub`}>{s.house}</td>
              {(["P", "A", "L"] as Mark[]).map((m) => (
                <td key={m} className={tdCls}>
                  <button onClick={() => setMark(s.id, m)}
                    className={`focus-ring h-8 w-10 rounded-lg border text-[12px] font-bold transition-all ${marks[s.id] === m
                      ? m === "P" ? "border-ok bg-ok text-white shadow-sm" : m === "A" ? "border-danger bg-danger text-white shadow-sm" : "border-warn bg-warn text-white shadow-sm"
                      : "border-line bg-surface text-sub hover:border-primary/40"}`}>{m}</button>
                </td>
              ))}
              <td className={`${tdCls} text-sub`}>{marks[s.id] === "A" ? <span className="text-danger">Parent will be alerted</span> : marks[s.id] === "L" ? "Late entry logged" : "—"}</td>
            </tr>
          ))}
        </Tbl>
      </Card>
      {students.length === 0 && <p className="mt-4 text-center text-[12.5px] text-sub">No active students in this section yet.</p>}
    </>
  );
}

function MyAttendance() {
  const app = useApp();
  const isParent = app.session?.role === "parent";
  const me = app.db.students[0];
  const data = app.db.attMonth;
  const short = data.filter((d) => d.value < 90);
  return (
    <>
      <PageHead title={isParent ? `${me.name.split(" ")[0]}'s Attendance` : "My Attendance"} sub="Daily summary · synced the moment the register is saved" />
      <div className="anim-up grid gap-4 lg:grid-cols-3">
        <Card title="This month" className="lg:col-span-2"><Bars data={data} fmt={(v) => `${v}%`} /></Card>
        <div className="space-y-4">
          <Card title="Summary">
            <div className="space-y-2.5">
              {[["Present", 15, "ok"], ["Absent", 1, "danger"], ["Late", 1, "warn"], ["Leaves approved", 1, "primary"]].map(([l, v, t]) => (
                <div key={l as string} className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-ink"><StatusDot tone={t as "ok"} /> {l}</span>
                  <span className="num text-[14px] font-bold text-ink">{v} days</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-primarysoft px-3 py-2 text-[11.5px] text-primarydark"><b>{me.attendancePct}%</b> overall — comfortably above the 75% board requirement.</p>
          </Card>
          {short.length > 0 && (
            <Card title="Low-attendance days">
              {short.map((d) => <p key={d.label} className="mb-1 text-[12px] text-sub">Day {d.label} — <b className="text-danger">{d.value}%</b> class attendance</p>)}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
