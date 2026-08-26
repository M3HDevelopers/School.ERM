import React, { useState } from "react";
import { printNow, useApp } from "../store";
import * as S from "../data/seed";
import { Badge, Btn, Card, HBar, I, PageHead, Select, Seg } from "../components/ui";

export default function Academics() {
  const app = useApp();
  const [classId, setClassId] = useState("g8");
  const [section, setSection] = useState("A");
  const todayIdx = Math.max(0, new Date().getDay() - 1);
  const periods = S.TIMETABLE;

  return (
    <>
      <PageHead title="Timetable & Academics" sub="Master timetable · Session 2025–26 · Term 2">
        <Btn v="outline" sz="sm" icon="print" onClick={printNow}>Print timetable</Btn>
      </PageHead>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <Card pad={false}>
            <div className="flex flex-wrap items-center gap-2.5 border-b border-linesoft p-3">
              <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="!w-32">
                {S.CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Seg options={[{ id: "A", label: "Sec A" }, { id: "B", label: "Sec B" }]} value={section} onChange={setSection} />
              <Badge tone="primary">{S.className(classId)}-{section} · {app.students.filter((s) => s.classId === classId && s.section === section).length || 32} students</Badge>
              <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-sub"><span className="h-2 w-2 rounded-full bg-accent pulse-dot" /> {S.DAYS[todayIdx]} highlighted</span>
            </div>

            <div className="print-stage overflow-x-auto p-3">
              <div className="min-w-[880px]">
                <div className="mb-2 hidden text-center font-display text-[13px] font-extrabold text-ink print:block">
                  {app.school.name} — {S.className(classId)}-{section} Weekly Timetable
                </div>
                <table className="w-full border-separate" style={{ borderSpacing: 3 }}>
                  <thead>
                    <tr>
                      <th className="w-24 rounded-md bg-side px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-sidetext">Period</th>
                      {S.DAYS.map((d, i) => (
                        <th key={d} className={`rounded-md px-2 py-2 text-[11.5px] font-extrabold ${i === todayIdx ? "bg-accent text-side" : "bg-side text-sidetext"}`}>{d}{i === todayIdx ? " · today" : ""}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {S.PERIODS.map((p, pi) => {
                      const isBreakAfter = pi === 2;
                      return (
                        <React.Fragment key={p.label}>
                          <tr>
                            <td className="rounded-md bg-paper px-2 py-1.5">
                              <div className="text-[11px] font-extrabold text-ink">{p.label}</div>
                              <div className="num text-[9.5px] text-sub">{p.time}</div>
                            </td>
                            {S.DAYS.map((d, di) => {
                              const sid = periods[di][pi];
                              const sub = S.subjectOf(sid);
                              const isMySlot = classId === "g8" && sub.teacher === "Saima Akhtar";
                              return (
                                <td key={d} className={`group rounded-md px-2 py-1.5 transition hover:brightness-95 ${di === todayIdx ? "ring-1 ring-accent/60" : ""}`}
                                  style={{ background: `color-mix(in srgb, ${sub.color} 13%, white)` }}>
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-6 w-1 rounded-full" style={{ background: sub.color }} />
                                    <span>
                                      <span className="block text-[11.5px] font-bold leading-tight text-ink">{sub.name}</span>
                                      <span className="block text-[9.5px] text-sub">{sub.teacher.split(" ").slice(-1)[0]}{isMySlot ? " · you" : ""}</span>
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                          {isBreakAfter && (
                            <tr>
                              <td colSpan={7} className="rounded-md bg-accentsoft px-3 py-1 text-center text-[10.5px] font-black uppercase tracking-[0.2em] text-[#8a5c07]">
                                Break · 10:00 – 10:30
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <Card pad={false}>
            <h3 className="border-b border-linesoft px-4 py-2.5 font-display text-[13.5px] font-extrabold text-ink">Subject → Teacher</h3>
            <div className="p-2">
              {S.SUBJECTS.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-linesoft">
                  <span className="num w-10 rounded bg-paper px-1.5 py-0.5 text-center text-[10px] font-bold text-sub">{s.code}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-[12px] font-semibold text-ink">{s.name}</span>
                  <span className="text-[10.5px] text-sub">{s.teacher.split(" ").slice(-1)[0]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-1.5 font-display text-[13.5px] font-extrabold text-ink">Enrollment & capacity</h3>
            {S.ENROLL_BY_CLASS.slice(4, 10).map((c) => (
              <HBar key={c.label} label={c.label} value={c.v} max={80} right={`${c.v}/80`} />
            ))}
            <p className="mt-2 border-t border-linesoft pt-2 text-[11px] text-sub">Grade 10 nearing capacity — consider opening section C.</p>
          </Card>
          <Card>
            <h3 className="mb-2 font-display text-[13.5px] font-extrabold text-ink">Term dates</h3>
            {[["Term 2 begins", S.fmtDate(S.dateISO(-30))], ["Monthly test", S.fmtDate(S.dateISO(2))], ["PTM Grade 8", S.fmtDate(S.dateISO(5))], ["Winter break", S.fmtDate(S.dateISO(24))]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-linesoft py-1.5 text-[12px] last:border-0">
                <span className="text-sub">{k}</span><span className="num font-bold text-ink">{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
