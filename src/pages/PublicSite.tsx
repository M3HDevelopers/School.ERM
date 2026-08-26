import React, { useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Badge, Btn, I, Reveal, Select, TextArea, TextInput } from "../components/ui";
import { Logo } from "../components/shell";

const LINKS = ["About", "Academics", "Admissions", "Facilities", "Notices", "Contact"];

function InquiryForm() {
  const app = useApp();
  const [f, setF] = useState({ name: "", phone: "", cls: "Grade 1", source: "website" as S.Lead["source"], msg: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Enter the child's full name";
    if (!/^(\+92|0)?3\d{2}[- ]?\d{7}$/.test(f.phone.replace(/\s/g, "")) && f.phone.replace(/\D/g, "").length < 10) er.phone = "Enter a valid mobile e.g. 0321-4567890";
    setErrs(er);
    if (Object.keys(er).length) return;
    app.addLead({ name: f.name.trim(), classApplied: f.cls, phone: f.phone.trim(), source: f.source, note: f.msg.trim() || undefined });
    setDone(true);
    app.toast("Inquiry received — an acknowledgment SMS has been queued to the parent (demo)", "ok");
  };
  if (done)
    return (
      <div className="rounded-xl border border-ok/30 bg-oksoft p-8 text-center anim-pop">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ok text-white"><I n="check" size={22} /></span>
        <h4 className="font-display text-lg font-extrabold text-ink">JazakAllah — inquiry recorded!</h4>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-sub">Our admissions office will call you within one working day. Reference ID <span className="num font-bold text-ink">INQ-{Date.now().toString().slice(-5)}</span>. You can also visit the campus office, Mon–Sat 8 am – 2 pm.</p>
        <Btn v="soft" className="mt-4" onClick={() => setDone(false)} icon="plus">Submit another inquiry</Btn>
      </div>
    );
  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-card p-6 shadow-sm">
      <h4 className="font-display text-[17px] font-extrabold text-ink">Online Admission Inquiry</h4>
      <p className="mb-4 mt-0.5 text-[12.5px] text-sub">Entry test every Saturday · B-Form copy required</p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sub">Child's full name</span>
          <TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Zaynab Tariq" />
          {errs.name && <span className="mt-1 block text-[11px] font-semibold text-danger">{errs.name}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sub">Parent mobile</span>
          <TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03xx-xxxxxxx" className="num" />
          {errs.phone && <span className="mt-1 block text-[11px] font-semibold text-danger">{errs.phone}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sub">Class applying for</span>
          <Select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })}>
            {S.CLASSES.map((c) => <option key={c.id}>{c.name}</option>)}
          </Select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sub">How did you hear about us?</span>
          <Select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as S.Lead["source"] })}>
            <option value="website">School website</option><option value="facebook">Facebook</option>
            <option value="whatsapp">WhatsApp</option><option value="referral">Friend / family referral</option><option value="walk-in">Walk-in / banner</option>
          </Select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sub">Message (optional)</span>
          <TextArea value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className="min-h-[64px]" placeholder="Previous school, transport requirement…" />
        </label>
      </div>
      <Btn type="submit" className="mt-4 w-full !py-2.5" icon="send">Submit inquiry — we'll call you back</Btn>
      <p className="mt-2 text-center text-[11px] text-sub">Submitting adds this lead straight into the school's Admissions CRM.</p>
    </form>
  );
}

export default function PublicSite() {
  const app = useApp();
  const sc = app.school;
  const [faq, setFaq] = useState(0);
  const jump = (id: string) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  const facts = [["1998", "Established"], ["594", "Students"], ["48", "Faculty & staff"], ["2", "Campuses"], ["98%", "Board pass rate"]];

  return (
    <div className="min-h-screen bg-card text-ink">
      {/* top strip + nav */}
      <div className="bg-side text-sidetext">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[11.5px]">
          <span className="flex items-center gap-3"><span className="num flex items-center gap-1"><I n="phone" size={11} />{sc.phone}</span><span className="hidden items-center gap-1 sm:flex"><I n="mail" size={11} />{sc.email}</span></span>
          <button onClick={() => app.go(app.session ? "dashboard" : "login")} className="flex items-center gap-1.5 font-bold text-accent transition hover:text-white">
            <I n="logout" size={12} /> {app.session ? "Back to Dashboard" : "ERP Portal Login"}
          </button>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Logo size={38} />
          <div className="mr-2 leading-tight">
            <div className="font-display text-[15px] font-extrabold text-ink">{sc.name}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sub">{sc.tagline}</div>
          </div>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <button key={l} onClick={() => jump(l)} className="rounded-md px-3 py-1.5 text-[13px] font-semibold text-sub transition hover:bg-primarysoft hover:text-primarydeep">{l}</button>
            ))}
          </nav>
          <Btn v="accent" sz="sm" onClick={() => jump("admissions")} icon="cap">Apply Online</Btn>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <img src={S.IMG.campus} alt="Campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-side/95 via-side/78 to-side/25" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/15 px-3.5 py-1.5 text-[12px] font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" /> Admissions open — Session 2026–27
            </div>
            <h1 className="mt-5 max-w-2xl font-display text-[44px] font-black leading-[1.02] tracking-tight text-white sm:text-[58px]">
              Where young minds build <span className="text-accent">character</span> and <span className="text-accent">excellence</span>.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
              {sc.name} combines a rigorous Cambridge-aligned curriculum with tarbiyah, sports and modern
              laboratories — from Grade 1 to Matriculation, across {sc.address}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn v="accent" className="!px-5 !py-2.5 !text-[14px]" icon="cap" onClick={() => jump("admissions")}>Start Admission</Btn>
              <button onClick={() => jump("academics")} className="inline-flex items-center gap-2 rounded-md border border-white/35 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/10">
                Explore Programs <I n="arrowR" size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* facts strip */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-4 px-4 py-7 sm:grid-cols-5">
          {facts.map(([v, l], i) => (
            <Reveal key={l} delay={i * 70} className="text-center">
              <div className="num font-display text-[26px] font-extrabold text-primarydeep">{v}</div>
              <div className="text-[11.5px] font-semibold uppercase tracking-wider text-sub">{l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* about + principal */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
          <Reveal>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">About the Academy</div>
            <h2 className="mt-2 font-display text-[32px] font-black leading-tight tracking-tight text-ink">27 years of learning with <span className="text-primary">purpose</span></h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-sub">
              Founded in 1998, {sc.name} has grown from a single primary section into a two-campus institution
              serving 594 students. Our classrooms blend concept-based learning with nazra, moral education and
              weekly sports — because results matter, and so does character.
            </p>
            <div className="mt-6 grid max-w-xl grid-cols-3 gap-4">
              {[["Our Mission", "Nurture confident, honest learners"], ["Our Vision", "A model school for every neighbourhood"], ["Our Values", "Ilm, Adab, Discipline, Service"]].map(([t, b]) => (
                <div key={t} className="rounded-lg border border-line bg-paper p-3.5">
                  <div className="font-display text-[13px] font-extrabold text-ink">{t}</div>
                  <div className="mt-1 text-[12px] leading-snug text-sub">{b}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-xl border border-line bg-card shadow-md">
              <img src={S.IMG.principal} alt="Principal" className="h-64 w-full object-cover object-top" />
              <div className="p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-accent">Principal's Message</div>
                <p className="mt-2 text-[13px] italic leading-relaxed text-ink">
                  "Every child who walks through our gate carries a trust from their parents. Our job is to return
                  that trust as knowledge, confidence and good character."
                </p>
                <div className="mt-3 font-display text-[14px] font-extrabold text-ink">Dr. Kamran Siddiqui</div>
                <div className="text-[11.5px] text-sub">Principal · M.Ed, Punjab University</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* academics — asymmetric */}
      <section id="academics" className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">Academics</div>
              <h2 className="mt-2 font-display text-[32px] font-black tracking-tight text-ink">Programs & classes</h2>
            </div>
            <p className="max-w-sm text-[13px] text-sub">Punjab curriculum with Cambridge enrichment streams in English, Mathematics and Science from Grade 6.</p>
          </Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:row-span-2">
              <div className="flex h-full flex-col rounded-xl bg-side p-6 text-sidetext">
                <Badge tone="accent">Most enrolled</Badge>
                <h3 className="mt-3 font-display text-[26px] font-extrabold text-white">Middle & Matriculation</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-sidetext">Grades 6 – 10 with board exam preparation, practical labs, career counselling and a 98% pass record in the last three board exams.</p>
                <ul className="mt-5 space-y-2.5 text-[13px]">
                  {["Physics · Chemistry · Bio labs", "Computer lab with 40 systems", "Board paper-solving sessions", "Scholarships for position holders"].map((x) => (
                    <li key={x} className="flex items-start gap-2"><I n="check" size={14} className="mt-0.5 shrink-0 text-accent" />{x}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <div className="num grid grid-cols-3 gap-3 border-t border-sideline pt-4 text-center">
                    {[["286", "students"], ["22", "teachers"], ["9", "subjects"]].map(([v, l]) => (
                      <div key={l}><div className="font-display text-lg font-extrabold text-white">{v}</div><div className="text-[10.5px] uppercase tracking-wider">{l}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            {[["Primary Section", "Grades 1 – 5", "Phonics-based English, mental maths, nazra and activity-based learning in air-conditioned rooms with a 1:25 teacher ratio."], ["Junior Section", "Grade 6 – 8", "Concept mastery with weekly assessments, reading clubs and house activities that build confidence before board classes."]].map(([t, g, b], i) => (
              <Reveal key={t} delay={100 + i * 90}>
                <div className="rounded-xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{g}</div>
                  <h3 className="mt-1.5 font-display text-[20px] font-extrabold text-ink">{t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-sub">{b}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={200}>
              <div className="rounded-xl border border-dashed border-primary/40 bg-primarysoft/60 p-6">
                <h3 className="font-display text-[17px] font-extrabold text-primarydeep">Fee ranges 2025–26</h3>
                <div className="num mt-3 space-y-1.5 text-[13px] text-ink">
                  <div className="flex justify-between"><span>Grade 1 – 5</span><span className="font-bold">Rs 3,200 / mo</span></div>
                  <div className="flex justify-between"><span>Grade 6 – 8</span><span className="font-bold">Rs 4,200 / mo</span></div>
                  <div className="flex justify-between"><span>Grade 9 – 10</span><span className="font-bold">Rs 5,200 / mo</span></div>
                </div>
                <p className="mt-3 text-[11.5px] text-sub">Sibling discount 10% · Merit scholarships up to 50% · Challans issued on the 1st of every month.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* admissions timeline + inquiry */}
      <section id="admissions" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">Admissions</div>
            <h2 className="mt-2 font-display text-[32px] font-black tracking-tight text-ink">Four steps to enrolment</h2>
            <ol className="mt-7 space-y-0">
              {[
                ["Submit inquiry", "Online form, WhatsApp or a visit to the campus office. Our team calls within 24 hours."],
                ["Entry test & interview", "Every Saturday, 10 am. Age-appropriate test in English, Urdu and Maths, plus a short parent meeting."],
                ["Offer & documents", "Merit list within 3 days. Submit B-Form copy, birth certificate and previous report card."],
                ["Fee challan & first day", "Pay the first challan at any HBL branch or the office, collect books and uniform — start school!"],
              ].map(([t, b], i) => (
                <li key={t} className="relative flex gap-4 pb-7">
                  {i < 3 && <span className="absolute left-[17px] top-9 h-[calc(100%-38px)] w-px bg-line" />}
                  <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[14px] font-extrabold text-white ring-4 ring-primarysoft">{i + 1}</span>
                  <div>
                    <div className="font-display text-[15.5px] font-extrabold text-ink">{t}</div>
                    <p className="mt-1 max-w-md text-[13px] leading-relaxed text-sub">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={140}><InquiryForm /></Reveal>
        </div>
      </section>

      {/* facilities mosaic */}
      <section id="facilities" className="bg-side py-16 text-sidetext">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-8">
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-accent">Campus Life</div>
            <h2 className="mt-2 font-display text-[32px] font-black tracking-tight text-white">Facilities that teach beyond books</h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["book", "Library", "8,000+ books, reading club, digital catalog with barcode issue/return.", "lg:col-span-2"],
              ["chart", "Science Labs", "Separate physics, chemistry and biology labs for Grades 9–10.", ""],
              ["bus", "Safe Transport", "4 monitored routes with attendants and GPS-ready tracking.", ""],
              ["grid", "Smart Classrooms", "Multimedia projectors in every room from Grade 5 upwards.", ""],
              ["star", "Sports Ground", "Cricket nets, football and annual inter-house championships.", "lg:col-span-2"],
              ["shield", "Security & Welfare", "CCTV campus, trained first-aid staff, counsellor on call.", ""],
            ].map(([ic, t, b, span], i) => (
              <Reveal key={t} delay={i * 60} className={span as string}>
                <div className="group h-full rounded-xl border border-sideline bg-white/5 p-5 transition hover:border-accent/50 hover:bg-white/10">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent transition group-hover:bg-accent group-hover:text-side"><I n={ic as string} size={19} /></span>
                  <div className="font-display text-[15.5px] font-extrabold text-white">{t}</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-sidetext">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* notices + testimonials */}
      <section id="notices" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">Notice Board</div>
            <h2 className="mt-2 font-display text-[28px] font-black tracking-tight text-ink">Latest from school</h2>
            <div className="mt-5 space-y-3">
              {S.NOTICEBOARD.map((n) => (
                <div key={n.title} className="group flex gap-4 rounded-lg border border-line bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
                  <div className="num shrink-0 rounded-md bg-primarysoft px-2.5 py-1.5 text-center">
                    <div className="font-display text-[17px] font-extrabold leading-none text-primarydeep">{new Date(n.date).getDate()}</div>
                    <div className="text-[9.5px] font-bold uppercase text-primary">{new Date(n.date).toLocaleString("en", { month: "short" })}</div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink group-hover:text-primarydeep">{n.title}</div>
                    <p className="mt-0.5 text-[12.5px] text-sub">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">Parent Voices</div>
            <h2 className="mt-2 font-display text-[28px] font-black tracking-tight text-ink">Trusted by families</h2>
            <div className="mt-5 space-y-3">
              {[
                ["The monthly challan comes on WhatsApp, I pay at the bank, and the receipt appears in the parent portal the same minute. No more office queues.", "Mrs. Nadia Kamran", "Parent · Grade 4 & 8"],
                ["When my son is absent, I get an SMS before he even reaches home. That one feature tells me this school actually cares.", "Mr. Imran Sheikh", "Parent · Grade 6"],
              ].map(([q, n, r]) => (
                <figure key={n} className="rounded-xl border border-line bg-paper p-5">
                  <I n="star" size={16} className="text-accent" />
                  <blockquote className="mt-2 text-[13.5px] italic leading-relaxed text-ink">"{q}"</blockquote>
                  <figcaption className="mt-3 text-[12.5px] font-bold text-primarydeep">{n} <span className="font-medium text-sub">· {r}</span></figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* contact + faq */}
      <section id="contact" className="border-t border-line bg-paper py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <Reveal>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">Visit Us</div>
            <h2 className="mt-2 font-display text-[28px] font-black tracking-tight text-ink">We'd love to meet you</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-card p-4">
                <div className="flex items-center gap-2 font-display text-[13.5px] font-extrabold text-ink"><I n="building" size={15} className="text-primary" /> Main Campus</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub">{sc.address}<br />Mon–Sat · 8:00 am – 2:30 pm</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-4">
                <div className="flex items-center gap-2 font-display text-[13.5px] font-extrabold text-ink"><I n="building" size={15} className="text-primary" /> Gulberg Campus</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub">12-C Gulberg III, Lahore<br />Primary section only</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-4">
                <div className="flex items-center gap-2 font-display text-[13.5px] font-extrabold text-ink"><I n="phone" size={15} className="text-primary" /> Call / WhatsApp</div>
                <p className="num mt-1.5 text-[12.5px] text-sub">{sc.phone}<br />0300-8890-112 (admissions)</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-4">
                <div className="flex items-center gap-2 font-display text-[13.5px] font-extrabold text-ink"><I n="mail" size={15} className="text-primary" /> Write to us</div>
                <p className="mt-1.5 break-all text-[12.5px] text-sub">{sc.email}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-primary">FAQ</div>
            <h2 className="mt-2 font-display text-[28px] font-black tracking-tight text-ink">Common questions</h2>
            <div className="mt-5 space-y-2">
              {[
                ["What is the admission process for mid-session entry?", "Submit the inquiry form, sit the entry test on Saturday, and if a seat is available in the class we issue an offer within 3 working days."],
                ["How are monthly fees paid?", "A challan is generated on the 1st of each month — payable at HBL branches, the campus office, or via the parent portal. A late fee of Rs 200 applies after the 10th."],
                ["Do you offer scholarships?", "Yes — up to 50% merit scholarships for position holders, 10% sibling discount, and need-based concessions reviewed by the principal."],
                ["Is there transport coverage for DHA and Johar Town?", "Route 3 covers Johar Town–Ichhra and Route 4 covers DHA Phase 5–Cantt, both with female attendants on morning shifts."],
              ].map(([q, a], i) => (
                <div key={q} className="overflow-hidden rounded-lg border border-line bg-card">
                  <button onClick={() => setFaq(faq === i ? -1 : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="text-[13.5px] font-bold text-ink">{q}</span>
                    <I n="chevD" size={15} className={`shrink-0 text-sub transition-transform duration-200 ${faq === i ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  {faq === i && <p className="border-t border-linesoft px-4 py-3 text-[13px] leading-relaxed text-sub anim-fade">{a}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-side py-10 text-sidetext">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={34} />
              <div className="font-display text-[15px] font-extrabold text-white">{sc.name}</div>
            </div>
            <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-sidetext/80">{sc.tagline}. Serving Lahore since 1998 — powered by {sc.portalTitle}, the all-in-one school management platform.</p>
          </div>
          <div>
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-accent">Portals</div>
            {["Parent Login", "Student Login", "Teacher Login", "Staff / Admin"].map((l) => (
              <button key={l} onClick={() => app.go("login")} className="block py-1 text-[12.5px] transition hover:text-white">{l}</button>
            ))}
          </div>
          <div>
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-accent">Policies</div>
            {["Admission policy", "Fee & refund policy", "Child protection", "Privacy notice"].map((l) => (
              <button key={l} onClick={() => app.toast(`${l} PDF will be emailed on request (demo)`, "info")} className="block py-1 text-[12.5px] transition hover:text-white">{l}</button>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-sideline px-4 pt-5 text-[11.5px] text-sidetext/60">
          © {new Date().getFullYear()} {sc.name} · Built on Markaz ERP · White-label demo tenant
        </div>
      </footer>
    </div>
  );
}
