import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, I, PageHead, Seg, Select, tdCls, TextInput, thCls, VBars, EmptyState } from "../components/ui";

export default function Attendance() {
  const app = useApp();
  const role = app.session?.role ?? "admin";
  const hist = S.seedAttendanceHistory();
  const [classId, setClassId] = useState(role === "teacher" ? "g8" : "g8");
  const [section, setSection] = useState("A");
  const [date, setDate] = useState(S.todayISO());
  const [marks, setMarks] = useState<Record<string, S.AttMark>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const roster = useMemo(
    () => app.students.filter((s) => s.classId === classId && s.section === section && s.status === "active").sort((a, b) => a.roll - b.roll),
    [app.students, classId, section]
  );
  const key = `${date}|${classId}${section}`;

  useEffect(() => {
    const cls = app.nav.params?.cls;
    if (cls) {
      const m = /^g(\d+)([AB])$/.exec(cls);
      if (m) {
        setClassId(`g${m[1]}`);
        setSection(m[2]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saved = app.attendance[key];
    if (saved) {
      setMarks(saved);
      setSavedKey(key);
    } else {
      const m: Record<string, S.AttMark> = {};
      roster.forEach((s) => (m[s.id] = "P"));
      setMarks(m);
      setSavedKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, roster.length]);

  const dirty = savedKey !== key;
  const counts = { P: 0, A: 0, L: 0 } as Record<S.AttMark, number>;
  Object.values(marks).forEach((m) => counts[m]++);
  const pct = roster.length ? Math.round(((counts.P + counts.L * 0.5) / roster.length) * 100) : 0;
  const allSet = roster.length > 0 && Object.keys(marks).length === roster.length;

  const save = () => {
    const res = app.saveAttendance(classId, section, date, marks);
    setSavedKey(key);
    app.toast(
      res.absent > 0
        ? `Attendance saved · ${res.total - res.absent}/${res.total} present · ${res.absent} absence alert(s) sent to parents via WhatsApp`
        : `Attendance saved · full house! ${res.total}/${res.total} present`,
      "ok"
    );
  };

  /* ---- read-only views for student & parent ---- */
  if (role === "student" || role === "parent") {
    const ids = role === "student" ? [S.DEMO_STUDENT] : S.PARENT_CHILDREN;
    const kids = app.students.filter((s) => ids.includes(s.id));
    return (
      <>
        <PageHead title="Attendance" sub="Live attendance record and monthly trend" />
        <div className="grid gap-4 md:grid-cols-2">
          {kids.map((k) => (
            <Card key={k.id}>
              <div className="flex items-center gap-3">
                <Avatar name={k.name} size={42} />
                <div className="flex-1">
                  <div className="font-display text-[15px] font-extrabold text-ink">{k.name}</div>
                  <div className="text-[11.5px] text-sub">{S.className(k.classId)}-{k.section} · Roll {k.roll}</div>
                </div>
                <div className={`num font-display text-[22px] font-extrabold ${k.attendancePct < 75 ? "text-danger" : "text-primarydeep"}`}>{k.attendancePct}%</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-linesoft">
                <div className="anim-growx h-full rounded-full" style={{ width: `${k.attendancePct}%`, background: k.attendancePct < 75 ? "var(--color-danger)" : "var(--color-primary)" }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-linesoft pt-3 text-center text-[12px]">
                <div><span className="num font-extrabold text-ok">{Math.round(k.attendancePct * 0.19)}</span><span className="block text-[10.5px] text-sub">days present</span></div>
                <div><span className="num font-extrabold text-danger">{Math.round((100 - k.attendancePct) * 0.19)}</span><span className="block text-[10.5px] text-sub">days absent</span></div>
                <div><span className="num font-extrabold text-warn">{k.attendancePct < 75 ? "Yes" : "No"}</span><span className="block text-[10.5px] text-sub">shortage risk</span></div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">School-wide daily attendance</h3>
          <VBars items={hist.monthDays.map((d) => ({ label: d.d, v: d.pct }))} format={(n) => `${n}%`} height={140} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHead title="Attendance" sub="Daily class attendance with automatic parent alerts on absence">
        <Badge tone={dirty ? "warn" : "ok"} dot>{dirty ? "Unsaved changes" : "Saved"}</Badge>
      </PageHead>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card pad={false}>
            <div className="flex flex-wrap items-center gap-2.5 border-b border-linesoft p-3">
              <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="!w-32">
                {S.CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Seg options={[{ id: "A", label: "Sec A" }, { id: "B", label: "Sec B" }]} value={section} onChange={setSection} />
              <TextInput type="date" value={date} max={S.todayISO()} onChange={(e) => setDate(e.target.value)} className="!w-40 num" />
              <div className="ml-auto flex gap-2">
                <Btn v="outline" sz="sm" onClick={() => { const m: Record<string, S.AttMark> = {}; roster.forEach((s) => (m[s.id] = "P")); setMarks(m); }} icon="check">All present</Btn>
                <Btn v="outline" sz="sm" onClick={() => { const m: Record<string, S.AttMark> = {}; roster.forEach((s) => (m[s.id] = "A")); setMarks(m); }} icon="x">All absent</Btn>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-px border-b border-linesoft bg-linesoft">
              {[
                ["Present", counts.P, "text-ok", "bg-oksoft"],
                ["Absent", counts.A, "text-danger", "bg-dangersoft"],
                ["Leave", counts.L, "text-warn", "bg-warnsoft"],
                ["Percentage", `${pct}%`, "text-primarydeep", "bg-primarysoft"],
              ].map(([l, v, tc, bg]) => (
                <div key={l as string} className={`${bg} px-3 py-2.5 text-center`}>
                  <div className={`num font-display text-[17px] font-extrabold ${tc}`}>{v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-sub">{l}</div>
                </div>
              ))}
            </div>

            {roster.length === 0 ? (
              <div className="p-6"><EmptyState title="No active students" body="This section has no active students in the current session." /></div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-paper">
                    <tr><th className={thCls}>#</th><th className={thCls}>Student</th><th className={thCls}>Attendance %</th><th className={thCls}>Mark</th></tr>
                  </thead>
                  <tbody>
                    {roster.map((s) => (
                      <tr key={s.id} className="border-t border-linesoft transition hover:bg-linesoft/60">
                        <td className={`${tdCls} num text-sub`}>{s.roll}</td>
                        <td className={tdCls}>
                          <span className="flex items-center gap-2.5">
                            <Avatar name={s.name} size={30} />
                            <span className="font-semibold text-ink">{s.name}</span>
                          </span>
                        </td>
                        <td className={tdCls}>
                          <span className={`num text-[12px] font-bold ${s.attendancePct < 75 ? "text-danger" : s.attendancePct < 85 ? "text-warn" : "text-ok"}`}>{s.attendancePct}%</span>
                        </td>
                        <td className={tdCls}>
                          <Seg size="sm" value={marks[s.id] ?? "P"} onChange={(v) => setMarks({ ...marks, [s.id]: v })}
                            options={[
                              { id: "P", label: "Present", tone: "var(--color-ok)" },
                              { id: "A", label: "Absent", tone: "var(--color-danger)" },
                              { id: "L", label: "Leave", tone: "var(--color-warn)" },
                            ]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linesoft p-3">
              <p className="flex items-center gap-1.5 text-[11.5px] text-sub">
                <I n="wa" size={13} className="text-ok" /> Absent/leave entries trigger an instant WhatsApp alert to the guardian.
              </p>
              <Btn icon="check" disabled={!allSet || !dirty} onClick={save}>Save attendance</Btn>
            </div>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <Card>
            <h3 className="mb-2 font-display text-[14px] font-extrabold text-ink">Daily trend — this month</h3>
            <VBars items={hist.monthDays.slice(-12).map((d) => ({ label: d.d, v: d.pct }))} format={(n) => `${n}%`} height={110} />
          </Card>
          <Card pad={false}>
            <div className="flex items-center justify-between px-4 pt-3.5">
              <h3 className="font-display text-[14px] font-extrabold text-ink">Chronic absentees</h3>
              <Badge tone="danger" dot>{app.students.filter((s) => s.attendancePct < 80).length}</Badge>
            </div>
            <div className="p-2">
              {app.students.filter((s) => s.attendancePct < 86).slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-linesoft">
                  <Avatar name={s.name} size={28} />
                  <span className="flex-1"><span className="block text-[12.5px] font-semibold text-ink">{s.name}</span><span className="text-[10.5px] text-sub">{S.className(s.classId)}-{s.section}</span></span>
                  <span className={`num text-[12.5px] font-extrabold ${s.attendancePct < 75 ? "text-danger" : "text-warn"}`}>{s.attendancePct}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-1.5 font-display text-[14px] font-extrabold text-ink">Today's coverage</h3>
            <p className="text-[12px] text-sub">Classes with attendance saved today:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.keys(app.attendance).filter((k) => k.startsWith(S.todayISO())).length === 0 ? (
                <span className="text-[12px] font-semibold text-warn">None yet — start with Grade 8-A →</span>
              ) : (
                Object.keys(app.attendance).filter((k) => k.startsWith(S.todayISO())).map((k) => (
                  <Badge key={k} tone="ok" dot>{k.split("|")[1].replace(/g(\d+)/, "Grade $1")}</Badge>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
