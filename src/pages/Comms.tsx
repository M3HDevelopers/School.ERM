import { useState } from "react";
import { useApp } from "../store";
import { timeAgo } from "../data/seed";
import { Badge, Btn, Card, Field, I, PageHead, Select, Textarea, TextInput, Toggle } from "../components/ui";

const TEMPLATES = [
  { id: "fee", label: "Fee due reminder", body: "Assalam-o-alaikum {parent}, the fee challan {challan} for {month} is due on {date}. Kindly pay via the portal or school office to avoid the Rs 200 late fee. — {school}" },
  { id: "absent", label: "Absence alert", body: "{parent}, {student} was marked absent today at {time}. If this is a mistake, kindly reply or call the class teacher. — {school}" },
  { id: "result", label: "Result published", body: "Dear {parent}, the {exam} result for {student} is now available on your portal with the full report card. — {school}" },
  { id: "event", label: "Event reminder", body: "Reminder: {event} on {date} at {place}. We look forward to seeing you! — {school}" },
];
const CHANNEL_META: Record<string, { icon: string; on: boolean }> = {
  "In-app": { icon: "bell", on: true }, SMS: { icon: "phone", on: true }, Email: { icon: "mail", on: true }, WhatsApp: { icon: "wa", on: true },
};

export default function Comms() {
  const app = useApp();
  const role = app.session?.role;
  const [audience, setAudience] = useState("All Parents");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<string[]>(["In-app", "WhatsApp"]);
  const [err, setErr] = useState("");

  if (role === "student" || role === "parent") {
    return (
      <>
        <PageHead title="Announcements & Notices" sub="Everything the school has shared with you" />
        <div className="anim-up space-y-3">
          {app.db.announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n="megaphone" size={16} /></span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="display text-[14.5px] font-bold text-ink">{a.title}</p>
                    {a.pinned && <Badge tone="accent">PINNED</Badge>}
                    <span className="ml-auto text-[10.5px] text-sub">{timeAgo(a.date + "T09:00:00")}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-sub">{a.body}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{a.channels.map((c) => <Badge key={c} tone="neutral">{c}</Badge>)}<Badge tone="primary">{a.audience}</Badge></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  const send = () => {
    if (!title || !body) { setErr("Both a title and message body are required."); return; }
    setErr("");
    app.set((d) => ({
      ...d,
      announcements: [{ id: `a${Date.now()}`, title, body, audience, date: new Date().toISOString().slice(0, 10), channels }, ...d.announcements],
      schoolAudit: [{ id: `sa${Date.now()}`, time: new Date().toISOString(), user: app.session?.name ?? "", action: "Announcement sent", detail: `"${title}" → ${audience} via ${channels.join(", ")}` }, ...d.schoolAudit],
    }));
    const reach = audience === "All Parents" ? 486 : audience === "Teachers" ? 48 : audience.startsWith("Grade 8") ? 62 : 612;
    app.notify({ title: `Announcement delivered (${reach})`, body: `"${title}" sent to ${audience} via ${channels.join(", ")}. Delivery receipts logged.`, icon: "megaphone", forRole: ["admin", "teacher", "student", "parent"] });
    app.toast(`Sent to ${reach} recipients · ${channels.length} channels · delivery tracking on`, "ok");
    setTitle(""); setBody("");
  };

  return (
    <>
      <PageHead title="Communication Center" sub="One message → targeted audience → routed through enabled channel adapters" />
      <div className="anim-up grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Compose announcement" sub="Merge fields: {parent} {student} {challan} {month} {date} {school}">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Audience">
                  <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                    {["All Parents", "All Students", "Teachers", "Grade 8-A Parents", "Grade 8-B Parents", "Staff (all)", "Defaulters only"].map((a) => <option key={a}>{a}</option>)}
                  </Select>
                </Field>
                <div>
                  <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Channels</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(CHANNEL_META).map((c) => (
                      <button key={c} onClick={() => setChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                        className={`focus-ring flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition ${channels.includes(c) ? "border-primary bg-primarysoft text-primarydark" : "border-line bg-surface text-sub"}`}>
                        <I n={CHANNEL_META[c].icon} size={13} /> {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Field label="Template" hint="Inserts a proven message — edit freely after.">
                <Select value="" onChange={(e) => { const t = TEMPLATES.find((x) => x.id === e.target.value); if (t) { setTitle(t.label); setBody(t.body); } }}>
                  <option value="">Choose a template…</option>
                  {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </Select>
              </Field>
              <Field label="Title" req><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School closed tomorrow" /></Field>
              <Field label="Message" req><Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement…" /></Field>
              {err && <p className="anim-pop flex items-center gap-1.5 text-[12px] font-medium text-danger"><I n="alert" size={14} /> {err}</p>}
              <div className="flex items-center gap-2">
                <Btn icon="send" onClick={send}>Send announcement</Btn>
                <Btn v="ghost" icon="clock" onClick={() => app.toast("Scheduled for tomorrow 8:00 am", "info")}>Schedule…</Btn>
                <span className="ml-auto text-[11px] text-sub">Reaches ~{audience === "All Parents" ? 486 : audience === "Teachers" ? 48 : 62} recipients</span>
              </div>
            </div>
          </Card>

          <Card title="Sent announcements" sub="With per-channel delivery status" pad={false}>
            <div className="divide-y divide-line">
              {app.db.announcements.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n="megaphone" size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ink">{a.title}</p>
                    <p className="text-[11px] text-sub">{a.audience} · {timeAgo(a.date + "T09:00:00")}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {a.channels.map((c) => <Badge key={c} tone="ok"><I n="check" size={10} /> {c} · delivered</Badge>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Channel adapters" sub="Provider connections for this tenant">
            <div className="space-y-2.5">
              {[
                ["SMS — local gateway (JazzCloud)", "phone", "Connected", "ok", "4.2s avg delivery"],
                ["Email — SMTP (school domain)", "mail", "Connected", "ok", "SPF/DKIM verified"],
                ["WhatsApp Business API", "wa", "Connected", "ok", "3 templates approved"],
                ["Push notifications (PWA)", "bell", "Ready", "warn", "412 devices registered"],
              ].map(([name, ic, st, tone, meta]) => (
                <div key={name as string} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-primarydark"><I n={ic as string} size={15} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink">{name}</p><p className="text-[10.5px] text-sub">{meta}</p></div>
                  <Badge tone={tone as string}>{st}</Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-primarysoft px-3 py-2 text-[11px] leading-relaxed text-primarydark">Adapters are provider-agnostic — swap gateways in Settings without touching school workflows. Failed deliveries auto-retry 3× then log.</p>
          </Card>
          <Card title="Notification rules" sub="Automated by the workflow engine">
            {[
              ["Absence → alert parent same period", true],
              ["Fee due → reminder 3 days before", true],
              ["Fee overdue → defaulter list + principal alert", true],
              ["Result published → all parents of class", true],
              ["Leave approved → notify staff member", true],
            ].map(([l, on]) => (
              <div key={l as string} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <p className="pr-2 text-[12px] font-medium text-ink">{l}</p>
                <Toggle on={on as boolean} onChange={() => app.toast("Rule updated — engine reloaded", "info")} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
