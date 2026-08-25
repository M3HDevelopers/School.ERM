import { useState } from "react";
import { useApp } from "../store";
import type { Lead, Student } from "../data/seed";
import { fmtDate, fmtPKR, dayKey } from "../data/seed";
import { Badge, Btn, Card, Confirm, Donut, HBars, I, PageHead } from "../components/ui";

const STAGES: { id: Lead["stage"]; label: string; icon: string }[] = [
  { id: "inquiry", label: "Inquiry", icon: "phone" },
  { id: "applied", label: "Applied", icon: "exam" },
  { id: "test", label: "Entry Test", icon: "edit" },
  { id: "interview", label: "Interview", icon: "users" },
  { id: "offered", label: "Offer Sent", icon: "send" },
  { id: "enrolled", label: "Enrolled", icon: "check" },
];

export default function Admissions() {
  const app = useApp();
  const [confirmEnroll, setConfirmEnroll] = useState<Lead | null>(null);
  const leads = app.db.leads;
  const byStage = (s: Lead["stage"]) => leads.filter((l) => l.stage === s);

  const advance = (l: Lead) => {
    const idx = STAGES.findIndex((s) => s.id === l.stage);
    const next = STAGES[idx + 1];
    if (!next) return;
    if (next.id === "enrolled") { setConfirmEnroll(l); return; }
    app.set((d) => ({ ...d, leads: d.leads.map((x) => (x.id === l.id ? { ...x, stage: next.id } : x)) }));
    app.notify({ title: `Admission stage: ${next.label}`, body: `${l.name} moved to “${next.label}” — applicant auto-notified via SMS.`, icon: "admit", forRole: ["admin"] });
    app.toast(`${l.name} → ${next.label} (applicant notified)`, "info");
  };

  const enroll = (l: Lead) => {
    const st: Student = {
      id: `s${Date.now()}`, admNo: `DIA-2026-${1001 + app.db.students.length}`, name: l.name, gender: "M", dob: "2013-01-01",
      classId: "g" + (l.applyClass.match(/\d+/)?.[0] ?? "6"), section: "B", roll: 20 + app.db.students.length,
      house: "Iqbal", guardian: l.parentName, relation: "Father", phone: l.phone, address: "Lahore", blood: "B+",
      status: "active", admitted: dayKey(0), feePlan: "Standard", scholarship: 0, attendancePct: 100,
    };
    app.set((d) => ({
      ...d,
      students: [st, ...d.students],
      leads: d.leads.map((x) => (x.id === l.id ? { ...x, stage: "enrolled" as const } : x)),
      schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Applicant enrolled", detail: `${l.name} → ${st.admNo}, ${l.applyClass}-B` }, ...d.schoolAudit],
    }));
    app.notify({ title: "New student enrolled 🎉", body: `${l.name} admitted from the CRM — ${st.admNo}. Portal credentials will be sent to ${l.phone}.`, icon: "student", forRole: ["admin"] });
    app.toast(`${l.name} enrolled — admission no ${st.admNo}. Challan ready in Fees → Generate`, "ok");
  };

  const funnel = STAGES.map((s) => ({ label: s.label, v: byStage(s.id).length }));

  return (
    <>
      <PageHead title="Admissions CRM" sub="Every inquiry from the public website, WhatsApp and walk-ins lands here with source tracking"
        actions={<Btn sz="sm" icon="plus" onClick={() => {
          app.set((d) => ({ ...d, leads: [{ id: `l${Date.now()}`, name: "Walk-in Inquiry", parentName: "—", phone: "+92 3xx", applyClass: "Grade 6", source: "Walk-in", stage: "inquiry" as const, date: dayKey(0), note: "Added manually from front desk", value: 3500 }, ...d.leads] }));
          app.toast("New inquiry card added — edit the details", "info");
        }}>New inquiry</Btn>} />

      <div className="anim-up mb-4 grid gap-4 lg:grid-cols-3">
        <Card title="Pipeline this term" className="lg:col-span-2"><HBars data={funnel.map((f, i) => ({ ...f, tone: i === funnel.length - 1 ? "var(--color-ok)" : "var(--color-primary)" }))} /></Card>
        <Card title="Lead sources"><Donut centerLabel="leads" data={[
          { label: "Website", value: leads.filter((l) => l.source === "Website").length + 3, color: "var(--color-primary)" },
          { label: "Facebook Ad", value: leads.filter((l) => l.source === "Facebook Ad").length + 2, color: "var(--color-accent)" },
          { label: "Referrals", value: 4, color: "#1d7a4f" },
          { label: "Walk-in / other", value: 3, color: "#9a6511" },
        ]} /></Card>
      </div>

      <div className="anim-up grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((st) => (
          <div key={st.id} className="flex min-h-[220px] flex-col rounded-xl border border-line bg-canvas/70 p-2.5">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-sub">
              <I n={st.icon} size={13} /> {st.label}
              <span className="num ml-auto rounded bg-line/80 px-1.5 text-[10.5px]">{byStage(st.id).length}</span>
            </p>
            <div className="flex-1 space-y-2">
              {byStage(st.id).map((l) => (
                <div key={l.id} className="group rounded-lg border border-line bg-surface p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow">
                  <p className="text-[12.5px] font-bold leading-tight text-ink">{l.name}</p>
                  <p className="text-[10.5px] text-sub">{l.applyClass} · {l.source}</p>
                  <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-sub/90">{l.note}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="num text-[10px] text-sub/80">{fmtDate(l.date)}</span>
                    <Badge tone="primary" className="num">{fmtPKR(l.value)}/mo</Badge>
                  </div>
                  {st.id !== "enrolled" && (
                    <Btn v="subtle" sz="xs" className="mt-2 w-full opacity-90" icon="arrowR" onClick={() => advance(l)}>
                      {STAGES[STAGES.findIndex((x) => x.id === l.stage) + 1]?.label}
                    </Btn>
                  )}
                  {st.id === "enrolled" && <p className="mt-2 flex items-center gap-1 text-[10.5px] font-bold text-ok"><I n="check" size={11} /> Student record created</p>}
                </div>
              ))}
              {byStage(st.id).length === 0 && <p className="px-1 py-6 text-center text-[10.5px] text-sub/70">Empty</p>}
            </div>
          </div>
        ))}
      </div>

      <Confirm open={!!confirmEnroll} onClose={() => setConfirmEnroll(null)} onYes={() => confirmEnroll && enroll(confirmEnroll)}
        title="Confirm enrollment" yesLabel="Enroll student"
        body={confirmEnroll && <>This will create a <b>live student record</b> for <b>{confirmEnroll.name}</b> ({confirmEnroll.applyClass}-B) with an admission number, assign a house &amp; roll, and mark the lead <b>Enrolled</b>. Portal credentials go to {confirmEnroll.phone}.</>} />
    </>
  );
}
