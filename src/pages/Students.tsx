import React, { useEffect, useMemo, useState } from "react";
import { balanceOf, downloadCSV, useApp } from "../store";
import * as S from "../data/seed";
import { Avatar, Badge, Btn, Card, Drawer, Field, I, Modal, PageHead, Pagination, Select, Spark, tdCls, TextInput, thCls, Barcode, QRSvg, EmptyState } from "../components/ui";

const PER = 9;

function StatusBadge({ s }: { s: S.Student["status"] }) {
  const map = { active: ["ok", "Active"], suspended: ["danger", "Suspended"], transferred: ["info", "Transferred"], withdrawn: ["neutral", "Withdrawn"] } as const;
  const [t, l] = map[s];
  return <Badge tone={t} dot>{l}</Badge>;
}

function AddStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [f, setF] = useState({ name: "", gender: "M" as "M" | "F", dob: "2014-03-12", classId: "g8", section: "A", guardianName: "", relation: "Father", phone: "", address: "", blood: "B+" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  useEffect(() => { if (open) { setF({ name: "", gender: "M", dob: "2014-03-12", classId: "g8", section: "A", guardianName: "", relation: "Father", phone: "", address: "", blood: "B+" }); setErrs({}); } }, [open]);
  const submit = () => {
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Full name required (min 3 letters)";
    if (f.guardianName.trim().length < 3) er.guardianName = "Guardian name required";
    if (f.phone.replace(/\D/g, "").length < 10) er.phone = "Valid mobile required, e.g. 0321-4567890";
    setErrs(er);
    if (Object.keys(er).length) return;
    const rec = app.addStudent({ ...f, name: f.name.trim(), guardianName: f.guardianName.trim() });
    onClose();
    app.go("students", { open: rec.id });
  };
  return (
    <Modal open={open} onClose={onClose} title="New Admission — Student Registration" w="max-w-2xl"
      footer={<><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn icon="check" onClick={submit}>Admit student</Btn></>}>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Full name" err={errs.name}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Zaynab Tariq" /></Field>
        <Field label="Gender"><Select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></Select></Field>
        <Field label="Date of birth"><TextInput type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Blood group"><Select value={f.blood} onChange={(e) => setF({ ...f, blood: e.target.value })}>{["A+", "B+", "O+", "AB+", "A-", "O-"].map((b) => <option key={b}>{b}</option>)}</Select></Field>
        <Field label="Class"><Select value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })}>{S.CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Section"><Select value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}>{S.SECTIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Guardian name" err={errs.guardianName}><TextInput value={f.guardianName} onChange={(e) => setF({ ...f, guardianName: e.target.value })} placeholder="Father / mother name" /></Field>
        <Field label="Relation"><Select value={f.relation} onChange={(e) => setF({ ...f, relation: e.target.value })}><option>Father</option><option>Mother</option><option>Guardian</option></Select></Field>
        <Field label="Guardian mobile" err={errs.phone}><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03xx-xxxxxxx" className="num" /></Field>
        <Field label="Home address"><TextInput value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="House, area, city" /></Field>
      </div>
      <div className="mt-3 rounded-md bg-accentsoft px-3 py-2 text-[12px] font-medium text-[#8a5c07]">
        <I n="star" size={12} className="mr-1 inline" /> Admission number, roll number, house and fee plan ({S.planFor(f.classId).label}) will be assigned automatically.
      </div>
    </Modal>
  );
}

function StudentDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const app = useApp();
  const s = app.students.find((x) => x.id === id);
  if (!s) return null;
  const vouchers = app.vouchers.filter((v) => v.studentId === s.id);
  const dues = vouchers.filter((v) => ["generated", "partial", "overdue"].includes(v.status));
  const dueSum = dues.reduce((a, v) => a + balanceOf(v), 0);
  const attSpark = Array.from({ length: 10 }, (_, i) => s.attendancePct - 8 + Math.round(S.rnd(i + s.roll) * 14));
  return (
    <Drawer open={!!id} onClose={onClose} w="max-w-2xl"
      title={<span className="flex items-center gap-3"><Avatar name={s.name} size={34} />{s.name}<StatusBadge s={s.status} /></span>}>
      <div className="space-y-4">
        {/* header card */}
        <Card className="!bg-side !border-sideline text-sidetext">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={s.name} size={56} className="ring-2 ring-accent" />
            <div className="min-w-0 flex-1">
              <div className="num text-[11px] text-sidetext/70">Admission No</div>
              <div className="num font-display text-xl font-extrabold text-white">{s.admNo}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-sidetext/70">Placement</div>
              <div className="font-display text-[15px] font-bold text-white">{S.className(s.classId)}-{s.section} · Roll {s.roll}</div>
              <div className="text-[11.5px] text-accent">{s.house} House · {s.feePlan}</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card pad={false}>
            <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Personal</h4>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 text-[12.5px]">
              {[["Date of birth", S.fmtDate(s.dob)], ["Gender", s.gender === "M" ? "Male" : "Female"], ["Blood group", s.blood], ["Admitted", S.fmtDate(s.admissionDate)], ["Nationality", "Pakistani"], ["Religion", "Islam"]].map(([k, v]) => (
                <div key={k}><dt className="text-[10.5px] font-bold uppercase tracking-wide text-sub">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card pad={false}>
            <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Guardian & contact</h4>
            <div className="p-4 text-[12.5px]">
              <div className="flex items-center gap-2 font-bold text-ink"><Avatar name={s.guardianName} size={28} />{s.guardianName}<Badge tone="primary">{s.relation}</Badge></div>
              <div className="num mt-2.5 flex items-center gap-2 text-sub"><I n="phone" size={13} />{s.phone}</div>
              <div className="mt-1.5 flex items-start gap-2 text-sub"><I n="home" size={13} className="mt-0.5 shrink-0" />{s.address}</div>
            </div>
          </Card>
        </div>

        {/* attendance + dues */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[13px] font-extrabold text-ink">Attendance trend</h4>
              <span className="num text-[13px] font-extrabold text-primarydeep">{s.attendancePct}%</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <Spark data={attSpark} w={150} h={40} />
              <div className="text-[11px] text-sub">last 10 weeks<br />{s.attendancePct < 75 ? <span className="font-bold text-danger">shortage warning</span> : <span className="font-bold text-ok">healthy</span>}</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[13px] font-extrabold text-ink">Fee status</h4>
              {dueSum > 0 ? <Badge tone="danger" dot>{S.fmtRs(dueSum)} due</Badge> : <Badge tone="ok" dot>Clear</Badge>}
            </div>
            <div className="mt-2 max-h-[92px] space-y-1.5 overflow-y-auto pr-1">
              {vouchers.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded bg-paper px-2.5 py-1.5 text-[11.5px]">
                  <span className="num font-semibold text-ink">{S.monthShort(v.month)} {v.month.slice(0, 4)}</span>
                  <span className="num text-sub">{S.fmtRs(v.total)}</span>
                  <Badge tone={v.status === "paid" ? "ok" : v.status === "overdue" ? "danger" : v.status === "waived" ? "neutral" : "warn"}>{v.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* documents + timeline */}
        <Card pad={false}>
          <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Document vault</h4>
          <div className="flex flex-wrap gap-2 p-4">
            {s.docs.map((d) => (
              <button key={d} onClick={() => app.toast(`Opening ${d} preview (demo)`, "info")} className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-[11.5px] font-semibold text-ink transition hover:border-primary/40 hover:bg-primarysoft">
                <I n="doc" size={13} className="text-primary" />{d}
              </button>
            ))}
          </div>
        </Card>
        <Card pad={false}>
          <h4 className="border-b border-linesoft px-4 py-2.5 font-display text-[13px] font-extrabold text-ink">Student timeline</h4>
          <div className="p-4">
            {[
              { t: `Admitted to ${S.className(s.classId)}-${s.section}`, d: s.admissionDate, icon: "cap", tone: "bg-primarysoft text-primarydeep" },
              { t: "Mid-Term result published — Grade A", d: S.dateISO(-4), icon: "doc", tone: "bg-accentsoft text-[#8a5c07]" },
              { t: "Annual fee challan cleared", d: S.dateISO(-40), icon: "cash", tone: "bg-oksoft text-ok" },
              { t: "House allocation — " + s.house, d: s.admissionDate, icon: "star", tone: "bg-infosoft text-info" },
            ].map((e, i) => (
              <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {i < 3 && <span className="absolute left-[13px] top-7 h-[calc(100%-26px)] w-px bg-line" />}
                <span className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${e.tone}`}><I n={e.icon} size={13} /></span>
                <div><div className="text-[12.5px] font-bold text-ink">{e.t}</div><div className="num text-[10.5px] text-sub">{S.fmtDate(e.d)}</div></div>
              </div>
            ))}
          </div>
        </Card>

        {/* ID card preview */}
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-linesoft px-4 py-2.5">
            <h4 className="font-display text-[13px] font-extrabold text-ink">Student ID card — live preview</h4>
            <Btn v="outline" sz="sm" icon="print" onClick={() => { document.body.classList.add("printing"); setTimeout(() => window.print(), 50); setTimeout(() => document.body.classList.remove("printing"), 2500); }}>Print</Btn>
          </div>
          <div className="flex justify-center bg-linesoft/60 p-5">
            <div className="print-stage w-[340px] overflow-hidden rounded-xl border border-line bg-card shadow-md">
              <div className="flex items-center gap-2.5 bg-side px-4 py-2.5 text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-accent"><I n="cap" size={15} className="text-side" /></span>
                <div className="leading-tight">
                  <div className="font-display text-[12.5px] font-extrabold">{app.school.name}</div>
                  <div className="text-[8.5px] tracking-wider text-sidetext">{app.school.address} · {app.school.phone}</div>
                </div>
              </div>
              <div className="flex gap-3 p-4">
                <Avatar name={s.name} size={64} className="rounded-lg" />
                <div className="min-w-0 flex-1 text-[11px]">
                  <div className="font-display text-[15px] font-extrabold text-ink">{s.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-sub">
                    <span className="num font-semibold text-ink">{s.admNo}</span><span>{S.className(s.classId)}-{s.section}</span>
                    <span>Roll {s.roll}</span><span>{s.house} House</span>
                  </div>
                </div>
                <QRSvg seed={s.admNo} size={56} />
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-line px-4 py-2">
                <Barcode seed={s.admNo} w={120} h={20} />
                <span className="num text-[8.5px] text-sub">Session {app.school.session}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Field label="Change status" className="w-44">
            <Select value={s.status} onChange={(e) => app.updateStudent(s.id, { status: e.target.value as S.Student["status"] }, "Status changed")}>
              <option value="active">Active</option><option value="suspended">Suspended</option>
              <option value="transferred">Transferred</option><option value="withdrawn">Withdrawn</option>
            </Select>
          </Field>
          <Btn v="soft" icon="cash" onClick={() => { onClose(); app.go("fees", { student: s.id }); }}>Fee ledger</Btn>
          <Btn v="outline" icon="send" onClick={() => app.toast(`Reminder SMS queued to ${s.guardianName} (${s.phone})`, "info")}>Message guardian</Btn>
        </div>
      </div>
    </Drawer>
  );
}

export default function Students() {
  const app = useApp();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (app.nav.params?.open) setOpenId(app.nav.params.open);
    if (app.nav.params?.add) setAddOpen(true);
  }, [app.nav.params]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return app.students.filter((s) => {
      if (cls !== "all" && s.classId !== cls) return false;
      if (status !== "all" && s.status !== status) return false;
      if (t && !(`${s.name} ${s.admNo} ${s.guardianName} ${s.phone}`.toLowerCase().includes(t))) return false;
      return true;
    });
  }, [app.students, q, cls, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const rows = filtered.slice((page - 1) * PER, page * PER);
  useEffect(() => setPage(1), [q, cls, status]);

  const exportCSV = () =>
    downloadCSV(`students-${S.todayISO()}`, filtered.map((s) => ({
      admission_no: s.admNo, name: s.name, class: S.className(s.classId), section: s.section, roll: s.roll,
      guardian: s.guardianName, phone: s.phone, status: s.status, attendance_pct: s.attendancePct,
    })));

  const role = app.session?.role ?? "admin";

  return (
    <>
      <PageHead title="Students" sub={`${app.students.length} records · Session ${app.school.session} · Main Campus`}>
        <Btn v="outline" sz="sm" icon="download" onClick={exportCSV}>Export CSV</Btn>
        {role === "admin" && <Btn sz="sm" icon="plus" onClick={() => setAddOpen(true)}>New admission</Btn>}
      </PageHead>

      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-linesoft p-3">
          <div className="relative min-w-[220px] flex-1">
            <I n="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, admission no, guardian, phone…" className="pl-8" />
          </div>
          <Select value={cls} onChange={(e) => setCls(e.target.value)} className="!w-36">
            <option value="all">All classes</option>
            {S.CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-36">
            <option value="all">All statuses</option><option value="active">Active</option>
            <option value="suspended">Suspended</option><option value="transferred">Transferred</option><option value="withdrawn">Withdrawn</option>
          </Select>
          <span className="num ml-auto text-[11.5px] text-sub">{filtered.length} found</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title="No students match" body="Try a different search or clear the class/status filters." action={<Btn v="soft" sz="sm" onClick={() => { setQ(""); setCls("all"); setStatus("all"); }}>Clear filters</Btn>} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="bg-paper">
                <tr>
                  <th className={thCls}>Student</th><th className={thCls}>Class · Roll</th><th className={thCls}>Guardian</th>
                  <th className={thCls}>Attendance</th><th className={thCls}>Fee</th><th className={thCls}>Status</th><th className={thCls}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const dues = app.vouchers.filter((v) => v.studentId === s.id && ["generated", "partial", "overdue"].includes(v.status)).reduce((a, v) => a + balanceOf(v), 0);
                  return (
                    <tr key={s.id} onClick={() => setOpenId(s.id)} className="group cursor-pointer border-t border-linesoft transition hover:bg-primarysoft/50">
                      <td className={tdCls}>
                        <span className="flex items-center gap-2.5">
                          <Avatar name={s.name} size={32} />
                          <span><span className="block font-bold text-ink group-hover:text-primarydeep">{s.name}</span><span className="num text-[10.5px] text-sub">{s.admNo}</span></span>
                        </span>
                      </td>
                      <td className={tdCls}><span className="font-semibold">{S.className(s.classId)}-{s.section}</span><span className="num text-sub"> · {s.roll}</span></td>
                      <td className={tdCls}><span className="block">{s.guardianName}</span><span className="num text-[10.5px] text-sub">{s.phone}</span></td>
                      <td className={tdCls}>
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-linesoft"><span className={`block h-full rounded-full ${s.attendancePct < 75 ? "bg-danger" : s.attendancePct < 85 ? "bg-accent" : "bg-ok"}`} style={{ width: `${s.attendancePct}%` }} /></span>
                          <span className="num text-[12px] font-semibold">{s.attendancePct}%</span>
                        </span>
                      </td>
                      <td className={tdCls}>{dues > 0 ? <span className="num text-[12.5px] font-bold text-danger">{S.fmtRs(dues)}</span> : <Badge tone="ok">clear</Badge>}</td>
                      <td className={tdCls}><StatusBadge s={s.status} /></td>
                      <td className={tdCls}><span className="text-sub opacity-0 transition group-hover:opacity-100"><I n="chevR" size={15} /></span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} />
      </Card>

      <StudentDrawer id={openId} onClose={() => setOpenId(null)} />
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
