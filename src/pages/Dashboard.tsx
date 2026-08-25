import React, { useMemo, useState } from "react";
import { balanceOf, useApp } from "../store";
import * as S from "../data/seed";
import { AreaChart, Avatar, Badge, Btn, Card, Donut, Funnel, HBar, I, Spark, VBars, useCountUp } from "../components/ui";

/* ============ shared bits ============ */
function Kpi({ label, value, sub, spark, tone, onClick, prefix, suffix }: { label: string; value: number; sub: React.ReactNode; spark?: number[]; tone?: string; onClick?: () => void; prefix?: string; suffix?: string }) {
  const v = useCountUp(value);
  return (
    <button onClick={onClick} className="group rounded-lg border border-line bg-card p-4 text-left shadow-[0_1px_2px_rgba(21,39,32,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sub">{label}</div>
        {spark && <Spark data={spark} w={72} h={26} color={tone ?? "var(--color-primary)"} />}
      </div>
      <div className="num mt-1 font-display text-[24px] font-extrabold leading-none text-ink">
        {prefix}{v.toLocaleString()}{suffix}
      </div>
      <div className="mt-1.5 text-[11.5px] text-sub">{sub}</div>
    </button>
  );
}

const Greeting = ({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{sub}</div>
      <h1 className="mt-0.5 font-display text-[24px] font-extrabold tracking-tight text-ink">{title}</h1>
    </div>
    {children}
  </div>
);

/* ============ ADMIN / EXECUTIVE ============ */
function AdminDash() {
  const app = useApp();
  const att = S.seedAttendanceHistory();
  const series = S.collectionSeries();
  const curMonth = S.monthKey(0);
  const collected = 918000 + app.vouchers.filter((v) => v.month === curMonth).reduce((a, v) => a + v.paid, 0);
  const overdueList = app.vouchers.filter((v) => v.status === "overdue" || (v.status !== "paid" && v.status !== "waived" && v.month < curMonth && balanceOf(v) > 0));
  const overdueSum = 132000 + overdueList.reduce((a, v) => a + balanceOf(v), 0);
  const funnel = S.LEAD_STAGES.map((s) => ({ label: s.label, value: app.leads.filter((l) => l.stage === s.id).length }));
  const todayPct = Math.round(att.monthDays.reduce((a, b) => a + b.pct, 0) / att.monthDays.length);
  const alerts = [
    { icon: "cash", tone: "danger", text: `${overdueList.length} fee challans overdue — ${S.fmtRs(overdueSum)} outstanding`, act: "Open collections", go: () => app.go("fees", { tab: "challans", f: "overdue" }) },
    { icon: "users", tone: "warn", text: "6 students below 75% attendance this month", act: "Attendance report", go: () => app.go("attendance") },
    { icon: "bus", tone: "warn", text: "Route 4 vehicle documents expired 6 days ago", act: "Transport", go: () => app.go("operations", { tab: "transport" }) },
    { icon: "clock", tone: "info", text: "2 leave applications pending approval", act: "HR panel", go: () => app.go("hr", { tab: "leave" }) },
    { icon: "doc", tone: "info", text: "Monthly Test mark entry 62% complete", act: "Exams", go: () => app.go("exams") },
  ];

  return (
    <>
      <Greeting title={`Assalam-o-Alaikum, ${app.session!.name.split(" ").slice(-1)[0]} sahab`} sub={`Executive Overview · ${S.monthLabel(curMonth)}`} >
        <div className="flex flex-wrap gap-2">
          <Btn v="soft" sz="sm" icon="plus" onClick={() => app.go("students", { add: "1" })}>Add student</Btn>
          <Btn v="soft" sz="sm" icon="doc" onClick={() => app.go("fees", { tab: "generate" })}>Generate challans</Btn>
          <Btn v="accent" sz="sm" icon="send" onClick={() => app.go("comms")}>Announcement</Btn>
        </div>
      </Greeting>

      <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Total students" value={626} spark={S.ENROLL_TREND} sub={<><span className="font-bold text-ok">+11</span> this month · 6 withdrawn</>} onClick={() => app.go("students")} />
        <Kpi label="Today's attendance" value={todayPct} suffix="%" spark={att.monthDays.map((d) => d.pct)} sub={<span><span className="font-bold text-ok">571 present</span> · 55 absent/late</span>} onClick={() => app.go("attendance")} />
        <Kpi label="Collected (month)" value={collected} prefix="Rs " spark={series.map((s) => s.value / 1000)} sub={<span className="num">{Math.round((collected / 1550000) * 100)}% of Rs 15.5L target</span>} onClick={() => app.go("fees")} />
        <Kpi label="Outstanding dues" value={overdueSum} prefix="Rs " tone="var(--color-danger)" sub={<span><span className="font-bold text-danger">{overdueList.length} challans</span> need follow-up</span>} onClick={() => app.go("fees", { tab: "challans", f: "overdue" })} />
        <Kpi label="Staff present" value={44} spark={[42, 45, 44, 46, 43, 44, 45, 44]} sub={<span>of 48 · <span className="font-bold text-warn">2 on leave</span></span>} onClick={() => app.go("hr")} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="font-display text-[15px] font-extrabold text-ink">Fee collection vs target</h3>
              <p className="text-[11.5px] text-sub">Last 6 months · dashed line = monthly target</p>
            </div>
            <Badge tone="primary">PKR</Badge>
          </div>
          <AreaChart labels={series.map((s) => s.label)} values={series.map((s) => s.value)} compare={series.map((s) => s.target)} format={S.fmtLakh} />
        </Card>
        <Card className="xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-[15px] font-extrabold text-ink">Attendance by class — today</h3>
              <p className="text-[11.5px] text-sub">Hover for exact percentage</p>
            </div>
            <Btn v="ghost" sz="sm" onClick={() => app.go("attendance")}>Details <I n="arrowR" size={13} /></Btn>
          </div>
          <VBars items={att.byClass.map((c) => ({ label: c.label, v: c.pct }))} format={(n) => `${n}%`} height={168} />
        </Card>

        <Card className="xl:col-span-4">
          <h3 className="font-display text-[15px] font-extrabold text-ink">Admissions funnel</h3>
          <p className="mb-3 text-[11.5px] text-sub">This term · inquiry → enrolment</p>
          <Funnel stages={funnel} />
          <div className="mt-3 border-t border-linesoft pt-2.5 text-[12px] text-sub">
            Conversion <span className="num font-bold text-primarydeep">{funnel[0].value ? Math.round((funnel[4].value / funnel[0].value) * 100) : 0}%</span> · 7 seats left in Grade 1
          </div>
        </Card>
        <Card className="xl:col-span-4">
          <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Lead sources</h3>
          <Donut data={S.LEAD_SOURCES} centerValue={String(app.leads.length)} centerLabel="leads" />
          <div className="mt-3 border-t border-linesoft pt-2.5 text-[12px] text-sub">Website forms feed straight into the CRM pipeline.</div>
        </Card>
        <Card className="xl:col-span-4" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Alert queue</h3>
            <Badge tone="danger" dot>{alerts.length} open</Badge>
          </div>
          <div className="mt-2 space-y-1 p-2">
            {alerts.map((a) => (
              <button key={a.text} onClick={a.go} className="group flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-primarysoft/70">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${a.tone === "danger" ? "bg-dangersoft text-danger" : a.tone === "warn" ? "bg-warnsoft text-warn" : "bg-infosoft text-info"}`}><I n={a.icon} size={14} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold leading-snug text-ink">{a.text}</span>
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-primary opacity-0 transition group-hover:opacity-100">{a.act} →</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-6" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Upcoming events</h3>
            <Btn v="ghost" sz="sm" onClick={() => app.go("operations", { tab: "events" })}>Calendar <I n="arrowR" size={13} /></Btn>
          </div>
          <div className="mt-2 space-y-1 p-2 pb-3">
            {app.events.filter((e) => e.date >= S.todayISO()).slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-linesoft">
                <span className={`num w-14 shrink-0 rounded-md px-2 py-1 text-center text-[11px] font-bold ${e.type === "exam" ? "bg-dangersoft text-danger" : e.type === "holiday" ? "bg-accentsoft text-[#8a5c07]" : e.type === "sports" ? "bg-oksoft text-ok" : "bg-primarysoft text-primarydeep"}`}>
                  {new Date(e.date + "T00:00:00").toLocaleDateString("en", { day: "numeric", month: "short" })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">{e.title}</span>
                  <span className="text-[11px] text-sub">{e.audience}</span>
                </span>
                <Badge tone={e.type === "exam" ? "danger" : e.type === "holiday" ? "accent" : "primary"}>{e.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-6" pad={false}>
          <div className="px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Recent activity — audit trail</h3></div>
          <div className="mt-2 space-y-0.5 p-2 pb-3">
            {app.audit.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 rounded-md px-2 py-1.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1">
                  <span className="text-[12.5px] text-ink"><b>{a.action}</b> · {a.detail}</span>
                  <span className="num block text-[10.5px] text-sub">{a.user} · {S.timeAgo(a.ts)} · {a.module}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

/* ============ TEACHER ============ */
function TeacherDash() {
  const app = useApp();
  const today = new Date().getDay();
  const dayIdx = today === 0 ? 0 : today - 1;
  const row = S.TIMETABLE[dayIdx];
  const myClasses = [
    { key: "g8A", name: "Grade 8-A", role: "Class Teacher", strength: 32 },
    { key: "g9A", name: "Grade 9-A", role: "English", strength: 28 },
  ];
  return (
    <>
      <Greeting title={`Welcome, ${app.session!.name.split(" ")[0]}!`} sub={`Teacher Portal · ${S.DAYS[dayIdx]}`} >
        <div className="flex gap-2">
          <Btn v="soft" sz="sm" icon="check" onClick={() => app.go("attendance")}>Mark attendance</Btn>
          <Btn v="accent" sz="sm" icon="edit" onClick={() => app.go("exams")}>Marks entry</Btn>
        </div>
      </Greeting>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5" pad={false}>
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Today's timetable — 8-A</h3>
            <Badge tone="primary">{S.DAYS[dayIdx]}</Badge>
          </div>
          <div className="mt-2 space-y-1 p-2 pb-3">
            {row.map((sid, i) => {
              const sub = S.subjectOf(sid);
              return (
                <div key={i} className={`flex items-center gap-3 rounded-md px-2 py-2 ${i === 1 ? "bg-primarysoft ring-1 ring-primary/25" : "hover:bg-linesoft"}`}>
                  <span className="num w-20 shrink-0 text-[11px] font-semibold text-sub">{S.PERIODS[i].time}</span>
                  <span className="h-7 w-1.5 rounded-full" style={{ background: sub.color }} />
                  <span className="flex-1 text-[13px] font-bold text-ink">{sub.name}</span>
                  <span className="text-[11px] text-sub">{sub.teacher}</span>
                  {i === 1 && <Badge tone="accent" dot>now</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
        <div className="space-y-4 xl:col-span-4">
          {myClasses.map((c) => {
            const saved = app.attendance[`${S.todayISO()}|${c.key}`];
            return (
              <Card key={c.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-[15px] font-extrabold text-ink">{c.name}</h3>
                    <p className="text-[11.5px] text-sub">{c.role} · {c.strength} students</p>
                  </div>
                  {saved ? <Badge tone="ok" dot>Attendance done</Badge> : <Btn sz="sm" icon="check" onClick={() => app.go("attendance", { cls: c.key })}>Mark now</Btn>}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-linesoft pt-3 text-center">
                  <div><div className="num font-display text-[16px] font-extrabold text-ink">92%</div><div className="text-[10px] font-semibold uppercase text-sub">attendance</div></div>
                  <div><div className="num font-display text-[16px] font-extrabold text-ink">71%</div><div className="text-[10px] font-semibold uppercase text-sub">mid-term avg</div></div>
                  <div><div className="num font-display text-[16px] font-extrabold text-warn">3</div><div className="text-[10px] font-semibold uppercase text-sub">at-risk</div></div>
                </div>
              </Card>
            );
          })}
          <Card>
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Pending work</h3>
            {[{ t: "Monthly Test marks — 8-A", s: "12 of 14 students entered", go: () => app.go("exams") }, { t: "Exercise 6.2 grading", s: "28 copies to check", go: () => app.go("exams") }, { t: "PTM preparation", s: "Saturday — parent slots", go: () => app.go("comms") }].map((w) => (
              <button key={w.t} onClick={w.go} className="group flex w-full items-center gap-2.5 rounded-md px-1.5 py-2 text-left transition hover:bg-primarysoft/70">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="flex-1"><span className="block text-[12.5px] font-bold text-ink">{w.t}</span><span className="text-[11px] text-sub">{w.s}</span></span>
                <I n="chevR" size={14} className="text-sub opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </Card>
        </div>
        <Card className="xl:col-span-3" pad={false}>
          <div className="px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Announcements</h3></div>
          <div className="mt-2 space-y-2 p-3 pb-4">
            {app.announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-md border border-linesoft bg-paper p-2.5">
                <div className="text-[12.5px] font-bold text-ink">{a.title}</div>
                <p className="mt-0.5 line-clamp-2 text-[11.5px] text-sub">{a.body}</p>
                <div className="num mt-1 text-[10px] text-sub">{S.timeAgo(a.ts)} · {a.audience}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

/* ============ STUDENT ============ */
function StudentDash() {
  const app = useApp();
  const me = app.students.find((s) => s.id === S.DEMO_STUDENT)!;
  const dayIdx = Math.max(0, new Date().getDay() - 1);
  const dues = app.vouchers.filter((v) => v.studentId === me.id && (v.status === "generated" || v.status === "partial" || v.status === "overdue"));
  const dueSum = dues.reduce((a, v) => a + balanceOf(v), 0);
  const marks = app.marks["ex-mid|g8A"]?.[me.id];
  const pct = marks ? Object.values(marks).filter((m) => m !== "AB").reduce((a: number, m) => a + (m as number), 0) / (Object.values(marks).filter((m) => m !== "AB").length * 100) * 100 : 0;
  const hw = app.homework.filter((h) => h.classId === me.classId && h.section === me.section);
  return (
    <>
      <Greeting title={`Hello, ${me.name.split(" ")[0]}!`} sub={`Student Portal · ${S.className(me.classId)}-${me.section} · Roll ${me.roll} · House ${me.house}`}>
        <Btn v="accent" sz="sm" icon="cash" onClick={() => app.go("fees")}>Pay fees</Btn>
      </Greeting>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <div className="flex items-center gap-3">
            <Avatar name={me.name} size={46} />
            <div>
              <div className="font-display text-[16px] font-extrabold text-ink">{me.name}</div>
              <div className="num text-[11.5px] text-sub">{me.admNo} · Session {app.school.session}</div>
            </div>
            <Badge tone="ok" dot>Active</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-md bg-primarysoft p-3 text-center"><div className="num font-display text-xl font-extrabold text-primarydeep">{me.attendancePct}%</div><div className="text-[10.5px] font-bold uppercase text-primary">attendance</div></div>
            <div className="rounded-md bg-accentsoft p-3 text-center"><div className="num font-display text-xl font-extrabold text-[#8a5c07]">{S.gradeFor(pct).g}</div><div className="text-[10.5px] font-bold uppercase text-[#8a5c07]">mid-term grade</div></div>
          </div>
          <div className={`mt-3 rounded-md border p-3 ${dueSum > 0 ? "border-danger/30 bg-dangersoft" : "border-ok/30 bg-oksoft"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink">{dueSum > 0 ? `${dues.length} challan(s) due` : "All fees clear"}</span>
              <span className={`num text-[15px] font-extrabold ${dueSum > 0 ? "text-danger" : "text-ok"}`}>{S.fmtRs(dueSum)}</span>
            </div>
            {dueSum > 0 && <Btn v="danger" sz="sm" className="mt-2 w-full" onClick={() => app.go("fees")}>View & pay challans</Btn>}
          </div>
        </Card>
        <Card className="xl:col-span-4" pad={false}>
          <div className="px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Today — {S.DAYS[dayIdx]}</h3></div>
          <div className="mt-2 space-y-1 p-2 pb-3">
            {S.TIMETABLE[dayIdx].slice(0, 5).map((sid, i) => {
              const sub = S.subjectOf(sid);
              return (
                <div key={i} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-linesoft">
                  <span className="num text-[10.5px] font-semibold text-sub w-16">{S.PERIODS[i].label} {S.PERIODS[i].time.split("–")[0]}</span>
                  <span className="h-6 w-1.5 rounded-full" style={{ background: sub.color }} />
                  <span className="text-[13px] font-bold text-ink">{sub.name}</span>
                  <span className="ml-auto text-[11px] text-sub">{sub.teacher}</span>
                </div>
              );
            })}
            <button onClick={() => app.go("timetable")} className="w-full rounded-md px-2 py-1.5 text-center text-[11.5px] font-bold text-primarydeep transition hover:bg-primarysoft">Full week timetable →</button>
          </div>
        </Card>
        <div className="space-y-4 xl:col-span-4">
          <Card pad={false}>
            <div className="px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">Homework</h3></div>
            <div className="p-2 pb-3">
              {hw.map((h) => (
                <button key={h.id} onClick={() => app.toggleHomework(h.id)} className="group flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition hover:bg-linesoft">
                  <span className={`mt-0.5 flex h-4.5 w-4.5 h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${h.done ? "border-primary bg-primary text-white" : "border-line bg-card group-hover:border-primary"}`}>
                    {h.done && <I n="check" size={11} />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[12.5px] font-semibold ${h.done ? "text-sub line-through" : "text-ink"}`}>{h.title}</span>
                    <span className="num text-[10.5px] text-sub">{S.subjectOf(h.subject).name} · due {S.fmtDate(h.due)}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Upcoming exams</h3>
            {app.exams.filter((e) => e.status !== "published").map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-md border border-linesoft bg-paper px-3 py-2">
                <div><div className="text-[12.5px] font-bold text-ink">{e.name}</div><div className="num text-[10.5px] text-sub">{e.window}</div></div>
                <Badge tone="warn" dot>paper dates soon</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ============ PARENT ============ */
function ParentDash() {
  const app = useApp();
  const kids = app.students.filter((s) => S.PARENT_CHILDREN.includes(s.id));
  const [sel, setSel] = useState(kids[0]?.id);
  const child = kids.find((k) => k.id === sel) ?? kids[0];
  if (!child) return null;
  const dues = app.vouchers.filter((v) => v.studentId === child.id && ["generated", "partial", "overdue"].includes(v.status));
  const dueSum = dues.reduce((a, v) => a + balanceOf(v), 0);
  const marks = app.marks["ex-mid|g8A"]?.[child.id];
  const pct = marks ? Object.values(marks).filter((m) => m !== "AB").reduce((a: number, m) => a + (m as number), 0) / (Object.values(marks).filter((m) => m !== "AB").length * 100) * 100 : null;
  return (
    <>
      <Greeting title={`Welcome, ${app.session!.name}`} sub="Parent Portal · 2 children enrolled">
        <Btn v="accent" sz="sm" icon="cash" onClick={() => app.go("fees")}>Pay dues</Btn>
      </Greeting>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {kids.map((k) => {
          const kd = app.vouchers.filter((v) => v.studentId === k.id && ["generated", "partial", "overdue"].includes(v.status)).reduce((a, v) => a + balanceOf(v), 0);
          const active = k.id === child.id;
          return (
            <button key={k.id} onClick={() => setSel(k.id)} className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${active ? "border-primary bg-primarysoft shadow-sm" : "border-line bg-card hover:border-primary/40"}`}>
              <Avatar name={k.name} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-ink">{k.name}</span>
                <span className="block text-[11.5px] text-sub">{S.className(k.classId)}-{k.section} · Roll {k.roll} · {k.house} House</span>
              </span>
              <span className="text-right">
                <span className={`num block text-[14px] font-extrabold ${kd > 0 ? "text-danger" : "text-ok"}`}>{kd > 0 ? S.fmtRs(kd) : "No dues"}</span>
                <span className="num block text-[10.5px] text-sub">attendance {k.attendancePct}%</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">{child.name.split(" ")[0]}'s fees</h3>
          {dues.length === 0 ? (
            <div className="rounded-md border border-ok/30 bg-oksoft p-4 text-center">
              <I n="check" size={20} className="mx-auto text-ok" />
              <p className="mt-1 text-[13px] font-bold text-ok">All challans paid — JazakAllah!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dues.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border border-linesoft bg-paper px-3 py-2">
                  <div><div className="num text-[12px] font-bold text-ink">{S.monthLabel(v.month)}</div><div className="num text-[10.5px] text-sub">{v.no} · due {S.fmtDate(v.due)}</div></div>
                  <div className="text-right">
                    <div className="num text-[13px] font-extrabold text-danger">{S.fmtRs(balanceOf(v))}</div>
                    <Badge tone={v.status === "overdue" ? "danger" : "warn"}>{v.status}</Badge>
                  </div>
                </div>
              ))}
              <Btn v="danger" className="w-full" icon="cash" onClick={() => app.go("fees")}>Pay {S.fmtRs(dueSum)} now</Btn>
            </div>
          )}
          <div className="mt-3 border-t border-linesoft pt-3">
            <h4 className="mb-1.5 text-[12px] font-bold text-ink">Attendance this month</h4>
            <HBar label="Present days" value={Math.round(child.attendancePct * 0.2)} max={20} right={`${child.attendancePct}%`} tone="var(--color-primary)" />
          </div>
        </Card>
        <Card className="xl:col-span-4">
          <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Mid-term snapshot</h3>
          {pct !== null ? (
            <>
              <div className="flex items-center gap-4">
                <span className="num flex h-16 w-16 items-center justify-center rounded-xl bg-primary font-display text-[22px] font-black text-white">{S.gradeFor(pct).g}</span>
                <div>
                  <div className="num font-display text-[20px] font-extrabold text-ink">{pct.toFixed(1)}%</div>
                  <div className="text-[11.5px] text-sub">overall · {Object.keys(marks!).length} subjects</div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {Object.entries(marks!).slice(0, 4).map(([sid, m]) => (
                  <div key={sid} className="flex items-center justify-between rounded bg-paper px-2.5 py-1.5 text-[12px]">
                    <span className="font-semibold text-ink">{S.subjectOf(sid).name}</span>
                    <span className="num font-bold text-sub">{m === "AB" ? "Absent" : `${m}/100 · ${S.gradeFor(m as number).g}`}</span>
                  </div>
                ))}
              </div>
              <Btn v="soft" sz="sm" className="mt-3 w-full" onClick={() => app.go("exams")}>Full report card →</Btn>
            </>
          ) : (
            <div className="rounded-md border border-linesoft bg-paper p-4 text-center text-[12.5px] text-sub">Result not published for this class yet.</div>
          )}
        </Card>
        <Card className="xl:col-span-4" pad={false}>
          <div className="px-4 pt-4"><h3 className="font-display text-[15px] font-extrabold text-ink">School updates</h3></div>
          <div className="mt-2 space-y-2 p-3 pb-4">
            {app.announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-md border border-linesoft bg-paper p-2.5">
                <div className="flex items-center gap-2"><Badge tone="primary">{a.channels.join(" · ")}</Badge><span className="num text-[10px] text-sub">{S.timeAgo(a.ts)}</span></div>
                <div className="mt-1 text-[12.5px] font-bold text-ink">{a.title}</div>
                <p className="line-clamp-2 text-[11.5px] text-sub">{a.body}</p>
              </div>
            ))}
            <button onClick={() => app.go("comms")} className="w-full rounded-md px-2 py-1.5 text-center text-[11.5px] font-bold text-primarydeep transition hover:bg-primarysoft">All announcements →</button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const app = useApp();
  const role = app.session?.role;
  return useMemo(() => {
    if (role === "teacher") return <TeacherDash />;
    if (role === "student") return <StudentDash />;
    if (role === "parent") return <ParentDash />;
    return <AdminDash />;
  }, [role, app.students, app.vouchers, app.leads, app.announcements, app.homework, app.attendance]);
}
