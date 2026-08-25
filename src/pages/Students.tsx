import { useEffect, useMemo, useState } from "react";
import { useApp, downloadCSV, printDoc, docHead } from "../store";
import type { Student } from "../data/seed";
import { fmtDate, fmtPKR, monthLabel, initials } from "../data/seed";
import { Badge, Barcode, Btn, Card, Drawer, EmptyState, Field, I, Modal, PageHead, Pagination, QRBox, SearchInput, Select, Spark, StatusDot, Tbl, TextInput, tdCls, thCls, Avatar } from "../components/ui";

const PER = 9;

export default function Students() {
  const app = useApp();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Student | null>(null);
  const [add, setAdd] = useState(false);
  const [idCard, setIdCard] = useState<Student | null>(null);

  useEffect(() => {
    if (app.nav.params?.add) setAdd(true);
    const open = app.nav.params?.open;
    if (open) { const s = app.db.students.find((x) => x.id === open); if (s) setSel(s); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return app.db.students.filter((st) => {
      if (cls !== "all" && !(st.classId === cls && true)) return false;
      if (cls !== "all" && st.classId !== cls) return false;
      if (status !== "all" && st.status !== status) return false;
      if (s && !(st.name + st.admNo + st.guardian + st.phone).toLowerCase().includes(s)) return false;
      return true;
    });
  }, [app.db.students, q, cls, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const rows = filtered.slice((page - 1) * PER, page * PER);

  const exportCSV = () => {
    downloadCSV("students", filtered.map((s) => ({ adm_no: s.admNo, name: s.name, gender: s.gender, class: s.classId, section: s.section, roll: s.roll, guardian: s.guardian, phone: s.phone, status: s.status, attendance_pct: s.attendancePct })));
    app.toast(`Exported ${filtered.length} students to CSV`);
  };

  return (
    <>
      <PageHead title="Students" sub={`${app.db.students.filter((s) => s.status === "active").length} active on roll · smart search by name, admission no, parent or phone`}
        actions={<>
          <Btn v="outline" sz="sm" icon="download" onClick={exportCSV}>Export CSV</Btn>
          <Btn sz="sm" icon="plus" onClick={() => setAdd(true)}>New Admission</Btn>
        </>} />

      <div className="anim-up mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, admission no, parent, phone…" className="w-full sm:w-80" />
        <Select value={cls} onChange={(e) => { setCls(e.target.value); setPage(1); }} className="w-auto">
          <option value="all">All classes</option>
          {app.db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto">
          <option value="all">All statuses</option>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="transferred">Transferred</option>
        </Select>
        <Badge tone="primary" className="ml-auto">{filtered.length} results</Badge>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon="student" title="No students match" body="Try a different search or clear the filters." action={<Btn v="subtle" sz="sm" onClick={() => { setQ(""); setCls("all"); setStatus("all"); }}>Clear filters</Btn>} /></Card>
      ) : (
        <div className="anim-up">
          <Tbl head={["Student", "Admission No", "Class", "Guardian", "Contact", "Attendance", "Fee Plan", "Status", ""]}>
            {rows.map((s) => (
              <tr key={s.id} className="tbl-row cursor-pointer" onClick={() => setSel(s)}>
                <td className={tdCls}><span className="flex items-center gap-2.5"><Avatar name={s.name} size={30} /><span><span className="block font-bold">{s.name}</span><span className="text-[10.5px] text-sub">Roll {s.roll} · {s.house} House</span></span></span></td>
                <td className={`${tdCls} num text-[12px]`}>{s.admNo}</td>
                <td className={tdCls}>{s.classId === "g8" ? "Grade 8" : s.classId.toUpperCase()}-{s.section}</td>
                <td className={tdCls}><span className="block font-medium">{s.guardian}</span><span className="text-[10.5px] text-sub">{s.relation}</span></td>
                <td className={`${tdCls} num text-[12px]`}>{s.phone}</td>
                <td className={tdCls}><span className="flex items-center gap-2"><span className={`num font-bold ${s.attendancePct < 80 ? "text-danger" : s.attendancePct < 90 ? "text-warn" : "text-ok"}`}>{s.attendancePct}%</span></span></td>
                <td className={tdCls}>{s.scholarship > 0 ? <Badge tone="accent">{s.feePlan}</Badge> : <span className="text-sub">{s.feePlan}</span>}</td>
                <td className={tdCls}><Badge tone={s.status === "active" ? "ok" : "neutral"}>{s.status}</Badge></td>
                <td className={tdCls}><span className="flex gap-1">
                  <button title="ID card" className="focus-ring rounded-md p-1.5 text-sub hover:bg-primarysoft hover:text-primarydark" onClick={(e) => { e.stopPropagation(); setIdCard(s); }}><I n="card" size={14} /></button>
                </span></td>
              </tr>
            ))}
          </Tbl>
          <Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} />
        </div>
      )}

      <StudentDrawer st={sel} onClose={() => setSel(null)} onId={() => sel && setIdCard(sel)} />
      <AddStudent open={add} onClose={() => setAdd(false)} />
      <IdCardModal st={idCard} onClose={() => setIdCard(null)} />
    </>
  );
}

function StudentDrawer({ st, onClose, onId }: { st: Student | null; onClose: () => void; onId: () => void }) {
  const app = useApp();
  if (!st) return null;
  const vouchers = app.db.vouchers.filter((v) => v.studentId === st.id);
  const due = vouchers.reduce((a, v) => a + app.balanceOf(v), 0);
  return (
    <Drawer open onClose={onClose} wide
      title={<span className="flex items-center gap-3"><Avatar name={st.name} size={40} /> {st.name}</span>}
      sub={<span className="flex flex-wrap items-center gap-2"><Badge tone="primary">{st.classId === "g8" ? "Grade 8" : st.classId}-{st.section} · Roll {st.roll}</Badge><Badge tone="neutral">{st.admNo}</Badge><Badge tone="ok"><StatusDot tone="ok" /> {st.status}</Badge></span>}
      footer={<>
        <Btn v="outline" icon="card" onClick={onId}>ID Card</Btn>
        <Btn v="outline" icon="print" onClick={() => {
          printDoc(`Student Profile — ${st.name}`, docHead(app.branding, "STUDENT PROFILE", "Dar-e-Ilm Academy · Main Campus") +
            `<div class="grid"><div><b>Name:</b> ${st.name}</div><div><b>Admission No:</b> ${st.admNo}</div><div><b>Class:</b> Grade 8-${st.section} (Roll ${st.roll})</div><div><b>House:</b> ${st.house}</div><div><b>Date of Birth:</b> ${fmtDate(st.dob)}</div><div><b>Blood Group:</b> ${st.blood}</div><div><b>Guardian:</b> ${st.guardian} (${st.relation})</div><div><b>Phone:</b> ${st.phone}</div><div><b>Address:</b> ${st.address}</div><div><b>Admitted:</b> ${fmtDate(st.admitted)}</div></div>
            <p class="muted">Generated from Markaz ERP · verification QR printed on ID card.</p>`, { schoolName: app.branding.schoolName, accent: "#c99a2e" });
        }}>Print profile</Btn>
        <Btn icon="edit" onClick={() => app.toast("Profile editor opened — changes are audit-logged", "info")}>Edit record</Btn>
      </>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Attendance (term)", `${st.attendancePct}%`, st.attendancePct < 85 ? "danger" : "ok"],
            ["Outstanding dues", fmtPKR(due), due > 0 ? "danger" : "ok"],
            ["Mid-term score", "71% · Grade B", "primary"],
          ].map(([l, v, t]) => (
            <div key={l} className="rounded-xl border border-line bg-surface p-3 text-center">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-sub">{l}</p>
              <p className={`num display mt-1 text-[17px] font-bold ${t === "danger" ? "text-danger" : t === "ok" ? "text-ok" : "text-primarydark"}`}>{v}</p>
            </div>
          ))}
        </div>

        <Card title="Fee ledger" sub="Latest challans" pad>
          <div className="space-y-2">
            {vouchers.slice(-3).reverse().map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2">
                <span className="num text-[12px] font-bold text-ink">{v.no}</span>
                <span className="text-[11.5px] text-sub">{monthLabel(v.month)}</span>
                <Badge className="ml-auto" tone={v.status === "paid" ? "ok" : v.status === "overdue" ? "danger" : v.status === "partial" ? "warn" : "neutral"}>{v.status}</Badge>
                <span className="num text-[12px] font-bold">{fmtPKR(app.balanceOf(v))} due</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Timeline" sub="Admission → today">
          <ol className="space-y-0">
            {[
              [fmtDate(st.admitted), `Admitted in ${st.classId === "g8" ? "Grade 8" : st.classId}-${st.section}, roll ${st.roll} — ${st.feePlan} plan`],
              ["Last month", `Mid-Term Examination — 71%, Grade B, position 5`],
              ["This week", `Monthly test in progress — attendance ${st.attendancePct}%`],
            ].map(([d, t], i) => (
              <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                {i < 2 && <span className="absolute left-[7px] top-4 h-full w-px bg-line" />}
                <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-surface" />
                <div><p className="text-[10.5px] font-bold uppercase tracking-wide text-sub">{d}</p><p className="text-[12.5px] text-ink">{t}</p></div>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Document vault" sub="Stored with per-school retention policy">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Birth Certificate", "B-Form Copy", "Previous Report Card", "Photos (2)"].map((d) => (
              <button key={d} onClick={() => app.toast(`Preview: ${d} (PDF)`, "info")} className="focus-ring group rounded-lg border border-dashed border-line bg-canvas/60 p-3 text-center transition hover:border-primary/50 hover:bg-primarysoft/50">
                <I n="exam" size={18} className="mx-auto text-sub group-hover:text-primarydark" />
                <p className="mt-1.5 text-[11px] font-semibold text-ink">{d}</p>
                <p className="text-[9.5px] text-ok">Verified ✓</p>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Attendance — last 18 days">
          <Spark values={app.db.attMonth.map((d) => d.value)} w={520} h={56} />
        </Card>
      </div>
    </Drawer>
  );
}

function AddStudent({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [f, setF] = useState({ name: "", gender: "M", guardian: "", phone: "", klass: "g8", section: "A", dob: "", address: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Student | null>(null);

  const save = () => {
    if (!f.name || !f.guardian || !f.phone) { setErr("Student name, guardian and phone are required."); return; }
    const cls = app.db.classes.find((c) => c.id === f.klass);
    const roll = (cls?.strength ?? 0) + 1;
    const st: Student = {
      id: `s${Date.now()}`, admNo: `DIA-2026-${1001 + app.db.students.length}`, name: f.name, gender: f.gender as "M" | "F",
      dob: f.dob || "2012-01-01", classId: f.klass, section: f.section, roll, house: ["Iqbal", "Jinnah", "Liaquat", "Fatima"][app.db.students.length % 4],
      guardian: f.guardian, relation: "Father", phone: f.phone, address: f.address || "Lahore", blood: "A+", status: "active",
      admitted: new Date().toISOString().slice(0, 10), feePlan: "Standard", scholarship: 0, attendancePct: 100,
    };
    app.set((d) => ({ ...d, students: [st, ...d.students] }));
    app.notify({ title: "New student admitted", body: `${st.name} — Grade 8-${f.section}, roll ${roll}. Challan can be generated from Fees.`, icon: "student", forRole: ["admin"] });
    setErr(""); setDone(st);
    app.toast(`${st.name} admitted — admission no ${st.admNo}`);
  };

  return (
    <Modal open={open} onClose={() => { onClose(); setDone(null); }} title="New Admission" sub="Create student record — under a minute, like the sales demo promises." wide
      footer={done ? <Btn icon="check" onClick={() => { onClose(); setDone(null); }}>Done</Btn> : <>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn icon="plus" onClick={save}>Admit Student</Btn>
      </>}>
      {done ? (
        <div className="anim-pop flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-oksoft text-ok"><I n="check" size={26} /></span>
          <p className="display text-[17px] font-bold text-ink">{done.name} is enrolled 🎉</p>
          <div className="grid gap-2 text-left sm:grid-cols-3">
            {[["Admission No", done.admNo], ["Class / Roll", `Grade 8-${done.section} · Roll ${done.roll}`], ["House", done.house]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-line bg-canvas px-3 py-2"><p className="text-[10px] font-bold uppercase text-sub">{l}</p><p className="num text-[13px] font-bold text-ink">{v}</p></div>
            ))}
          </div>
          <p className="max-w-sm text-[12px] text-sub">Next: generate the monthly challan from <b>Fees → Generate</b>, then activate parent portal credentials.</p>
          <Btn v="subtle" sz="sm" icon="cash" onClick={() => { onClose(); setDone(null); app.go("fees", { tab: "generate" }); }}>Go to challan generator</Btn>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Student full name" req><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Rayyan Aslam" /></Field>
            <Field label="Gender"><Select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option value="M">Male</option><option value="F">Female</option></Select></Field>
            <Field label="Father / guardian name" req><TextInput value={f.guardian} onChange={(e) => setF({ ...f, guardian: e.target.value })} /></Field>
            <Field label="Mobile" req><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+92 3xx xxxxxxx" /></Field>
            <Field label="Class"><Select value={f.klass} onChange={(e) => setF({ ...f, klass: e.target.value })}>{app.db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
            <Field label="Section"><Select value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}><option>A</option><option>B</option></Select></Field>
            <Field label="Date of birth"><TextInput type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
            <Field label="Address"><TextInput value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Area, city" /></Field>
          </div>
          <div className="mt-3 rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11.5px] text-sub">
            Auto-assigned: <b className="text-ink">admission number</b>, <b className="text-ink">roll number</b>, <b className="text-ink">house</b> & Standard fee plan — all editable later with an audit trail.
          </div>
          {err && <p className="anim-pop mt-3 flex items-center gap-1.5 text-[12px] font-medium text-danger"><I n="alert" size={14} /> {err}</p>}
        </>
      )}
    </Modal>
  );
}

function IdCardModal({ st, onClose }: { st: Student | null; onClose: () => void }) {
  const app = useApp();
  if (!st) return null;
  return (
    <Modal open onClose={onClose} title="Student ID Card" sub="QR carries the verification code — scan on the school's verify page."
      footer={<Btn icon="print" onClick={() => app.toast("ID card sent to card printer (CR80 layout)", "info")}>Print card</Btn>}>
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary bg-surface shadow-md">
        <div className="flex items-center gap-2.5 px-4 py-3 text-white" style={{ background: "var(--color-primary)" }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-night"><I n="student" size={16} /></span>
          <div><p className="display text-[13px] font-bold leading-tight">{app.branding.schoolName}</p><p className="text-[9px] tracking-widest opacity-75">STUDENT IDENTITY CARD · 2025–26</p></div>
        </div>
        <div className="flex gap-4 p-4">
          <Avatar name={st.name} size={64} tone="night" />
          <div className="flex-1">
            <p className="display text-[16px] font-bold text-ink">{st.name}</p>
            <div className="mt-1.5 space-y-0.5 text-[11px] text-sub">
              <p>Grade 8-{st.section} · Roll {st.roll} · {st.house} House</p>
              <p className="num">Adm: {st.admNo}</p>
              <p>Blood: {st.blood} · Guardian: {st.guardian}</p>
            </div>
          </div>
          <QRBox seed={st.admNo} size={64} />
        </div>
        <div className="flex items-center justify-between border-t border-line bg-canvas/70 px-4 py-2">
          <Barcode seed={st.admNo} w={120} h={26} />
          <p className="text-[9px] text-sub">Valid till Jul 2026 · {app.branding.shortName}</p>
        </div>
      </div>
    </Modal>
  );
}
