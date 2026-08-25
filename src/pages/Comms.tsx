import React, { useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Badge, Btn, Card, Field, I, PageHead, Select, TextArea, TextInput, Toggle } from "../components/ui";

const TEMPLATES: Record<string, { title: string; body: string }> = {
  fee: { title: "Fee submission reminder", body: "Respected parent, the monthly challan is due by the 10th. Kindly pay at the office, HBL branch, or via the parent portal to avoid a Rs 200 late fee." },
  event: { title: "Upcoming school event", body: "We are delighted to invite you to our upcoming event. Details of date, time and venue follow. Your presence will encourage the students greatly." },
  holiday: { title: "Holiday notice", body: "School will remain closed on the announced date. Classes will resume the next working day as per the usual timetable." },
  result: { title: "Result published", body: "The examination result has been published. Please check the parent/student portal for the detailed report card." },
  custom: { title: "", body: "" },
};

const CHANNEL_ICONS: Record<string, string> = { app: "app", sms: "sms", email: "mail", wa: "wa" };

export default function Comms() {
  const app = useApp();
  const role = app.session?.role ?? "admin";
  const canCompose = role === "admin" || role === "teacher";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All parents");
  const [channels, setChannels] = useState<Record<string, boolean>>({ app: true, sms: true, email: false, wa: true });
  const [sending, setSending] = useState(false);
  const [adapters, setAdapters] = useState({ sms: true, wa: true, email: true, push: false });

  const send = () => {
    if (title.trim().length < 3) return app.toast("Please write a title for the announcement", "danger");
    if (body.trim().length < 10) return app.toast("Message body is too short", "danger");
    const ch = Object.keys(channels).filter((c) => channels[c]);
    if (ch.length === 0) return app.toast("Select at least one delivery channel", "danger");
    setSending(true);
    setTimeout(() => {
      app.sendAnnouncement({ title: title.trim(), body: body.trim(), audience, channels: ch });
      setSending(false);
      setTitle("");
      setBody("");
    }, 800);
  };

  return (
    <>
      <PageHead title="Communication Center" sub="One message · any audience · every channel — with delivery tracking" />

      <div className="grid gap-4 xl:grid-cols-12">
        {canCompose && (
          <Card className="xl:col-span-5">
            <h3 className="font-display text-[15px] font-extrabold text-ink">Compose announcement</h3>
            <div className="mt-3 space-y-3.5">
              <Field label="Template">
                <Select defaultValue="custom" onChange={(e) => { const t = TEMPLATES[e.target.value]; if (t.title) { setTitle(t.title); setBody(t.body); } }}>
                  <option value="custom">Blank message</option>
                  <option value="fee">Fee reminder</option><option value="event">Event invitation</option>
                  <option value="holiday">Holiday notice</option><option value="result">Result published</option>
                </Select>
              </Field>
              <Field label="Title"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fee submission deadline" /></Field>
              <Field label="Message"><TextArea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the announcement…" /></Field>
              <Field label="Audience">
                <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option>All parents</option><option>Whole school</option><option>Parents · Grade 8</option>
                  <option>Parents · Grade 8-A</option><option>Teachers only</option><option>Fee defaulters only</option>
                </Select>
              </Field>
              <div>
                <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">Channels</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(channels).map((c) => (
                    <button key={c} onClick={() => setChannels({ ...channels, [c]: !channels[c] })}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-bold transition ${channels[c] ? "border-primary bg-primarysoft text-primarydeep" : "border-line bg-card text-sub hover:border-primary/40"}`}>
                      <I n={CHANNEL_ICONS[c]} size={14} />{c === "wa" ? "WhatsApp" : c === "app" ? "In-app" : c.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <Btn className="w-full !py-2.5" icon="send" disabled={sending} onClick={send}>
                {sending ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Dispatching…</>) : "Send announcement"}
              </Btn>
              <p className="text-center text-[11px] text-sub">Estimated reach: <b className="num">{audience === "Whole school" ? "1,240" : audience === "All parents" ? "486" : audience.includes("Teachers") ? "42" : "96"}</b> recipients · delivery report appears instantly</p>
            </div>
          </Card>
        )}

        <div className={`space-y-4 ${canCompose ? "xl:col-span-7" : "xl:col-span-12"}`}>
          <Card pad={false}>
            <h3 className="border-b border-linesoft px-4 py-3 font-display text-[15px] font-extrabold text-ink">Sent announcements</h3>
            <div className="divide-y divide-linesoft">
              {app.announcements.map((a) => (
                <div key={a.id} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-extrabold text-ink">{a.title}</span>
                    <Badge tone="primary">{a.audience}</Badge>
                    <span className="ml-auto num text-[10.5px] text-sub">{S.timeAgo(a.ts)}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-sub">{a.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="flex gap-1">{a.channels.map((c) => <span key={c} className="flex h-6 w-6 items-center justify-center rounded bg-linesoft text-sub" title={c}><I n={CHANNEL_ICONS[c] ?? "app"} size={12} /></span>)}</span>
                    <span className="num text-[11px] text-sub">sent <b className="text-ink">{a.stats.sent.toLocaleString()}</b></span>
                    <span className="num text-[11px] text-sub">delivered <b className="text-ok">{a.stats.delivered.toLocaleString()}</b></span>
                    <span className="num text-[11px] text-sub">read <b className="text-info">{a.stats.read.toLocaleString()}</b></span>
                    <span className="ml-auto h-1.5 w-28 overflow-hidden rounded-full bg-linesoft">
                      <span className="anim-growx block h-full rounded-full bg-ok" style={{ width: `${(a.stats.delivered / a.stats.sent) * 100}%` }} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {role === "admin" && (
            <Card>
              <h3 className="mb-3 font-display text-[15px] font-extrabold text-ink">Channel adapters</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { k: "sms" as const, name: "SMS Gateway", desc: "Telenor Business · 8,240 credits left", ic: "sms" },
                  { k: "wa" as const, name: "WhatsApp Business", desc: "Cloud API · verified sender", ic: "wa" },
                  { k: "email" as const, name: "Email / SMTP", desc: "no-reply@dareilm.edu.pk", ic: "mail" },
                  { k: "push" as const, name: "Mobile Push", desc: "PWA push · not configured", ic: "app" },
                ].map((ad) => (
                  <div key={ad.k} className="flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-md ${adapters[ad.k] ? "bg-primarysoft text-primarydeep" : "bg-linesoft text-sub"}`}><I n={ad.ic} size={17} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-extrabold text-ink">{ad.name}</div>
                      <div className="truncate text-[10.5px] text-sub">{ad.desc}</div>
                    </div>
                    <Toggle on={adapters[ad.k]} onChange={(v) => { setAdapters({ ...adapters, [ad.k]: v }); app.toast(`${ad.name} ${v ? "enabled" : "disabled"} for outbound messages`, "info"); }} />
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-md bg-infosoft px-3 py-2 text-[11.5px] font-medium text-info">
                Adapters are provider-agnostic — swap gateways from Settings → Integrations without touching workflows. Failed deliveries retry automatically 3×.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
