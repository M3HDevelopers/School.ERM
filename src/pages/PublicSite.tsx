import { useState } from "react";
import { useApp } from "../store";
import { HERO_IMG, PRINCIPAL_IMG, SCHOOL, LEAD_SOURCES, dayKey, fmtDate } from "../data/seed";
import { Badge, Btn, Field, I, Select, TextInput, Textarea } from "../components/ui";

const NAV_LINKS = ["Home", "About", "Academics", "Admissions", "Campus Life", "Contact"];

export default function PublicSite() {
  const app = useApp();
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [f, setF] = useState({ name: "", parent: "", phone: "", klass: "Grade 6", source: "Website", msg: "" });
  const [fErr, setFErr] = useState("");

  const submitInquiry = () => {
    if (!f.name || !f.phone || !f.parent) { setFErr("Student name, parent name and a contact number are required."); return; }
    setFErr("");
    app.set((d) => ({
      ...d,
      leads: [{ id: `l${Date.now()}`, name: f.name, parentName: f.parent, phone: f.phone, applyClass: f.klass, source: f.source, stage: "inquiry" as const, date: dayKey(0), note: f.msg || "Online inquiry via public website", value: 3500 }, ...d.leads],
    }));
    app.notify({ title: "New admission inquiry", body: `${f.name} (${f.klass}) via ${f.source} — added to the Admissions CRM.`, icon: "admit", forRole: ["admin"] });
    setSent(true);
    app.toast("Inquiry received — acknowledgment sent via SMS & email", "ok");
  };

  const Section = ({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-primary)" }}>{kicker}</p>
      <h2 className="display mt-1 text-[26px] font-bold text-ink sm:text-[30px]">{title}</h2>
      <div className="mt-7">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* ===== top bar ===== */}
      <div className="bg-night px-5 py-1.5 text-[11px] text-canvas/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <span className="flex items-center gap-3"><span className="flex items-center gap-1"><I n="phone" size={11} /> {SCHOOL.phone}</span><span className="hidden items-center gap-1 sm:flex"><I n="mail" size={11} /> {SCHOOL.email}</span></span>
          <span className="flex items-center gap-3">
            <button onClick={() => app.go(app.session ? (app.session.role === "owner" ? "ownerDash" : "dashboard") : "login")} className="flex items-center gap-1.5 font-bold text-accent transition hover:text-white">
              <I n="logout" size={12} /> {app.session ? "Back to Dashboard" : "ERP Portal Login"}
            </button>
          </span>
        </div>
      </div>

      {/* ===== header ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><I n="student" size={20} /></span>
          <div>
            <p className="display text-[15.5px] font-bold leading-tight text-ink">{app.branding.schoolName}</p>
            <p className="text-[10px] tracking-[0.14em] text-sub">EST. {SCHOOL.est} · {app.branding.tagline}</p>
          </div>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} className="focus-ring rounded-lg px-3 py-2 text-[13px] font-semibold text-sub transition hover:bg-primarysoft hover:text-primarydark">{l}</a>
            ))}
          </nav>
          <Btn sz="sm" icon="admit" onClick={() => document.getElementById("admissions")?.scrollIntoView({ behavior: "smooth" })}>Apply Online</Btn>
        </div>
      </header>

      {/* ===== hero — characteristic opening: campus + notice board ===== */}
      <section id="home" className="paper-grid border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="anim-up">
            <Badge tone="primary" className="mb-4"><I n="sparkle" size={11} /> Admissions open — Session {SCHOOL.session}</Badge>
            <h1 className="display text-[34px] font-bold leading-[1.08] text-ink sm:text-[44px]">
              A school where <span style={{ color: "var(--color-primary)" }}>every record</span> is one tap away.
            </h1>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-sub">
              {app.branding.schoolName} combines strong classroom teaching with a modern digital campus —
              fee challans on WhatsApp, live attendance alerts, report cards online, and parents always in the loop.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Btn icon="admit" onClick={() => document.getElementById("admissions")?.scrollIntoView({ behavior: "smooth" })}>Start Admission Inquiry</Btn>
              <Btn v="outline" icon="download" onClick={() => app.toast("Prospectus PDF downloading…", "info")}>Download Prospectus</Btn>
              <Btn v="ghost" icon="eye" onClick={() => app.go(app.session ? "dashboard" : "login")}>Portal Demo →</Btn>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-4 gap-3">
              {[["612", "Students"], ["48", "Faculty"], ["10", "Grades"], ["97%", "Board pass"]].map(([v, l]) => (
                <div key={l} className="rounded-lg border border-line bg-canvas px-2 py-2.5 text-center">
                  <p className="num display text-[18px] font-bold text-ink">{v}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-sub">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="anim-pop relative">
            <img src={HERO_IMG} alt="Campus" className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-lg" />
            <div className="absolute -bottom-4 left-4 rounded-xl border border-line bg-surface p-3 shadow-md">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-ok"><span className="dot-live h-2 w-2 rounded-full bg-ok" /> TODAY ON CAMPUS</p>
              <p className="mt-0.5 text-[12px] text-ink">92% attendance · Mid-term results declared · PTM on Saturday</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== notice strip ===== */}
      <div className="border-b border-line bg-accentsoft/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-5 py-2.5">
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-warn"><I n="megaphone" size={13} /> Notice board</span>
          {app.db.notices.map((n) => (
            <span key={n.id} className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px] text-ink">
              <b>{n.title}</b> <span className="text-sub">· {fmtDate(n.date)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== about + principal ===== */}
      <Section id="about" kicker="About the school" title="Rooted in values, run with precision">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative">
            <img src={PRINCIPAL_IMG} alt="Principal" className="aspect-[4/5] w-full max-w-sm rounded-2xl border border-line object-cover shadow-md" />
            <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-xl bg-night/90 p-3.5 text-canvas backdrop-blur">
              <p className="text-[12.5px] italic leading-relaxed text-canvas/90">"Discipline in the register and mercy in the classroom — a school must keep both."</p>
              <p className="mt-1.5 text-[11px] font-bold text-accent">Dr. Amina Khalid — Vice Principal</p>
            </div>
          </div>
          <div>
            <p className="text-[14px] leading-relaxed text-sub">
              Established in {SCHOOL.est}, {app.branding.schoolName} serves 612 students across Grades 1–10 at our Gulberg and DHA campuses.
              Our model pairs experienced teachers with transparent systems: parents receive attendance alerts the moment the register closes,
              fee challans arrive before the month begins, and every result is published with full subject analytics.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["eye", "Our Vision", "Graduates who carry knowledge ('ilm) and character ('amal) into every field of Pakistani life."],
                ["star", "Our Mission", "Rigorous academics, affordable fees, honest communication with parents — and zero hidden surprises."],
                ["shield", "Our Values", "Amanah, ihsan and discipline — in the classroom, the accounts office and the playground alike."],
                ["zap", "Our Edge", "A full digital campus: admissions to report cards run on one white-label ERP, branded as our own."],
              ].map(([i, t, b]) => (
                <div key={t} className="rounded-xl border border-line bg-surface p-4 transition hover:border-primary/35 hover:shadow-sm">
                  <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n={i} size={14} /></span>{t}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-sub">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ===== academics ===== */}
      <section id="academics" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-primary)" }}>Academics</p>
          <h2 className="display mt-1 text-[26px] font-bold text-ink sm:text-[30px]">Classes & programmes</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Junior Wing", "Grades 1–3", "Phonics, numeracy & nazra with a dedicated primary campus and play-based learning corners.", "Age 5–8"],
              ["Middle School", "Grades 4–6", "Core subjects with science labs, computer literacy from Grade 4 and house-based activities.", "Age 9–11"],
              ["Secondary", "Grades 7–8", "Board-pattern assessments, monthly tests, and continuous parent reporting through the ERP.", "Age 12–14"],
              ["Matriculation", "Grades 9–10", "Board-focused preparation, past-paper drills, career counselling and mock examinations.", "Age 14–16"],
            ].map(([t, g, b, a]) => (
              <div key={t} className="group rounded-xl border border-line bg-canvas p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">{g}</p>
                <h3 className="display mt-1 text-[17px] font-bold text-ink">{t}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-sub">{b}</p>
                <p className="mt-3 inline-block rounded-md bg-primarysoft px-2 py-1 text-[10.5px] font-bold text-primarydark">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== admissions + inquiry form ===== */}
      <Section id="admissions" kicker="Admissions 2025–26" title="From inquiry to first day of school">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <ol className="space-y-0">
              {[
                ["Submit the inquiry", "Online form below, WhatsApp, or a walk-in visit — takes 2 minutes."],
                ["Campus visit & application", "Tour the school, collect the application pack and document checklist."],
                ["Assessment & interview", "A short age-appropriate assessment and a friendly parent meeting."],
                ["Offer & enrolment", "Fee challan issued, class & roll number assigned, portals activated."],
              ].map(([t, b], i) => (
                <li key={t} className="relative flex gap-4 pb-7">
                  {i < 3 && <span className="absolute left-[15px] top-8 h-full w-px bg-line" />}
                  <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface text-[12px] font-bold text-primarydark">{i + 1}</span>
                  <div><p className="text-[14px] font-bold text-ink">{t}</p><p className="mt-0.5 text-[12.5px] text-sub">{b}</p></div>
                </li>
              ))}
            </ol>
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-4">
              <I n="info" size={16} className="text-primarydark" />
              <p className="text-[12.5px] text-sub"><b className="text-ink">Seats update live:</b> Grade 1 & Grade 6 filling fastest. Sibling and staff concessions available. Current status: <b className="text-ok">Accepting applications</b></p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            {sent ? (
              <div className="anim-pop flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-oksoft text-ok"><I n="check" size={26} /></span>
                <p className="display text-[18px] font-bold text-ink">Inquiry received — shukriya!</p>
                <p className="max-w-xs text-[12.5px] text-sub">Reference <b className="num text-ink">INQ-2026-{String(app.db.leads.length).padStart(3, "0")}</b>. Our admissions office will call you within one working day. An acknowledgment SMS &amp; email have been sent.</p>
                <Btn v="outline" sz="sm" icon="refresh" onClick={() => { setSent(false); setF({ name: "", parent: "", phone: "", klass: "Grade 6", source: "Website", msg: "" }); }}>Submit another inquiry</Btn>
              </div>
            ) : (
              <>
                <h3 className="display text-[17px] font-bold text-ink">Online Admission Inquiry</h3>
                <p className="mt-0.5 text-[12px] text-sub">Goes straight into the school's Admissions CRM with source tracking.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Student name" req><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Rayyan Aslam" /></Field>
                  <Field label="Parent / guardian" req><TextInput value={f.parent} onChange={(e) => setF({ ...f, parent: e.target.value })} placeholder="Father / mother name" /></Field>
                  <Field label="Mobile number" req><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+92 3xx xxxxxxx" /></Field>
                  <Field label="Applying for"><Select value={f.klass} onChange={(e) => setF({ ...f, klass: e.target.value })}>{["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"].map((g) => <option key={g}>{g}</option>)}</Select></Field>
                  <Field label="How did you hear about us?"><Select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
                  <Field label="Anything else?"><TextInput value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} placeholder="Optional note" /></Field>
                </div>
                {fErr && <p className="anim-pop mt-3 flex items-center gap-1.5 rounded-lg bg-dangersoft px-3 py-2 text-[12px] font-medium text-danger"><I n="alert" size={14} /> {fErr}</p>}
                <Btn className="mt-4 w-full" icon="send" onClick={submitInquiry}>Submit Inquiry — instant acknowledgment</Btn>
                <p className="mt-2 text-center text-[10.5px] text-sub">Protected by captcha · your data stays in the school's private ERP</p>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ===== campus life / facilities ===== */}
      <section id="campus-life" className="border-y border-line bg-night text-canvas">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Campus life</p>
          <h2 className="display mt-1 text-[26px] font-bold text-white sm:text-[30px]">Facilities that do the teaching too</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["book", "Library & reading hour", "4,000+ titles, barcode issue/return, weekly reading targets for every grade."],
              ["zap", "Science & computer labs", "Practical-led science from Grade 6; coding clubs and typing certifications."],
              ["bus", "Doorstep transport", "Three monitored routes with attendants, live fee-linked billing and GPS-ready tracking."],
              ["shield", "Security & welfare", "CCTV campus, verified pickup list in the ERP, nurse and first-aid room."],
              ["star", "Sports & houses", "Cricket, football and athletics across four houses — Iqbal, Jinnah, Liaquat, Fatima."],
              ["megaphone", "Parents in the loop", "Absence alerts, fee reminders and report cards — on WhatsApp, SMS and app."],
            ].map(([i, t, b]) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-accent/40 hover:bg-white/8">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent"><I n={i} size={17} /></span>
                <h3 className="display mt-3 text-[15px] font-bold text-white">{t}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-canvas/65">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[["“Fee day used to mean a queue at the window. Now the challan is on my WhatsApp before the month starts.”", "Parent — Grade 4, Gulberg"], ["“Attendance alerts are honest and instant. If my son is late, I know before chai gets cold.”", "Parent — Grade 8, Johar Town"], ["“The report card shows exactly where my daughter improved — subject by subject.”", "Parent — Grade 2, DHA"]].map(([q, w]) => (
              <blockquote key={w} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[12.5px] italic leading-relaxed text-canvas/85">{q}</p>
                <footer className="mt-2 text-[11px] font-bold text-accent">{w}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ + contact ===== */}
      <Section id="contact" kicker="Questions & contact" title="Everything parents ask us">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-2.5">
            {[
              ["What is the monthly fee range?", "Grade-wise tuition ranges from Rs 2,800 to Rs 4,500, plus optional transport (Rs 1,200–1,500) and a Rs 300 lab/activity charge. Sibling and merit concessions are applied automatically on the challan."],
              ["How do parents receive updates?", "Every family gets app, SMS and WhatsApp alerts for absence, fee dues, exam dates and results — you choose the channels in the parent portal."],
              ["Is there a mid-year admission process?", "Yes — subject to seat availability and an age-appropriate assessment. The online inquiry form works all year round."],
              ["How are report cards shared?", "Results are published on the parent and student portals the same day they are declared, with a printable, QR-verified report card."],
            ].map(([q, a], i) => (
              <div key={q} className="overflow-hidden rounded-xl border border-line bg-surface">
                <button className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span className="text-[13.5px] font-bold text-ink">{q}</span>
                  <I n="chevD" size={15} className={`text-sub transition-transform ${openFaq === i ? "rotate-180 text-primarydark" : ""}`} />
                </button>
                {openFaq === i && <p className="anim-in border-t border-line bg-canvas/60 px-4 py-3 text-[12.5px] leading-relaxed text-sub">{a}</p>}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[["pin", SCHOOL.address], ["phone", `${SCHOOL.phone} · Mon–Sat 8am–2pm`], ["mail", SCHOOL.email], ["globe", `${app.branding.shortName.toLowerCase()}.edu.pk — portal on subdomain`]].map(([i, t]) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n={i} size={16} /></span>
                <p className="text-[12.5px] font-medium text-ink">{t}</p>
              </div>
            ))}
            <div className="rounded-xl border-2 border-dashed border-line p-4 text-center">
              <p className="text-[12px] text-sub">Campus map · Gulberg III main gate opposite Liberty roundabout</p>
              <div className="paper-grid mt-2 flex h-28 items-center justify-center rounded-lg bg-primarysoft/50 text-primarydark"><I n="pin" size={22} /></div>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== footer ===== */}
      <footer className="border-t border-line bg-night text-canvas/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="display text-[16px] font-bold text-white">{app.branding.schoolName}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed">Ilm se roshni, amal se taraqqi. Serving Lahore since {SCHOOL.est}.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-canvas/45">Quick links</p>
            <ul className="mt-2 space-y-1.5 text-[12.5px]">
              {NAV_LINKS.map((l) => <li key={l}><a className="hover:text-white" href={`#${l.toLowerCase().replace(" ", "-")}`}>{l}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-canvas/45">Portals</p>
            <ul className="mt-2 space-y-1.5 text-[12.5px]">
              {["Student Login", "Parent Login", "Teacher Login", "Admin Login"].map((l) => (
                <li key={l}><button className="hover:text-white" onClick={() => app.go(app.session ? "dashboard" : "login")}>{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-canvas/45">Emergency</p>
            <p className="mt-2 text-[12.5px]">School nurse: +92 300 1112233<br />Admin office: {SCHOOL.phone}</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-canvas/45">
          © {new Date().getFullYear()} {app.branding.schoolName} · Built on <button className="font-semibold text-accent hover:underline" onClick={() => app.go(app.session ? "dashboard" : "login")}>Markaz ERP</button> — white-label school platform
        </div>
      </footer>
    </div>
  );
}
