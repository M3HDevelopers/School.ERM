import { useState } from "react";
import { useApp } from "../store";
import { fmtPKR, monthKey, monthLabel, timeAgo } from "../data/seed";
import { Badge, Btn, Card, Donut, HBars, I, Kpi, LineChart, Bars, PageHead, Progress, StatusDot, Tbl, tdCls, thCls } from "../components/ui";

export default function Dashboard() {
  const app = useApp();
  const role = app.session?.role;
  if (role === "teacher") return <TeacherDash />;
  if (role === "student") return <StudentDash />;
  if (role === "parent") return <ParentDash />;
  return <ExecutiveDash />;
}

// ================= EXECUTIVE =================
function ExecutiveDash() {
  const app = useApp();
  const { db } = app;
  const cur = monthKey(0);
  const collectedLive = db.vouchers.filter((v) => v.month === cur).reduce((a, v) => a + v.paid, 0);
  const collected = 918000 + collectedLive;
  const overdueSum = 132000 + db.vouchers.filter((v) => v.status !== "paid" && v.status !== "waived").reduce((a, v) => a + app.balanceOf(v), 0);
  const overdueList = db.vouchers.filter((v) => v.status === "overdue" || v.status === "partial");
  const todayPct = 92;
  const avgMarks = 68;

  const alerts = [
    { icon: "cash", tone: "danger" as const, title: `${overdueList.length} fee challans overdue in Grade 8`, body: `${fmtPKR(overdueSum)} pending — send bulk reminders from Fees.`, go: () => app.go("fees", { tab: "challans", f: "overdue" }) },
    { icon: "checks", tone: "warn" as const, title: "2 students below 75% attendance", body: "Shortage letters recommended before the board registration window.", go: () => app.go("attendance") },
    { icon: "bus", tone: "danger" as const, title: "Route 3 fitness certificate expired", body: "Vehicle LEF-4520 — renewal overdue by 9 days.", go: () => app.go("ops", { tab: "transport" }) },
    { icon: "admit", tone: "ok" as const, title: "6 admission inquiries this week", body: "2 reached interview stage — conversion looking strong.", go: () => app.go("admissions") },
  ];

  return (
    <>
      <PageHead title={`Assalam-o-alaikum, ${app.session?.name?.split(" ")[0]} Ch. Sb`} sub={`Executive overview · Session ${"2025–26"} · Main Campus, Gulberg`}
        actions={<>
          <Btn v="outline" sz="sm" icon="download" onClick={() => app.toast("Executive summary PDF queued to your email", "info")}>Export summary</Btn>
          <Btn sz="sm" icon="plus" onClick={() => app.go("students", { add: "1" })}>New admission</Btn>
        </>} />

      <div className="anim-up grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total students" value={612} spark={db.enrollSeries.map((s) => s.value)} sub={<span><b className="text-ok">+15</b> new this month · 3 withdrawn</span>} onClick={() => app.go("students")} />
        <Kpi label="Today's attendance" value={todayPct} suffix="%" spark={db.attMonth.map((d) => d.value)} sub={<span><b className="text-ok">571 present</b> · 41 absent/late</span>} onClick={() => app.go("attendance")} />
        <Kpi label="Collected (month)" value={collected} prefix="Rs " spark={db.collectionSeries.map((s) => s.value / 1000)} sub={<span className="num">{Math.round((collected / 1550000) * 100)}% of Rs 15.5L target</span>} onClick={() => app.go("fees")} />
        <Kpi label="Outstanding dues" value={overdueSum} prefix="Rs " tone="var(--color-danger)" sub={<span><b className="text-danger">{overdueList.length} challans</b> need follow-up</span>} onClick={() => app.go("fees", { tab: "challans", f: "overdue" })} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Fee collection vs target" sub="Last 8 months · PKR thousands" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("reports")}>Finance reports</Btn>}>
            <LineChart data={db.collectionSeries.map((s) => ({ label: s.label, value: s.value / 1000 }))} fmt={(v) => `Rs ${v}k`} />
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Enrollment trend" sub="Students on roll">
              <LineChart data={db.enrollSeries} height={150} tone="var(--color-accent)" />
            </Card>
            <Card title="Class-wise attendance today" sub="Secondary wing">
              <HBars data={db.classes.slice(4).map((c) => ({ label: c.name, v: 84 + ((c.strength * 7) % 14) }))} fmt={(v) => `${v}%`} />
            </Card>
          </div>
          <Card title="Recent audit trail" sub="Fee, result and record actions — immutable log" actions={<Btn v="ghost" sz="xs" icon="history" onClick={() => app.go("settings", { tab: "audit" })}>Full log</Btn>}>
            <div className="space-y-2">
              {db.schoolAudit.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n="history" size={13} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{a.action} — <span className="font-normal text-sub">{a.detail}</span></p>
                    <p className="text-[10.5px] text-sub/80">{a.user} · {timeAgo(a.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Alert queue" sub="Exceptions needing your decision">
            <div className="space-y-2">
              {alerts.map((a) => (
                <button key={a.title} onClick={a.go} className="focus-ring group flex w-full items-start gap-2.5 rounded-lg border border-line bg-canvas/60 p-3 text-left transition hover:border-primary/40 hover:bg-primarysoft/50">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.tone === "danger" ? "bg-dangersoft text-danger" : a.tone === "warn" ? "bg-warnsoft text-warn" : "bg-oksoft text-ok"}`}><I n={a.icon} size={14} /></span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold leading-snug text-ink">{a.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-sub">{a.body}</span>
                  </span>
                  <I n="chevR" size={13} className="ml-auto mt-1 text-sub/50 group-hover:text-primarydark" />
                </button>
              ))}
            </div>
          </Card>

          <Card title="Admissions funnel" sub="This term · all sources">
            <HBars data={[
              { label: "Inquiries", v: 24, tone: "var(--color-line)" },
              { label: "Applications", v: 17, tone: "color-mix(in srgb, var(--color-primary) 55%, var(--color-line))" },
              { label: "Tests / interviews", v: 11, tone: "color-mix(in srgb, var(--color-primary) 75%, var(--color-line))" },
              { label: "Enrolled", v: 7, tone: "var(--color-primary)" },
            ]} />
            <Btn v="subtle" sz="sm" icon="admit" className="mt-3 w-full" onClick={() => app.go("admissions")}>Open Admissions CRM</Btn>
          </Card>

          <Card title="Staff today" sub="Teaching & support staff" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("hr")}>HR</Btn>}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["46", "Present", "ok"], ["1", "On leave", "warn"], ["1", "Absent", "danger"]].map(([v, l, t]) => (
                <div key={l} className="rounded-lg border border-line bg-canvas/60 py-2.5">
                  <p className="num display text-[19px] font-bold" style={{ color: `var(--color-${t})` }}>{v}</p>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-sub">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3"><Progress pct={96} tone="ok" /><p className="mt-1 text-[11px] text-sub"><b className="text-ok">96%</b> staff attendance · substitute arranged for Science 8-A/B</p></div>
          </Card>

          <Card title="Upcoming" sub="School calendar">
            <div className="space-y-1.5">
              {db.events.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
                  <span className="num w-10 shrink-0 rounded-md bg-primarysoft px-1 py-0.5 text-center text-[10.5px] font-bold text-primarydark">{new Date(e.date + "T12:00:00").getDate()} {new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { month: "short" })}</span>
                  <p className="truncate text-[12px] font-medium text-ink">{e.title}</p>
                  <Badge tone="neutral" className="ml-auto shrink-0">{e.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// ================= TEACHER =================
function TeacherDash() {
  const app = useApp();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const periods: [string, string, string][] = [["8:00", "Mathematics — 8-A", "M-21"], ["8:40", "Mathematics — 8-B", "M-22"], ["10:20", "Mathematics — 9-A", "M-23"], ["11:40", "Duty — Break supervision", "Corridor B"], ["1:00", "Mathematics — 9-B", "M-23"]];
  return (
    <>
      <PageHead title={`Good morning, ${app.session?.name?.split(" ")[0]} Apu`} sub={`Class teacher · Grade 8-A · ${today}`}
        actions={<Btn sz="sm" icon="checks" onClick={() => app.go("attendance")}>Mark 8-A attendance</Btn>} />
      <div className="anim-up grid gap-3 sm:grid-cols-4">
        <Kpi label="Today's periods" value={5} sub="2 free periods · 1 duty slot" onClick={() => app.go("academics")} />
        <Kpi label="Classes assigned" value={4} sub="8-A · 8-B · 9-A · 9-B" onClick={() => app.go("academics")} />
        <Kpi label="Marks pending" value={2} suffix=" lists" tone="var(--color-warn)" sub="Monthly Test — 8-A remaining" onClick={() => app.go("exams")} />
        <Kpi label="8-A attendance today" value={93} suffix="%" sub="1 absent — parent auto-alerted" onClick={() => app.go("attendance")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Today's timetable" sub={today} className="lg:col-span-2">
          <div className="space-y-2">
            {periods.map(([t, s, r], i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${i === 0 ? "border-primary/40 bg-primarysoft/60" : "border-line bg-surface"}`}>
                <span className="num w-12 rounded-md bg-night px-1.5 py-1 text-center text-[11px] font-bold text-canvas">{t}</span>
                <div className="flex-1"><p className="text-[13px] font-bold text-ink">{s}</p><p className="text-[11px] text-sub">Room {r} · 40 min</p></div>
                {i === 0 ? <Badge tone="primary">Now</Badge> : <Badge tone="neutral">{["Next", "", "Afternoon", "", ""][i] || "Later"}</Badge>}
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="My tasks" sub="From coordinator">
            {[{ t: "Monthly Test marks — 8-A", s: "12 of 14 students entered", go: () => app.go("exams") }, { t: "Exercise 6.2 grading", s: "28 copies to check", go: () => app.go("exams") }, { t: "PTM preparation", s: "Saturday — parent slots", go: () => app.go("comms") }].map((w) => (
              <button key={w.t} onClick={w.go} className="group mb-1.5 flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left transition hover:bg-primarysoft/70">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="flex-1"><span className="block text-[12.5px] font-bold text-ink">{w.t}</span><span className="text-[11px] text-sub">{w.s}</span></span>
                <I n="chevR" size={13} className="text-sub/50 group-hover:text-primarydark" />
              </button>
            ))}
          </Card>
          <Card title="Notices for staff">
            {app.db.announcements.filter((a) => a.audience.includes("Teacher")).concat(app.db.announcements.slice(0, 1)).slice(0, 3).map((a) => (
              <div key={a.id} className="mb-2 rounded-lg border border-line bg-canvas/60 p-2.5">
                <p className="text-[12.5px] font-bold text-ink">{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[11.5px] text-sub">{a.body}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

// ================= STUDENT =================
function StudentDash() {
  const app = useApp();
  const me = app.db.students[0];
  const due = app.db.vouchers.filter((v) => v.studentId === me.id && v.status !== "paid").reduce((a, v) => a + app.balanceOf(v), 0);
  return (
    <>
      <PageHead title={`Welcome back, ${me.name.split(" ")[0]}!`} sub="Grade 8-A · Roll 1 · House Iqbal · Main Campus"
        actions={<Btn v="outline" sz="sm" icon="print" onClick={() => app.toast("Digital ID card sent to print queue", "info")}>My ID card</Btn>} />
      <div className="anim-up grid gap-3 sm:grid-cols-4">
        <Kpi label="My attendance" value={me.attendancePct} suffix="%" spark={app.db.attMonth.map((d) => d.value)} sub="3 leaves taken this term" onClick={() => app.go("attendance")} />
        <Kpi label="Due fee" value={due} prefix="Rs " tone={due > 0 ? "var(--color-danger)" : undefined} sub="Challan due on the 10th" onClick={() => app.go("fees")} />
        <Kpi label="Mid-term score" value={71} suffix="%" sub="Grade B · position 5 of 14" onClick={() => app.go("exams")} />
        <Kpi label="Homework pending" value={2} sub="Math Ex 6.2 · Science worksheet" onClick={() => app.go("academics")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Today's classes" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {[["8:00", "Mathematics", "Sara Malik"], ["8:40", "English", "Imran Qureshi"], ["10:20", "General Science", "Nadia Hussain"], ["11:40", "Social Studies", "Adeel Raza"]].map(([t, s, tc]) => (
              <div key={t} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 p-2.5">
                <span className="num rounded-md bg-primarysoft px-1.5 py-0.5 text-[11px] font-bold text-primarydark">{t}</span>
                <div><p className="text-[12.5px] font-bold text-ink">{s}</p><p className="text-[10.5px] text-sub">{tc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/40 bg-accentsoft px-3 py-2 text-[12px] text-ink"><I n="bus" size={14} className="text-warn" /> Route 1 pickup at 7:15 am — Gulberg III stop. Bus is on schedule.</div>
        </Card>
        <Card title="Notice board">
          {app.db.notices.map((n) => (
            <div key={n.id} className="mb-2 flex items-start gap-2.5 rounded-lg border border-line bg-canvas/60 p-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primarysoft text-primarydark"><I n="megaphone" size={12} /></span>
              <div><p className="text-[12px] font-bold leading-snug text-ink">{n.title}</p><p className="text-[10.5px] text-sub">{n.audience} · {timeAgo(n.date + "T09:00:00")}</p></div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

// ================= PARENT =================
function ParentDash() {
  const app = useApp();
  const [kid, setKid] = useState(0);
  const kids = [app.db.students[0], app.db.students[2]];
  const me = kids[kid];
  const due = app.db.vouchers.filter((v) => v.studentId === me.id && v.status !== "paid").reduce((a, v) => a + app.balanceOf(v), 0);
  const latest = app.db.vouchers.filter((v) => v.studentId === me.id).sort((a, b) => b.month.localeCompare(a.month))[0];
  return (
    <>
      <PageHead title={`Assalam-o-alaikum, ${app.session?.name}`} sub="Parent of 2 children · Main Campus"
        actions={
          <div className="flex gap-1.5">
            {kids.map((k, i) => (
              <button key={k.id} onClick={() => setKid(i)} className={`focus-ring rounded-lg border px-3 py-1.5 text-[12px] font-bold transition ${kid === i ? "border-primary bg-primarysoft text-primarydark" : "border-line bg-surface text-sub hover:text-ink"}`}>{k.name.split(" ")[0]} · {k.classId === "g8" ? "8" : "8"}-{k.section}</button>
            ))}
          </div>
        } />
      <div className="anim-up grid gap-3 sm:grid-cols-4">
        <Kpi label={`${me.name.split(" ")[0]}'s attendance`} value={me.attendancePct} suffix="%" sub="Last 30 days" onClick={() => app.go("attendance")} />
        <Kpi label="Outstanding dues" value={due} prefix="Rs " tone={due > 0 ? "var(--color-danger)" : undefined} sub={latest ? `Challan ${latest.no}` : ""} onClick={() => app.go("fees")} />
        <Kpi label="Mid-term result" value={71} suffix="%" sub="Grade B — report card ready" onClick={() => app.go("exams")} />
        <Kpi label="Homework this week" value={3} sub="Math, Science, Urdu" onClick={() => app.go("academics")} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Fee status" sub="Latest challan" className="lg:col-span-1" actions={<Btn v="ghost" sz="xs" icon="arrowR" onClick={() => app.go("fees")}>All challans</Btn>}>
          {latest ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="num text-[15px] font-bold text-ink">{latest.no}</p>
                <Badge tone={latest.status === "paid" ? "ok" : latest.status === "overdue" ? "danger" : "warn"}>{latest.status.toUpperCase()}</Badge>
              </div>
              <p className="mt-1 text-[12px] text-sub">{monthLabel(latest.month)} · due {latest.dueDate}</p>
              <div className="mt-3 space-y-1.5 text-[12.5px]">
                {latest.lines.map((l) => <div key={l.desc} className="flex justify-between"><span className="text-sub">{l.desc}</span><span className="num font-semibold text-ink">{fmtPKR(l.amount)}</span></div>)}
                {latest.discount > 0 && <div className="flex justify-between text-ok"><span>Merit concession</span><span className="num">−{fmtPKR(latest.discount)}</span></div>}
                <div className="flex justify-between border-t border-line pt-1.5 font-bold"><span>Payable</span><span className="num">{fmtPKR(app.balanceOf(latest))}</span></div>
              </div>
              <Btn className="mt-3 w-full" icon="cash" onClick={() => app.go("fees", { pay: latest.id })}>Pay now — JazzCash / Easypaisa</Btn>
            </div>
          ) : <p className="text-[12.5px] text-sub">No challans for this child.</p>}
        </Card>
        <Card title="Recent alerts" sub="Sent to your WhatsApp & SMS" className="lg:col-span-2">
          <div className="space-y-2">
            {[
              { icon: "exam", t: "Mid-term result declared", b: `${me.name.split(" ")[0]} scored 71% — Grade B. Report card available for download.`, when: "2h ago", tone: "ok" },
              { icon: "checks", t: "Attendance alert", b: `${me.name.split(" ")[0]} marked present at 8:02 am today.`, when: "9:05 am", tone: "ok" },
              { icon: "cash", t: "Fee reminder", b: `Challan for ${monthLabel(monthKey(0))} is due by the 10th. Late fee Rs 200 applies after.`, when: "Yesterday", tone: "warn" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-line bg-canvas/60 p-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.tone === "ok" ? "bg-oksoft text-ok" : "bg-warnsoft text-warn"}`}><I n={a.icon} size={15} /></span>
                <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">{a.t}</p><p className="text-[11.5px] leading-relaxed text-sub">{a.b}</p></div>
                <span className="shrink-0 text-[10.5px] text-sub/70">{a.when}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}


