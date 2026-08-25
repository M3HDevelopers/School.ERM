import { useState } from "react";
import { useApp } from "../store";
import { TIMETABLE, TIMETABLE_DAYS, TIMETABLE_PERIODS } from "../data/seed";
import { Badge, Btn, Card, I, PageHead, Progress, Tbl, tdCls, thCls } from "../components/ui";

const SUB_COLORS: Record<string, string> = {
  math: "#0c6b58", eng: "#20415f", urd: "#7c2531", sci: "#1d7a4f", isl: "#9a6511", soc: "#5f7166", comp: "#b3402f",
};

export default function Academics() {
  const app = useApp();
  const [tab, setTab] = useState("timetable");
  const role = app.session?.role;
  const subjects = app.db.subjects;
  const subOf = (id: string) => subjects.find((s) => s.id === id);

  return (
    <>
      <PageHead title="Timetable & Classes" sub="Master timetable · subjects · class capacity — shared to student, parent & teacher portals"
        actions={<Btn v="outline" sz="sm" icon="print" onClick={() => app.toast("Class timetable PDF generated", "info")}>Print timetable</Btn>} />

      <div className="anim-up mb-4 flex gap-1 rounded-lg border border-line bg-canvas p-1 w-fit">
        {[["timetable", "Class Timetable", "cal"], ["subjects", "Subjects", "book"], ["classes", "Classes & Capacity", "building"]].map(([id, l, ic]) => (
          <button key={id} onClick={() => setTab(id)} className={`focus-ring flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[12.5px] font-semibold transition ${tab === id ? "border border-line bg-surface text-primarydark shadow-sm" : "text-sub hover:text-ink"}`}><I n={ic} size={14} /> {l}</button>
        ))}
      </div>

      {tab === "timetable" && (
        <Card title="Grade 8-A — Weekly timetable" sub="Periods 40 min · class teacher Sara Malik · Room M-21" pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead><tr><th className={`${thCls} w-16`}>Time</th>{TIMETABLE_DAYS.map((d) => <th key={d} className={thCls}>{d}</th>)}</tr></thead>
              <tbody>
                {TIMETABLE_PERIODS.map((p, pi) => (
                  <tr key={p}>
                    <td className={`${tdCls} num text-[11.5px] font-bold text-sub`}>{p === "Break" || p === "Lunch" ? "" : p}</td>
                    {TIMETABLE_DAYS.map((day) => {
                      const cell = TIMETABLE[day][pi];
                      if (cell === "break" || cell === "lunch") return <td key={day} className={`${tdCls} bg-accentsoft/50 text-center`}><Badge tone="accent">{cell === "break" ? "TEA BREAK" : "LUNCH & PRAYER"}</Badge></td>;
                      const sub = subOf(cell);
                      return (
                        <td key={day} className={`${tdCls} p-1.5`}>
                          <div className="rounded-lg border-l-4 bg-canvas/70 px-2.5 py-2 transition hover:bg-canvas" style={{ borderColor: SUB_COLORS[cell] ?? "#ccc" }}>
                            <p className="text-[12px] font-bold text-ink">{sub?.name}</p>
                            <p className="text-[10.5px] text-sub">{sub?.teacher}</p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "subjects" && (
        <Card pad={false} title="Subjects — Grade 8" sub="Compulsory set with class-teacher mapping">
          <Tbl head={["Subject", "Code", "Teacher", "Max marks", "Pass marks", "Syllabus coverage"]}>
            {subjects.map((s, i) => (
              <tr key={s.id} className="tbl-row">
                <td className={tdCls}><span className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-sm" style={{ background: SUB_COLORS[s.id] }} /><b>{s.name}</b></span></td>
                <td className={`${tdCls} num`}>{s.code}</td>
                <td className={tdCls}>{s.teacher}</td>
                <td className={`${tdCls} num`}>{s.max}</td>
                <td className={`${tdCls} num`}>{s.pass}</td>
                <td className={tdCls}><span className="flex items-center gap-2 w-40"><Progress pct={[72, 68, 64, 70, 81, 66, 58][i]} /><span className="num text-[11px] font-bold text-sub">{[72, 68, 64, 70, 81, 66, 58][i]}%</span></span></td>
              </tr>
            ))}
          </Tbl>
        </Card>
      )}

      {tab === "classes" && (
        <Card pad={false} title="Classes & sections" sub="Strength, rooms and class teachers — Main Campus">
          <Tbl head={["Class", "Sections", "Strength", "Class teacher", "Room", "Capacity fill"]}>
            {app.db.classes.map((c) => (
              <tr key={c.id} className="tbl-row">
                <td className={`${tdCls} font-bold`}>{c.name}</td>
                <td className={tdCls}>{c.sections.map((s) => <Badge key={s} tone="primary" className="mr-1">{c.name.replace("Grade ", "G")}·{s}</Badge>)}</td>
                <td className={`${tdCls} num font-bold`}>{c.strength}</td>
                <td className={tdCls}>{c.teacher}</td>
                <td className={`${tdCls} num`}>{c.room}</td>
                <td className={tdCls}><span className="flex items-center gap-2 w-40"><Progress pct={Math.round((c.strength / 70) * 100)} tone={c.strength > 63 ? "warn" : "ok"} /><span className="num text-[11px] font-bold text-sub">{Math.round((c.strength / 70) * 100)}%</span></span></td>
              </tr>
            ))}
          </Tbl>
        </Card>
      )}

      {role !== "admin" && (
        <Card className="mt-4" title="Homework & assignments" sub="Assigned to Grade 8-A">
          <div className="grid gap-2 sm:grid-cols-2">
            {[["Mathematics", "Exercise 6.2 — Q1 to Q8", "Due tomorrow", "warn"], ["General Science", "Worksheet: light reflection", "Due Friday", "neutral"], ["Urdu", "Nazm recitation — 'Lab pe aati hai'", "Due Saturday", "neutral"], ["English", "Essay: 'My favourite season' (150 words)", "Submitted ✓", "ok"]].map(([sub, t, due, tone]) => (
              <div key={t} className="flex items-start gap-3 rounded-lg border border-line bg-canvas/60 p-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n="book" size={15} /></span>
                <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">{sub} — {t}</p><Badge tone={tone} className="mt-1">{due}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
