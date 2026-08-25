import { useEffect, useMemo, useState } from "react";
import { useApp, printDoc, docHead } from "../store";
import { fmtDate, SCHOOL } from "../data/seed";
import { Avatar, Badge, Btn, Card, I, Modal, PageHead, Tabs, Tbl, tdCls, thCls, Bars, Donut, HBars } from "../components/ui";

type MarksRow = Record<string, number | "AB">;
const gradeOf = (pct: number) => (pct >= 85 ? "A+" : pct >= 75 ? "A" : pct >= 65 ? "B" : pct >= 50 ? "C" : pct >= 40 ? "D" : "F");
const GRADE_TONE: Record<string, string> = { "A+": "ok", A: "ok", B: "primary", C: "warn", D: "warn", F: "danger" };

export default function Exams() {
  const app = useApp();
  const role = app.session?.role;
  const portalUser = role === "student" || role === "parent";
  const [tab, setTab] = useState(portalUser ? "results" : "entry");
  const [examId, setExamId] = useState(portalUser ? "ex-mid" : "ex-mon");
  const [showCard, setShowCard] = useState<string | null>(null);

  const exam = app.db.exams.find((e) => e.id === examId) ?? app.db.exams[0];
  const subjects = app.db.subjects;
  const students = app.db.students.filter((s) => s.classId === "g8" && s.section === "A").slice(0, 14);
  const entrySubs = subjects.slice(0, 3);
  const [entry, setEntry] = useState<Record<string, MarksRow>>(() => JSON.parse(JSON.stringify(app.db.marks["ex-mon|g8A"] ?? {})));

  const results = useMemo(() => {
    const markMap = app.db.marks["ex-mid|g8A"] ?? {};
    const rows = students.map((s) => {
      const row = markMap[s.id] ?? {};
      let got = 0, max = 0, absent = 0;
      subjects.forEach((sub) => {
        const v = row[sub.id];
        if (v === "AB") { absent++; return; }
        if (typeof v === "number") { got += v; max += sub.max; }
      });
      const pct = max ? Math.round((got / max) * 100) : 0;
      return { s, got, max, pct, grade: gradeOf(pct), absent };
    }).sort((a, b) => b.pct - a.pct);
    return rows;
  }, [students, subjects, app.db.marks]);

  const saveEntry = () => {
    app.set((d) => ({ ...d, marks: { ...d.marks, "ex-mon|g8A": entry as Record<string, Record<string, number | "AB">> } }));
    app.toast("Marks saved — grades recalculated instantly", "ok");
  };

  const publish = () => {
    app.set((d) => ({ ...d, exams: d.exams.map((e) => (e.id === "ex-mon" ? { ...e, status: "published" as const } : e)), schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Result published", detail: "Monthly Test — Grade 8-A" }, ...d.schoolAudit] }));
    app.notify({ title: "Monthly Test result published", body: "Grades are now visible on student & parent portals.", icon: "exam", forRole: ["student", "parent", "admin"] });
    app.toast("Result published — students & parents notified", "ok");
  };

  const enteredCount = Object.keys(entry).filter((k) => Object.keys(entry[k] ?? {}).length === 3).length;

  return (
    <>
      <PageHead title="Exams & Results" sub="Marks entry → validation → approval → publish → report cards"
        actions={!portalUser && tab === "entry" ? <Btn sz="sm" icon="send" onClick={publish} disabled={exam.id !== "ex-mon" || app.db.exams.find((e) => e.id === "ex-mon")?.status === "published"}>Publish Monthly Test</Btn> : undefined} />

      {!portalUser && (
        <div className="anim-up mb-4 flex flex-wrap items-center gap-2">
          <Tabs active={tab} onChange={setTab} tabs={[
            { id: "entry", label: "Marks Entry", icon: "edit" },
            { id: "results", label: "Results & Analytics", icon: "chart" },
            { id: "schedule", label: "Exam Schedule", icon: "cal" },
          ]} />
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="ml-auto w-auto rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink outline-none focus:border-primary">
            {app.db.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}

      {portalUser && <PortalResults onCard={setShowCard} />}

      {!portalUser && tab === "entry" && (
        <Card title={`Marks entry — ${exam.name}`} sub={`Grade 8-A · out of 25 per subject · ${enteredCount} of ${students.length} students complete`}
          actions={<Btn sz="sm" icon="check" onClick={saveEntry}>Save marks</Btn>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead><tr><th className={thCls}>#</th><th className={thCls}>Student</th>
                {entrySubs.map((s) => <th key={s.id} className={`${thCls} text-center`}>{s.name}<span className="block text-[9px] font-medium normal-case">/ 25</span></th>)}
                <th className={thCls}>Total</th></tr></thead>
              <tbody>
                {students.map((st) => {
                  const row = entry[st.id] ?? {};
                  const total = entrySubs.reduce((a, s) => a + (typeof row[s.id] === "number" ? (row[s.id] as number) : 0), 0);
                  return (
                    <tr key={st.id} className="tbl-row">
                      <td className={`${tdCls} num text-sub`}>{st.roll}</td>
                      <td className={tdCls}><span className="flex items-center gap-2"><Avatar name={st.name} size={26} /><b>{st.name}</b></span></td>
                      {entrySubs.map((sub) => (
                        <td key={sub.id} className={`${tdCls} text-center`}>
                          <div className="flex items-center justify-center gap-1">
                            <input type="number" min={0} max={25} disabled={row[sub.id] === "AB"} value={row[sub.id] === "AB" ? "" : row[sub.id] ?? ""}
                              onChange={(e) => setEntry((prev) => ({ ...prev, [st.id]: { ...(prev[st.id] ?? {}), [sub.id]: e.target.value === "" ? undefined as unknown as number : Math.max(0, Math.min(25, Number(e.target.value))) } }))}
                              className="num w-14 rounded-md border border-line bg-surface px-1.5 py-1 text-center text-[12.5px] font-bold outline-none transition focus:border-primary disabled:opacity-40" />
                            <button title="Toggle absent" onClick={() => setEntry((prev) => ({ ...prev, [st.id]: { ...(prev[st.id] ?? {}), [sub.id]: prev[st.id]?.[sub.id] === "AB" ? undefined as unknown as number : "AB" } }))}
                              className={`focus-ring rounded px-1 py-0.5 text-[9.5px] font-bold transition ${row[sub.id] === "AB" ? "bg-danger text-white" : "bg-line/70 text-sub hover:bg-dangersoft hover:text-danger"}`}>AB</button>
                          </div>
                        </td>
                      ))}
                      <td className={`${tdCls} num text-center font-bold`}>{row && Object.values(row).some((v) => v === "AB") ? <Badge tone="danger">AB</Badge> : `${total}/75`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!portalUser && tab === "results" && (
        <div className="space-y-4">
          <div className="anim-up grid gap-4 lg:grid-cols-3">
            <Card title="Grade distribution" sub="Grade 8-A · Mid-Term">
              <Donut centerLabel="students" data={(["A+", "A", "B", "C", "D", "F"] as const).map((g, i) => ({
                label: `Grade ${g}`, value: results.filter((r) => r.grade === g).length,
                color: ["#0c6b58", "#1d7a4f", "#c99a2e", "#9a6511", "#b3402f", "#7a2a1f"][i],
              }))} />
            </Card>
            <Card title="Subject averages" sub="Mid-Term · percentage"><HBars data={subjects.map((sub) => {
              const vals = results.map((r) => { const v = (app.db.marks["ex-mid|g8A"] ?? {})[r.s.id]?.[sub.id]; return typeof v === "number" ? Math.round((v / sub.max) * 100) : null; }).filter((x): x is number => x !== null);
              return { label: sub.name, v: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
            })} fmt={(v) => `${v}%`} /></Card>
            <Card title="Top performers" sub="Mid-Term · Grade 8-A">
              <Bars data={results.slice(0, 6).map((r) => ({ label: r.s.name.split(" ")[0], value: r.pct }))} height={150} fmt={(v) => `${v}%`} />
            </Card>
          </div>
          <Card title="Result sheet — Grade 8-A" sub="Mid-Term Examination · approved by Vice Principal · locked" pad={false}
            actions={<Btn v="ghost" sz="xs" icon="lock" onClick={() => app.toast("Result is locked — re-opening requires principal approval with a reason", "warn")}>Result lock</Btn>}>
            <Tbl head={["Pos", "Student", "Marks", "%", "Grade", "Absent", "Report card"]}>
              {results.map((r, i) => (
                <tr key={r.s.id} className="tbl-row">
                  <td className={`${tdCls} num font-bold ${i < 3 ? "text-accent" : "text-sub"}`}>{i + 1}</td>
                  <td className={tdCls}><span className="flex items-center gap-2"><Avatar name={r.s.name} size={26} /><b>{r.s.name}</b></span></td>
                  <td className={`${tdCls} num`}>{r.got}/{r.max}</td>
                  <td className={`${tdCls} num font-bold`}>{r.pct}%</td>
                  <td className={tdCls}><Badge tone={GRADE_TONE[r.grade]}>{r.grade}</Badge></td>
                  <td className={tdCls}>{r.absent ? <Badge tone="danger">{r.absent} paper(s)</Badge> : <span className="text-sub">—</span>}</td>
                  <td className={tdCls}><Btn v="subtle" sz="xs" icon="print" onClick={() => setShowCard(r.s.id)}>Report card</Btn></td>
                </tr>
              ))}
            </Tbl>
          </Card>
        </div>
      )}

      {!portalUser && tab === "schedule" && (
        <Card pad={false} title="Examination schedule" sub="All exams this session">
          <Tbl head={["Exam", "Window", "Classes", "Status"]}>
            {app.db.exams.map((e) => (
              <tr key={e.id} className="tbl-row">
                <td className={`${tdCls} font-bold`}>{e.name}<span className="block text-[10.5px] font-normal text-sub">{e.term}</span></td>
                <td className={`${tdCls} num text-[12px]`}>{fmtDate(e.from)} → {fmtDate(e.to)}</td>
                <td className={tdCls}><span className="text-sub">{e.classes.length} classes</span></td>
                <td className={tdCls}><Badge tone={e.status === "published" ? "ok" : e.status === "entry" ? "warn" : "neutral"}>{e.status.toUpperCase()}</Badge></td>
              </tr>
            ))}
          </Tbl>
        </Card>
      )}

      <ReportCard studentId={showCard} onClose={() => setShowCard(null)} />
    </>
  );
}

function PortalResults({ onCard }: { onCard: (id: string) => void }) {
  const app = useApp();
  const me = app.db.students[0];
  const markMap = app.db.marks["ex-mid|g8A"] ?? {};
  const row = markMap[me.id] ?? {};
  const subjects = app.db.subjects;
  let got = 0, max = 0;
  subjects.forEach((sub) => { const v = row[sub.id]; if (typeof v === "number") { got += v; max += sub.max; } });
  const pct = max ? Math.round((got / max) * 100) : 0;
  return (
    <div className="anim-up grid gap-4 lg:grid-cols-3">
      <Card title="My Mid-Term Result" className="lg:col-span-2" pad={false}
        actions={<Btn sz="sm" icon="print" onClick={() => onCard(me.id)}>Full report card</Btn>}>
        <Tbl head={["Subject", "Max", "Obtained", "%", "Grade"]}>
          {subjects.map((sub) => {
            const v = row[sub.id];
            const sp = typeof v === "number" ? Math.round((v / sub.max) * 100) : 0;
            return (
              <tr key={sub.id} className="tbl-row">
                <td className={`${tdCls} font-bold`}>{sub.name}<span className="block text-[10.5px] font-normal text-sub">{sub.teacher}</span></td>
                <td className={`${tdCls} num`}>{sub.max}</td>
                <td className={tdCls}>{v === "AB" ? <Badge tone="danger">ABSENT</Badge> : <span className="num font-bold">{v ?? "—"}</span>}</td>
                <td className={`${tdCls} num`}>{v === "AB" ? "—" : `${sp}%`}</td>
                <td className={tdCls}><Badge tone={GRADE_TONE[gradeOf(sp)]}>{gradeOf(sp)}</Badge></td>
              </tr>
            );
          })}
        </Tbl>
      </Card>
      <div className="space-y-4">
        <Card title="Summary">
          <p className="num display text-[34px] font-bold text-primarydark">{pct}%</p>
          <p className="text-[12.5px] text-sub">{got} of {max} marks · overall grade <b className="text-ink">{gradeOf(pct)}</b></p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-[12.5px]"><span className="text-sub">Class position</span><b className="num text-ink">5 of 14</b></div>
            <div className="flex justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-[12.5px]"><span className="text-sub">Best subject</span><b className="text-ink">Mathematics</b></div>
            <div className="flex justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-[12.5px]"><span className="text-sub">Needs attention</span><b className="text-danger">Urdu</b></div>
          </div>
          <p className="mt-3 rounded-lg bg-primarysoft px-3 py-2 text-[11.5px] leading-relaxed text-primarydark"><b>Class teacher's note:</b> "Excellent improvement in Mathematics. Let's work on Urdu grammar after Eid break — InshaAllah!"</p>
        </Card>
        <Card title="Progress trend" sub="Term assessments">
          <div className="space-y-2">
            {[["Monthly Test 1", 58], ["Monthly Test 2", 64], ["Mid-Term", pct]].map(([l, v]) => (
              <div key={l as string}>
                <div className="mb-1 flex justify-between text-[11.5px]"><span className="font-medium text-ink">{l}</span><span className="num font-bold text-sub">{v}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-line/70"><div className="h-full rounded-full" style={{ width: `${v}%`, background: "var(--color-primary)" }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportCard({ studentId, onClose }: { studentId: string | null; onClose: () => void }) {
  const app = useApp();
  const stu = studentId ? app.db.students.find((s) => s.id === studentId) : undefined;
  const row = studentId ? (app.db.marks["ex-mid|g8A"] ?? {})[studentId] : undefined;
  if (!stu || !row) return null;
  const subjects = app.db.subjects;
  let got = 0, max = 0;
  subjects.forEach((sub) => { const v = row[sub.id]; if (typeof v === "number") { got += v; max += sub.max; } });
  const pct = max ? Math.round((got / max) * 100) : 0;
  return (
    <Modal open onClose={onClose} title={`Report Card — ${stu.name}`} sub="Mid-Term Examination · Session 2025–26 · QR-verified" wide
      footer={<Btn icon="print" onClick={() => printDoc(`Report Card — ${stu.name}`,
        docHead(app.branding, "PROGRESS REPORT CARD", `Mid-Term Examination · Session 2025–26`) +
        `<div class="grid"><div><b>Student:</b> ${stu.name}</div><div><b>Admission No:</b> ${stu.admNo}</div><div><b>Class:</b> Grade 8-${stu.section} · Roll ${stu.roll}</div><div><b>House:</b> ${stu.house}</div></div>
        <table><thead><tr><th>Subject</th><th>Max</th><th>Obtained</th><th>%</th><th>Grade</th></tr></thead><tbody>
        ${subjects.map((sub) => { const v = row[sub.id]; const sp = typeof v === "number" ? Math.round((v / sub.max) * 100) : 0; return `<tr><td>${sub.name}</td><td>${sub.max}</td><td>${v === "AB" ? "AB" : v ?? "—"}</td><td>${v === "AB" ? "—" : sp + "%"}</td><td>${v === "AB" ? "—" : gradeOf(sp)}</td></tr>`; }).join("")}
        <tr class="total-row"><td>TOTAL</td><td>${max}</td><td>${got}</td><td>${pct}%</td><td>${gradeOf(pct)}</td></tr>
        </tbody></table>
        <div class="grid"><div><b>Position in class:</b> 5 of 14</div><div><b>Attendance (term):</b> ${stu.attendancePct}%</div><div><b>Class teacher:</b> Sara Malik</div><div><b>Result status:</b> Published & locked</div></div>
        <p class="note">Grading: A+ ≥85 · A ≥75 · B ≥65 · C ≥50 · D ≥40 · F &lt;40. Verify authenticity by scanning the QR on the student ID card.</p>
        <div class="sign"><div>Class Teacher</div><div>Vice Principal</div><div>Principal</div></div>`,
        { schoolName: app.branding.schoolName, accent: "#c99a2e" })}>Print report card</Btn>}>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between px-5 py-3 text-white" style={{ background: "var(--color-primary)" }}>
            <p className="display text-[15px] font-bold">{app.branding.schoolName} — Progress Report</p>
            <p className="text-[10.5px] tracking-widest opacity-80">MID-TERM · 2025–26</p>
          </div>
          <table className="w-full text-[12.5px]">
            <thead><tr>{["Subject", "Max", "Obtained", "%", "Grade"].map((h) => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {subjects.map((sub) => {
                const v = row[sub.id];
                const sp = typeof v === "number" ? Math.round((v / sub.max) * 100) : 0;
                return (
                  <tr key={sub.id} className="tbl-row">
                    <td className={`${tdCls} font-bold`}>{sub.name}</td>
                    <td className={`${tdCls} num`}>{sub.max}</td>
                    <td className={tdCls}>{v === "AB" ? <Badge tone="danger">AB</Badge> : <span className="num font-bold">{v}</span>}</td>
                    <td className={`${tdCls} num`}>{v === "AB" ? "—" : `${sp}%`}</td>
                    <td className={tdCls}>{v === "AB" ? "—" : <Badge tone={GRADE_TONE[gradeOf(sp)]}>{gradeOf(sp)}</Badge>}</td>
                  </tr>
                );
              })}
              <tr className="bg-primarysoft/60">
                <td className={`${tdCls} display font-bold`}>TOTAL</td>
                <td className={`${tdCls} num font-bold`}>{max}</td>
                <td className={`${tdCls} num font-bold`}>{got}</td>
                <td className={`${tdCls} num font-bold text-primarydark`}>{pct}%</td>
                <td className={tdCls}><Badge tone={GRADE_TONE[gradeOf(pct)]} className="text-[12px]">{gradeOf(pct)}</Badge></td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line bg-canvas/60 px-5 py-3 text-[11.5px] text-sub">
            <span>Position: <b className="num text-ink">5/14</b></span><span>Attendance: <b className="num text-ink">{stu.attendancePct}%</b></span><span>Class teacher: <b className="text-ink">Sara Malik</b></span>
            <span className="ml-auto flex items-center gap-1 text-ok"><I n="shield" size={12} /> QR-verified document</span>
          </div>
        </div>
      </Modal>
  );
}
