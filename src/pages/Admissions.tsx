import React, { useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, Donut, Field, HBar, I, Modal, PageHead, Select, TextArea, TextInput } from "../components/ui";

const SRC_TONE: Record<S.Lead["source"], string> = { "walk-in": "neutral", facebook: "info", website: "primary", referral: "accent", whatsapp: "ok" };

function NewInquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [f, setF] = useState({ name: "", cls: "Grade 1", phone: "", source: "walk-in" as S.Lead["source"], note: "" });
  const [err, setErr] = useState("");
  const submit = () => {
    if (f.name.trim().length < 3) return setErr("Child's full name is required");
    if (f.phone.replace(/\D/g, "").length < 10) return setErr("Valid parent mobile required");
    setErr("");
    app.addLead({ name: f.name.trim(), classApplied: f.cls, phone: f.phone.trim(), source: f.source, note: f.note.trim() || undefined });
    app.toast(`Inquiry for ${f.name.trim()} added to pipeline · callback task created for front desk`);
    setF({ name: "", cls: "Grade 1", phone: "", source: "walk-in", note: "" });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="New Admission Inquiry" w="max-w-md"
      footer={<><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="plus" onClick={submit}>Add to pipeline</Btn></>}>
      <div className="space-y-3.5">
        <Field label="Child's full name" err={err}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Haris Ahmed" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Class applying"><Select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })}>{S.CLASSES.map((c) => <option key={c.id}>{c.name}</option>)}</Select></Field>
          <Field label="Source"><Select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as S.Lead["source"] })}>
            <option value="walk-in">Walk-in</option><option value="facebook">Facebook</option><option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option><option value="referral">Referral</option>
          </Select></Field>
        </div>
        <Field label="Parent mobile"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03xx-xxxxxxx" className="num" /></Field>
        <Field label="Notes"><TextArea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className="min-h-[60px]" placeholder="Previous school, sibling info…" /></Field>
      </div>
    </Modal>
  );
}

export default function Admissions() {
  const app = useApp();
  const [modal, setModal] = useState(false);
  const order: S.Stage[] = ["inquiry", "application", "test", "offer", "enrolled"];
  const stageIdx = (s: S.Stage) => order.indexOf(s);
  const converted = app.leads.filter((l) => l.stage === "enrolled").length;
  void stageIdx;

  return (
    <>
      <PageHead title="Admissions CRM" sub="Inquiry → application → test → offer → enrolment · every lead tracked">
        <Btn v="outline" sz="sm" icon="building" onClick={() => app.go("site")}>Public site form</Btn>
        <Btn sz="sm" icon="plus" onClick={() => setModal(true)}>New inquiry</Btn>
      </PageHead>

      <div className="stagger mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">Open leads</div><div className="num font-display text-[22px] font-extrabold text-ink">{app.leads.filter((l) => l.stage !== "enrolled").length}</div><div className="text-[11px] text-sub">across 4 stages</div></Card>
        <Card className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">Enrolled this term</div><div className="num font-display text-[22px] font-extrabold text-ok">{converted}</div><div className="text-[11px] text-sub">+ 3 offers in pipeline</div></Card>
        <Card className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">Conversion rate</div><div className="num font-display text-[22px] font-extrabold text-primarydeep">{app.leads.length ? Math.round((converted / app.leads.length) * 100) : 0}%</div><div className="text-[11px] text-sub">inquiry → enrolment</div></Card>
        <Card className="!p-3.5"><div className="text-[10.5px] font-bold uppercase tracking-wider text-sub">Next entry test</div><div className="font-display text-[17px] font-extrabold text-ink">Saturday 10 am</div><div className="text-[11px] text-sub">2 candidates booked</div></Card>
      </div>

      {/* pipeline board */}
      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {S.LEAD_STAGES.map((st, ci) => {
          const cards = app.leads.filter((l) => l.stage === st.id);
          return (
            <div key={st.id} className="rounded-lg border border-line bg-paper/70">
              <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wide text-ink">{st.label}</span>
                <span className="num rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-sub ring-1 ring-line">{cards.length}</span>
              </div>
              <div className="space-y-2 p-2.5" style={{ minHeight: 120 }}>
                {cards.length === 0 && <div className="rounded-md border border-dashed border-line px-2 py-4 text-center text-[10.5px] text-sub">Empty stage</div>}
                {cards.map((l) => (
                  <div key={l.id} className="anim-pop rounded-md border border-line bg-card p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start gap-2">
                      <Avatar name={l.name} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-extrabold text-ink">{l.name}</div>
                        <div className="text-[10.5px] text-sub">{l.classApplied}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone={SRC_TONE[l.source]}>{l.source}</Badge>
                      <span className="num text-[9.5px] text-sub">{S.timeAgo(l.ts)}</span>
                    </div>
                    <div className="num mt-1.5 text-[10px] text-sub">{l.phone}</div>
                    <div className="mt-2 flex gap-1.5">
                      {ci > 0 && (
                        <Btn v="outline" sz="xs" className="!px-1.5" onClick={() => app.moveLead(l.id, order[ci - 1])} title="Move back"><I n="chevL" size={12} /></Btn>
                      )}
                      {ci < order.length - 1 && (
                        <Btn v={st.id === "offer" ? "accent" : "soft"} sz="xs" className="flex-1" onClick={() => app.moveLead(l.id, order[ci + 1])}>
                          {st.id === "offer" ? "Enroll ✓" : "Advance"} <I n="chevR" size={11} />
                        </Btn>
                      )}
                      {st.id === "enrolled" && <Badge tone="ok" dot>student created</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Lead sources</h3>
          <Donut data={S.LEAD_SOURCES} centerValue={String(app.leads.length)} centerLabel="this term" />
          <p className="mt-3 border-t border-linesoft pt-2.5 text-[12px] text-sub">
            Website & Facebook lead capture is wired to this pipeline — the public inquiry form creates cards here instantly.
          </p>
        </Card>
        <Card className="xl:col-span-4">
          <h3 className="mb-1 font-display text-[15px] font-extrabold text-ink">Seat capacity by grade</h3>
          {S.ENROLL_BY_CLASS.slice(0, 6).map((c) => (
            <HBar key={c.label} label={c.label} value={c.v} max={80} right={`${c.v}/80 seats`} />
          ))}
          <p className="mt-2 text-[11.5px] text-sub">Grades with free seats get priority in offer letters.</p>
        </Card>
        <Card className="xl:col-span-3">
          <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Workflow</h3>
          {["Inquiry captured (any source)", "Application + documents + fee", "Entry test & interview", "Merit list & offer letter", "First challan → enrolment", "Portal accounts auto-activated"].map((st, i) => (
            <div key={st} className="flex items-start gap-2 py-1.5 text-[12px]">
              <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primarysoft text-[10px] font-extrabold text-primarydeep">{i + 1}</span>
              <span className={i === 4 ? "font-bold text-primarydeep" : "text-sub"}>{st}</span>
            </div>
          ))}
        </Card>
      </div>

      <NewInquiryModal open={modal} onClose={() => setModal(false)} />
    </>
  );
}
