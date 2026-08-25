import React, { useMemo, useState } from "react";
import { printNow, useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, I, Modal, PageHead, tdCls, thCls, VBars, EmptyState } from "../components/ui";

const EX_SUBS = ["eng", "urd", "mat", "sci", "isl", "soc"];

type MarksRow = Record<string, number | "AB" | undefined>;

function computeResult(row: MarksRow) {
  const entries = EX_SUBS.map((s) => ({ s, m: row[s] })).filter((e) => e.m !== undefined);
  const graded = entries.filter((e) => e.m !== "AB") as { s: string; m: number }[];
  const obtained = graded.reduce((a, e) => a + e.m, 0);
  const pct = graded.length ? (obtained / (graded.length * 100)) * 100 : 0;
  return { obtained, max: graded.length * 100, pct, grade: S.gradeFor(pct), entries };
}

function ReportCard({ studentId, onClose }: { studentId: string | null; onClose: () => void }) {
  const app = useApp();
  const stu = app.students.find((s) => s.id === studentId);
  const row = studentId ? app.marks["ex-mid|g8A"]?.[studentId] : undefined;
  if (!stu || !row) return null;
  const res = computeResult(row);
  return (
    <Modal open onClose={onClose} title={`Report Card — ${stu.name}`} w="max-w-2xl"
      footer={<><Btn v="outline" onClick={onClose}>Close</Btn><Btn v="accent" icon="print" onClick={printNow}>Print report card</Btn></>}>
      <div className="print-stage rounded-lg border border-line bg-white p-6">
        <div className="flex items-center gap-3 border-b-2 border-side pb-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent"><I n="cap" size={24} className="text-side" /></span>
          <div className="flex-1">
            <div className="font-display text-[17px] font-extrabold leading-tight text-ink">{app.school.name}</div>
            <div className="text-[10.5px] text-sub">{app.school.tagline} · {app.school.address}</div>
          </div>
          <div className="text-right text-[10.5px] font-bold uppercase tracking-wider text-sub">Mid-Term Examination<br /><span className="text-ink">Term 1 · {app.school.session}</span></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-4">
          {[["Student", stu.name], ["Admission No", stu.admNo], ["Class", `${S.className(stu.classId)}-${stu.section}`], ["Roll No", String(stu.roll)],
          ["House", stu.house], ["Guardian", stu.guardianName], ["Attendance", `${stu.attendancePct}%`], ["Result date", S.fmtDate(S.dateISO(-4))]].map(([k, v]) => (
            <div key={k}><span className="block text-[9.5px] font-bold uppercase tracking-wider text-sub">{k}</span><span className="font-semibold text-ink">{v}</span></div>
          ))}
        </div>
        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead><tr className="bg-side text-left text-white">
            <th className="px-3 py-2 font-bold">Subject</th><th className="px-3 py-2 text-right font-bold">Max</th>
            <th className="px-3 py-2 text-right font-bold">Obtained</th><th className="px-3 py-2 text-center font-bold">Grade</th>
          </tr></thead>
          <tbody>
            {res.entries.map(({ s, m }) => (
              <tr key={s} className="border-b border-linesoft">
                <td className="px-3 py-1.5 font-semibold text-ink">{S.subjectOf(s).name}</td>
                <td className="num px-3 py-1.5 text-right text-sub">100</td>
                <td className="num px-3 py-1.5 text-right font-bold text-ink">{m === "AB" ? "AB" : m}</td>
                <td className="px-3 py-1.5 text-center">{m === "AB" ? <Badge tone="neutral">AB</Badge> : <Badge tone={S.gradeFor(m as number).tone}>{S.gradeFor(m as number).g}</Badge>}</td>
              </tr>
            ))}
            <tr className="bg-paper">
              <td className="px-3 py-2 font-extrabold text-ink">Total</td>
              <td className="num px-3 py-2 text-right font-bold">{res.max}</td>
              <td className="num px-3 py-2 text-right font-extrabold">{res.obtained}</td>
              <td className="px-3 py-2 text-center"><Badge tone={res.grade.tone}>{res.grade.g}</Badge></td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-primarysoft p-3"><div className="num font-display text-[20px] font-black text-primarydeep">{res.pct.toFixed(1)}%</div><div className="text-[10px] font-bold uppercase tracking-wide text-primary">percentage</div></div>
          <div className="rounded-lg bg-accentsoft p-3"><div className="font-display text-[20px] font-black text-[#8a5c07]">{res.grade.g}</div><div className="text-[10px] font-bold uppercase tracking-wide text-[#8a5c07]">grade · GPA {res.grade.pts.toFixed(1)}</div></div>
          <div className="rounded-lg bg-oksoft p-3"><div className="font-display text-[20px] font-black text-ok">{res.pct >= 50 ? "PASS" : "FAIL"}</div><div className="text-[10px] font-bold uppercase tracking-wide text-ok">status</div></div>
        </div>
        <p className="mt-4 rounded-md border border-linesoft bg-paper px-3 py-2 text-[11.5px] italic text-sub">
          Remarks: {res.pct >= 85 ? "Outstanding performance — keep shining!" : res.pct >= 70 ? "Very good work. Aim for consistency in Mathematics." : res.pct >= 50 ? "Satisfactory. Regular revision and homework completion will lift grades." : "Needs attention — parents requested to meet the class teacher."}
        </p>
        <div className="mt-6 flex items-end justify-between text-[10.5px] text-sub">
          <span className="num">Verify at verify.dareilm.edu.pk · code {stu.admNo}-MT26</span>
          <div className="flex gap-10 text-center">
            <span className="border-t border-ink/40 px-4 pt-1">Class Teacher</span>
            <span className="border-t border-ink/40 px-4 pt-1">Principal</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Exams() {
  const app = useApp();
  const role = app.session?.role ?? "admin";
  const portalUser = role === "student" || role === "parent";
  const [examId, setExamId] = useState(portalUser ? "ex-mid" : "ex-mon");
  const [showCard, setShowCard] = useState<string | null>(null);
  const exam = app.exams.find((e) => e.id === examId)!;
  const roster = app.students.filter((s) => s.classId === "g8" && s.section === "A" && s.status === "active").sort((a, b) => a.roll - b.roll);

  /* ---- marks entry (draft monthly test) ---- */
  const [entry, setEntry] = useState<Record<string, MarksRow>>(() => {
    const saved = app.marks["ex-mon|g8A"] ?? {};
    const init: Record<string, MarksRow> = {};
    roster.forEach((s) => {
      init[s.id] = saved[s.id] ?? {};
    });
    return init;
  });
  const enteredCount = roster.filter((s) => EX_SUBS.every((sub) => entry[s.id]?.[sub] !== undefined)).length;
  const saveEntry = () => app.saveMarks("ex-mon|g8A", entry as Record<string, Record<string, number | "AB">>);

  /* ---- published results ---- */
  const mid = app.marks["ex-mid|g8A"] ?? {};
  const results = useMemo(() => {
    return roster
      .map((s) => ({ s, res: computeResult(mid[s.id] ?? {}) }))
      .sort((a, b) => b.res.pct - a.res.pct);
  }, [roster, mid]);
  const subAvg = EX_SUBS.map((sub) => {
    const vals = results.map(({ res }) => res.entries.find((e) => e.s === sub)?.m).filter((m): m is number => typeof m === "number");
    return { label: S.subjectOf(sub).code, v: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
  });
  const passPct = results.length ? Math.round((results.filter((r) => r.res.pct >= 40).length / results.length) * 100) : 0;

  const visibleResults = portalUser ? results.filter((r) => (role === "student" ? r.s.id === S.DEMO_STUDENT : S.PARENT_CHILDREN.includes(r.s.id))) : results;

  return (
    <>
      <PageHead title="Exams & Results" sub="Mark entry, automatic grading and published report cards">
        <Badge tone={exam.status === "published" ? "ok" : exam.status === "entry" ? "warn" : "info"} dot>
          {exam.status === "published" ? "Published" : exam.status === "entry" ? "Mark entry open" : exam.status}
        </Badge>
      </PageHead>

      {/* exam cards */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {app.exams.map((e) => (
          <button key={e.id} onClick={() => setExamId(e.id)}
            className={`rounded-lg border p-4 text-left transition-all ${examId === e.id ? "border-primary bg-primarysoft shadow-sm" : "border-line bg-card hover:border-primary/40"}`}>
            <div className="flex items-center justify-between">
              <span className="font-display text-[15px] font-extrabold text-ink">{e.name}</span>
              <Badge tone={e.status === "published" ? "ok" : "warn"} dot>{e.status}</Badge>
            </div>
            <div className="mt-1 text-[12px] text-sub">{e.term} · <span className="num">{e.window}</span></div>
            {e.id === "ex-mon" && !portalUser && (
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-linesoft">
                <div className="anim-growx h-full rounded-full bg-accent" style={{ width: `${(enteredCount / roster.length) * 100}%` }} />
              </div>
            )}
            {e.id === "ex-mon" && !portalUser && <div className="num mt-1 text-[10.5px] text-sub">{enteredCount}/{roster.length} students fully entered</div>}
          </button>
        ))}
      </div>

      {exam.status === "entry" && !portalUser && (
        <Card pad={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linesoft p-3">
            <div>
              <h3 className="font-display text-[15px] font-extrabold text-ink">Marks entry — Grade 8-A · {exam.name}</h3>
              <p className="text-[11.5px] text-sub">Out of 100 per subject · type AB for absent · grades compute live</p>
            </div>
            <Btn icon="check" onClick={saveEntry}>Save marks</Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-paper"><tr>
                <th className={thCls}>Student</th>
                {EX_SUBS.map((s) => <th key={s} className={`${thCls} text-center`}>{S.subjectOf(s).code}</th>)}
                <th className={`${thCls} text-center`}>%</th><th className={`${thCls} text-center`}>Grade</th>
              </tr></thead>
              <tbody>
                {roster.map((s) => {
                  const row = entry[s.id] ?? {};
                  const filled = EX_SUBS.filter((sub) => row[sub] !== undefined);
                  const pct = filled.length ? (filled.reduce((a, sub) => a + (row[sub] === "AB" ? 0 : (row[sub] as number)), 0) / (filled.length * 100)) * 100 : null;
                  return (
                    <tr key={s.id} className="border-t border-linesoft transition hover:bg-linesoft/50">
                      <td className={tdCls}><span className="flex items-center gap-2"><Avatar name={s.name} size={26} /><span className="font-semibold">{s.name}</span><span className="num text-[10px] text-sub">{s.roll}</span></span></td>
                      {EX_SUBS.map((sub) => (
                        <td key={sub} className="px-2 py-1.5 text-center">
                          <input
                            type="number" min={0} max={100}
                            value={row[sub] === "AB" || row[sub] === undefined ? "" : (row[sub] as number)}
                            placeholder={row[sub] === "AB" ? "AB" : "—"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEntry((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], [sub]: v === "" ? undefined : S.clamp(Number(v), 0, 100) },
                              }));
                            }}
                            className={`num w-14 rounded-md border px-2 py-1 text-center text-[12.5px] font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 ${row[sub] === "AB" ? "border-danger/40 bg-dangersoft text-danger" : "border-line bg-card text-ink"}`}
                          />
                          <button onClick={() => setEntry((prev) => ({ ...prev, [s.id]: { ...prev[s.id], [sub]: row[sub] === "AB" ? undefined : "AB" } }))}
                            className={`num ml-1 rounded px-1 py-0.5 text-[9.5px] font-bold transition ${row[sub] === "AB" ? "bg-danger text-white" : "bg-linesoft text-sub hover:bg-dangersoft hover:text-danger"}`} title="Toggle absent">AB</button>
                        </td>
                      ))}
                      <td className={`${tdCls} num text-center font-extrabold ${pct === null ? "text-sub" : pct >= 50 ? "text-primarydeep" : "text-danger"}`}>{pct === null ? "—" : `${Math.round(pct)}%`}</td>
                      <td className={`${tdCls} text-center`}>{pct === null ? <span className="text-sub">—</span> : <Badge tone={S.gradeFor(pct).tone}>{S.gradeFor(pct).g}</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-linesoft p-3 text-[11.5px] text-sub">
            <span>After saving, the coordinator reviews → principal approves → results publish to portals.</span>
            <span className="num font-bold text-primarydeep">{enteredCount}/{roster.length} complete</span>
          </div>
        </Card>
      )}

      {exam.status === "published" && (
        <>
          <div className="stagger mb-4 grid gap-3 sm:grid-cols-3">
            {results.slice(0, 3).map((r, i) => (
              <Card key={r.s.id} className={`relative overflow-hidden ${i === 0 ? "!border-accent" : ""}`}>
                {i === 0 && <span className="absolute right-3 top-3 text-[10px] font-black uppercase tracking-widest text-accent">Position 1</span>}
                <div className="flex items-center gap-3">
                  <Avatar name={r.s.name} size={42} className={i === 0 ? "ring-2 ring-accent" : ""} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-extrabold text-ink">{r.s.name}</div>
                    <div className="num text-[11px] text-sub">Roll {r.s.roll} · {r.s.house} House</div>
                  </div>
                  <div className="text-right">
                    <div className="num font-display text-[19px] font-extrabold text-primarydeep">{r.res.pct.toFixed(1)}%</div>
                    <Badge tone={r.res.grade.tone}>{r.res.grade.g}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-8" pad={false}>
              <div className="flex items-center justify-between border-b border-linesoft p-3">
                <div>
                  <h3 className="font-display text-[15px] font-extrabold text-ink">Result sheet — Grade 8-A</h3>
                  <p className="text-[11.5px] text-sub">Pass mark 40% · class pass rate <b className="text-ok">{passPct}%</b></p>
                </div>
                <Badge tone="primary">locked · approved</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead className="bg-paper"><tr>
                    <th className={thCls}>Pos</th><th className={thCls}>Student</th>
                    {EX_SUBS.map((s) => <th key={s} className={`${thCls} text-center`}>{S.subjectOf(s).code}</th>)}
                    <th className={`${thCls} text-center`}>%</th><th className={`${thCls} text-center`}>Grade</th><th className={thCls}></th>
                  </tr></thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.s.id} className="border-t border-linesoft transition hover:bg-primarysoft/40">
                        <td className={`${tdCls} num font-extrabold ${i < 3 ? "text-accent" : "text-sub"}`}>{i + 1}</td>
                        <td className={tdCls}><span className="font-semibold text-ink">{r.s.name}</span></td>
                        {EX_SUBS.map((sub) => {
                          const m = r.res.entries.find((e) => e.s === sub)?.m;
                          return <td key={sub} className={`${tdCls} num text-center ${m === "AB" ? "text-danger" : (m as number) < 40 ? "text-danger font-bold" : "text-sub"}`}>{m === "AB" ? "AB" : m}</td>;
                        })}
                        <td className={`${tdCls} num text-center font-extrabold text-ink`}>{r.res.pct.toFixed(0)}%</td>
                        <td className={`${tdCls} text-center`}><Badge tone={r.res.grade.tone}>{r.res.grade.g}</Badge></td>
                        {(!portalUser || visibleResults.some((v) => v.s.id === r.s.id)) && (
                          <td className={tdCls}><Btn v="outline" sz="xs" icon="doc" onClick={() => setShowCard(r.s.id)}>Card</Btn></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="space-y-4 xl:col-span-4">
              <Card>
                <h3 className="mb-2 font-display text-[14px] font-extrabold text-ink">Subject averages</h3>
                <VBars items={subAvg.map((x) => ({ ...x, tone: x.v >= 65 ? "var(--color-primary)" : x.v >= 50 ? "var(--color-accent)" : "var(--color-danger)" }))} format={(n) => `${n}%`} height={130} />
                <p className="mt-2 border-t border-linesoft pt-2 text-[11.5px] text-sub">Mathematics needs remedial attention — 4 students below pass mark.</p>
              </Card>
              <Card>
                <h3 className="mb-2 font-display text-[14px] font-extrabold text-ink">Grade distribution</h3>
                <div className="space-y-1.5">
                  {["A+", "A", "B", "C", "D", "F"].map((g) => {
                    const n = results.filter((r) => r.res.grade.g === g).length;
                    return (
                      <div key={g} className="flex items-center gap-2 text-[12px]">
                        <span className="num w-6 font-bold text-ink">{g}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-linesoft"><span className="anim-growx block h-full rounded-full bg-primary" style={{ width: `${(n / results.length) * 100}%` }} /></span>
                        <span className="num w-5 text-right text-sub">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {portalUser && exam.status !== "published" && (
        <EmptyState icon="clock" title="Results not published yet" body="Your teachers are still entering marks. You'll get an app notification the moment results are live." />
      )}

      <ReportCard studentId={showCard} onClose={() => setShowCard(null)} />
    </>
  );
}
