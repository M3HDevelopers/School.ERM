import React, { useEffect, useState } from "react";
import { useApp } from "../store";
import * as S from "../data/seed";
import { Badge, Btn, Card, Field, HBar, I, Modal, PageHead, Select, Tabs, tdCls, TextInput, thCls } from "../components/ui";

const EVENT_TONE: Record<S.SchoolEvent["type"], string> = { exam: "danger", holiday: "accent", event: "primary", meeting: "info", sports: "ok" };

export default function Operations() {
  const app = useApp();
  const [tab, setTab] = useState("library");
  const [evOpen, setEvOpen] = useState(false);
  const [ev, setEv] = useState({ title: "", date: S.todayISO(), type: "event" as S.SchoolEvent["type"], audience: "Whole school" });

  useEffect(() => {
    if (app.nav.params?.tab) setTab(app.nav.params.tab);
  }, [app.nav.params]);

  const addEvent = () => {
    if (ev.title.trim().length < 3) return app.toast("Event title is required", "danger");
    app.addEvent({ ...ev, title: ev.title.trim() });
    app.toast(`Event "${ev.title.trim()}" added to calendar · reminders scheduled`);
    setEvOpen(false);
    setEv({ title: "", date: S.todayISO(), type: "event", audience: "Whole school" });
  };

  const lowStock = app.items.filter((i) => i.stock <= i.reorder);

  return (
    <>
      <PageHead title="Operations" sub="Library · Transport · Inventory · Events — daily school operations">
        {tab === "events" && <Btn sz="sm" icon="plus" onClick={() => setEvOpen(true)}>Add event</Btn>}
      </PageHead>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "library", label: "Library", icon: "book" },
        { id: "transport", label: "Transport", icon: "bus" },
        { id: "inventory", label: "Inventory", icon: "archive" },
        { id: "events", label: "Calendar & Events", icon: "cal" },
      ]} />

      {tab === "library" && (
        <>
          <div className="stagger mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[["Titles", String(app.books.length), "text-ink", "book"], ["Total copies", String(app.books.reduce((a, b) => a + b.copies, 0)), "text-primarydeep", "archive"],
            ["Issued now", String(app.books.reduce((a, b) => a + b.issued, 0)), "text-info", "users"], ["Overdue", "9", "text-danger", "clock"]].map(([l, v, tc, ic]) => (
              <Card key={l} className="!p-3.5"><div className="flex items-center justify-between"><span className="text-[10.5px] font-bold uppercase tracking-wider text-sub">{l}</span><I n={ic} size={15} className="text-sub" /></div><div className={`num font-display text-[20px] font-extrabold ${tc}`}>{v}</div></Card>
            ))}
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse">
                <thead className="bg-paper"><tr>
                  <th className={thCls}>Book</th><th className={thCls}>Category</th><th className={thCls}>Rack</th>
                  <th className={thCls}>Availability</th><th className={thCls}>Issued</th><th className={thCls}></th>
                </tr></thead>
                <tbody>
                  {app.books.map((b) => (
                    <tr key={b.id} className="border-t border-linesoft transition hover:bg-linesoft/50">
                      <td className={tdCls}><span className="font-bold text-ink">{b.title}</span><span className="block text-[10.5px] text-sub">{b.author}</span></td>
                      <td className={tdCls}><Badge tone="primary">{b.cat}</Badge></td>
                      <td className={`${tdCls} num text-sub`}>{b.rack}</td>
                      <td className={tdCls} style={{ minWidth: 160 }}>
                        <span className="h-1.5 block w-32 overflow-hidden rounded-full bg-linesoft">
                          <span className="block h-full rounded-full" style={{ width: `${((b.copies - b.issued) / b.copies) * 100}%`, background: b.copies - b.issued === 0 ? "var(--color-danger)" : "var(--color-primary)" }} />
                        </span>
                        <span className="num text-[10px] text-sub">{b.copies - b.issued}/{b.copies} on shelf</span>
                      </td>
                      <td className={`${tdCls} num font-bold`}>{b.issued}</td>
                      <td className={tdCls}>
                        <span className="flex justify-end gap-1.5">
                          <Btn v="soft" sz="xs" icon="arrowR" disabled={b.issued >= b.copies} onClick={() => { app.toggleBook(b.id); app.toast(`Issued "${b.title}" · due in 14 days`); }}>Issue</Btn>
                          <Btn v="outline" sz="xs" icon="chevL" disabled={b.issued === 0} onClick={() => { app.returnBook(b.id); app.toast(`"${b.title}" returned · fine Rs 0`); }}>Return</Btn>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "transport" && (
        <div className="grid gap-4 md:grid-cols-2">
          {app.routes.map((r) => {
            const expired = r.docExpiry < S.todayISO();
            const soon = !expired && new Date(r.docExpiry).getTime() - Date.now() < 20 * 86400000;
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-[15px] font-extrabold text-ink">{r.name}</h3>
                    <p className="num text-[11px] text-sub">{r.vehicle} · {r.reg} · {r.driver}{r.attendant !== "—" ? ` · ${r.attendant}` : ""}</p>
                  </div>
                  {expired ? <Badge tone="danger" dot>docs expired</Badge> : soon ? <Badge tone="warn" dot>docs expiring</Badge> : <Badge tone="ok" dot>docs valid</Badge>}
                </div>
                <div className="mt-3">
                  <HBar label="Seats filled" value={r.assigned} max={r.capacity} right={`${r.assigned}/${r.capacity} · fee ${S.fmtRs(r.fee)}/mo`} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.stops.map((s) => <span key={s} className="rounded-md bg-linesoft px-2 py-1 text-[10.5px] font-semibold text-sub"><I n="home" size={10} className="mr-1 inline" />{s}</span>)}
                </div>
                <div className="mt-3 flex gap-2 border-t border-linesoft pt-3">
                  <Btn v="outline" sz="xs" icon="phone" onClick={() => app.toast(`Calling driver ${r.driver} (demo)`, "info")}>Driver</Btn>
                  <Btn v="outline" sz="xs" icon="send" onClick={() => app.toast(`Route status shared with ${r.assigned} parents`, "ok")}>Notify parents</Btn>
                  {expired && <Btn v="danger" sz="xs" icon="alert" onClick={() => app.toast("Vehicle renewal task created for transport incharge", "info")}>Renew docs</Btn>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "inventory" && (
        <>
          {lowStock.length > 0 && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-warn/40 bg-warnsoft px-4 py-2.5 text-[12.5px] font-semibold text-warn anim-pop">
              <I n="alert" size={15} /> {lowStock.length} item(s) at or below reorder level — purchase requests recommended.
            </div>
          )}
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead className="bg-paper"><tr>
                  <th className={thCls}>Item</th><th className={thCls}>Category</th><th className={thCls}>Unit price</th>
                  <th className={thCls}>Stock</th><th className={thCls}>Status</th><th className={thCls}></th>
                </tr></thead>
                <tbody>
                  {app.items.map((it) => {
                    const low = it.stock <= it.reorder;
                    return (
                      <tr key={it.id} className="border-t border-linesoft transition hover:bg-linesoft/50">
                        <td className={`${tdCls} font-bold text-ink`}>{it.name}</td>
                        <td className={tdCls}><Badge tone="neutral">{it.cat}</Badge></td>
                        <td className={`${tdCls} num`}>{S.fmtRs(it.price)}</td>
                        <td className={`${tdCls} num font-extrabold ${low ? "text-danger" : "text-ink"}`}>{it.stock} <span className="font-medium text-sub">{it.unit}(s)</span></td>
                        <td className={tdCls}>{low ? <Badge tone="danger" dot>low stock</Badge> : <Badge tone="ok" dot>ok</Badge>}</td>
                        <td className={tdCls}>
                          <span className="flex justify-end items-center gap-1.5">
                            <Btn v="outline" sz="xs" icon="minus" disabled={it.stock === 0} onClick={() => app.stockMove(it.id, -1)}>Issue</Btn>
                            <Btn v="soft" sz="xs" icon="plus" onClick={() => { app.stockMove(it.id, 5); app.toast(`Stock in: +5 ${it.unit}(s) ${it.name}`); }}>+5</Btn>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "events" && (
        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-7" pad={false}>
            <h3 className="border-b border-linesoft px-4 py-3 font-display text-[15px] font-extrabold text-ink">School calendar — upcoming</h3>
            <div className="divide-y divide-linesoft">
              {[...app.events].sort((a, b) => (a.date < b.date ? -1 : 1)).map((e) => (
                <div key={e.id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-primarysoft/40">
                  <span className={`num w-16 shrink-0 rounded-md px-2 py-1.5 text-center text-[12px] font-extrabold ${e.type === "exam" ? "bg-dangersoft text-danger" : e.type === "holiday" ? "bg-accentsoft text-[#8a5c07]" : e.type === "sports" ? "bg-oksoft text-ok" : e.type === "meeting" ? "bg-infosoft text-info" : "bg-primarysoft text-primarydeep"}`}>
                    {new Date(e.date + "T00:00:00").toLocaleDateString("en", { day: "numeric", month: "short" })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-ink">{e.title}</div>
                    <div className="text-[11px] text-sub">{e.audience}</div>
                  </div>
                  <Badge tone={EVENT_TONE[e.type]}>{e.type}</Badge>
                  {e.date < S.todayISO() && <Badge tone="neutral">past</Badge>}
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <h3 className="mb-2 font-display text-[15px] font-extrabold text-ink">Bookings & reminders</h3>
            {[["Main hall", "Iqbal Day assembly", S.dateISO(8)], ["Lab block", "Science fair setup", S.dateISO(14)], ["Sports ground", "Cricket final · houses", S.dateISO(11)]].map(([r, w, d]) => (
              <div key={w as string} className="mb-2 flex items-center gap-3 rounded-md border border-linesoft bg-paper px-3 py-2.5">
                <I n="building" size={16} className="text-primary" />
                <span className="flex-1"><span className="block text-[12.5px] font-bold text-ink">{r}</span><span className="text-[11px] text-sub">{w}</span></span>
                <span className="num text-[11px] font-bold text-sub">{S.fmtDate(d as string)}</span>
              </div>
            ))}
            <p className="mt-3 rounded-md bg-infosoft px-3 py-2 text-[11.5px] font-medium text-info">Event reminders go out 48h and 2h before via app + SMS to the selected audience.</p>
          </Card>
        </div>
      )}

      <Modal open={evOpen} onClose={() => setEvOpen(false)} title="Add Calendar Event" w="max-w-md"
        footer={<><Btn v="outline" onClick={() => setEvOpen(false)}>Cancel</Btn><Btn icon="check" onClick={addEvent}>Add event</Btn></>}>
        <div className="space-y-3.5">
          <Field label="Event title"><TextInput value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} placeholder="e.g. Annual Sports Day" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><TextInput type="date" value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} /></Field>
            <Field label="Type"><Select value={ev.type} onChange={(e) => setEv({ ...ev, type: e.target.value as S.SchoolEvent["type"] })}>
              <option value="event">Event</option><option value="exam">Exam</option><option value="holiday">Holiday</option>
              <option value="meeting">Meeting</option><option value="sports">Sports</option>
            </Select></Field>
          </div>
          <Field label="Audience"><Select value={ev.audience} onChange={(e) => setEv({ ...ev, audience: e.target.value })}>
            <option>Whole school</option><option>Parents · All</option><option>Teachers only</option><option>Middle school</option><option>Senior classes</option>
          </Select></Field>
        </div>
      </Modal>
    </>
  );
}
