import { useState } from "react";
import { useApp } from "../store";
import { fmtDate, dayKey } from "../data/seed";
import { Badge, Btn, Card, I, PageHead, Progress, Tbl, tdCls, thCls } from "../components/ui";

export default function Operations() {
  const app = useApp();
  const enabled = (["library", "transport", "inventory"] as const).filter((m) => app.moduleEnabled(m));
  const initial = (app.nav.params?.tab as string) ?? enabled[0] ?? "library";
  const [tab, setTab] = useState(enabled.includes(initial as "library") ? initial : (enabled[0] ?? "library"));
  const tabs = [
    { id: "library", label: "Library", icon: "book", mod: "library" },
    { id: "transport", label: "Transport", icon: "bus", mod: "transport" },
    { id: "inventory", label: "Inventory", icon: "box", mod: "inventory" },
    { id: "events", label: "Events & Calendar", icon: "cal", mod: "" },
  ].filter((t) => !t.mod || app.moduleEnabled(t.mod));

  return (
    <>
      <PageHead title="Operations" sub="Library · transport · inventory · events — modules your license enables" />
      <div className="anim-up mb-4 flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`focus-ring flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[12.5px] font-semibold transition ${tab === t.id ? "border border-line bg-surface text-primarydark shadow-sm" : "text-sub hover:text-ink"}`}><I n={t.icon} size={14} /> {t.label}</button>
        ))}
      </div>

      {tab === "library" && <Library />}
      {tab === "transport" && <Transport />}
      {tab === "inventory" && <Inventory />}
      {tab === "events" && <Events />}
    </>
  );
}

function Library() {
  const app = useApp();
  const overdue = app.db.bookIssues.filter((b) => !b.returned && b.due < dayKey(0));
  const issue = (id: string) => {
    app.set((d) => ({ ...d, books: d.books.map((b) => (b.id === id ? { ...b, issued: b.issued + 1 } : b)), bookIssues: [{ id: `bi${Date.now()}`, bookId: id, member: "Usman Malik", role: "Student 8-A", issued: dayKey(0), due: dayKey(14), returned: false, fine: 0 }, ...d.bookIssues] }));
    app.toast("Book issued — due date 14 days, library card scanned ✓", "ok");
  };
  const returnBook = (id: string) => {
    const bi = app.db.bookIssues.find((x) => x.id === id);
    app.set((d) => ({ ...d, bookIssues: d.bookIssues.map((x) => (x.id === id ? { ...x, returned: true } : x)), books: d.books.map((b) => (b.id === bi?.bookId ? { ...b, issued: Math.max(0, b.issued - 1) } : b)) }));
    app.toast(bi && bi.fine > 0 ? `Returned — fine Rs ${bi.fine} added to fee challan` : "Book returned — no fine 🎉", bi && bi.fine > 0 ? "warn" : "ok");
  };
  return (
    <div className="anim-up grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card pad={false} title="Book catalogue" sub={`${app.db.books.reduce((a, b) => a + b.copies, 0)} copies · barcode managed`}>
          <Tbl head={["Title", "Category", "Rack", "Copies", "Issued", ""]}>
            {app.db.books.map((b) => (
              <tr key={b.id} className="tbl-row">
                <td className={tdCls}><b>{b.title}</b><span className="block text-[10.5px] text-sub">{b.author}</span></td>
                <td className={tdCls}><Badge tone="primary">{b.cat}</Badge></td>
                <td className={`${tdCls} num`}>{b.rack}</td>
                <td className={`${tdCls} num`}>{b.copies}</td>
                <td className={tdCls}><span className={`num font-bold ${b.issued >= b.copies - 2 ? "text-warn" : "text-ink"}`}>{b.issued}</span><span className="text-[10.5px] text-sub"> / {b.copies}</span></td>
                <td className={tdCls}><Btn v="subtle" sz="xs" icon="plus" disabled={b.issued >= b.copies} onClick={() => issue(b.id)}>Issue</Btn></td>
              </tr>
            ))}
          </Tbl>
        </Card>
      </div>
      <Card title="Circulation" sub={`${overdue.length} overdue right now`}>
        <div className="space-y-2">
          {app.db.bookIssues.map((bi) => {
            const b = app.db.books.find((x) => x.id === bi.bookId);
            const late = !bi.returned && bi.due < dayKey(0);
            return (
              <div key={bi.id} className={`rounded-lg border p-2.5 ${late ? "border-danger/30 bg-dangersoft/40" : "border-line bg-canvas/60"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold text-ink">{b?.title}</p>
                  {bi.returned ? <Badge tone="ok">Returned</Badge> : late ? <Badge tone="danger">Overdue</Badge> : <Badge tone="primary">Issued</Badge>}
                </div>
                <p className="mt-0.5 text-[10.5px] text-sub">{bi.member} ({bi.role}) · due {fmtDate(bi.due)}{bi.fine ? ` · fine Rs ${bi.fine}` : ""}</p>
                {!bi.returned && <Btn v="ghost" sz="xs" className="mt-1.5" icon="refresh" onClick={() => returnBook(bi.id)}>Mark returned</Btn>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Transport() {
  const app = useApp();
  return (
    <div className="anim-up grid gap-4 lg:grid-cols-3">
      {app.db.routes.map((r) => {
        const expired = r.docExpiry < dayKey(0);
        const expiring = !expired && r.docExpiry < dayKey(14);
        const over = r.assigned > r.capacity;
        return (
          <Card key={r.id} title={r.name} sub={`${r.vehicle} · driver ${r.driver}${r.attendant !== "—" ? ` · attendant ${r.attendant}` : ""}`}
            actions={expired ? <Badge tone="danger"><I n="alert" size={11} /> Doc expired</Badge> : expiring ? <Badge tone="warn"><I n="alert" size={11} /> Expires {fmtDate(r.docExpiry)}</Badge> : <Badge tone="ok">Docs valid</Badge>}>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-[12px]"><span className="font-medium text-ink">Seat occupancy</span><span className={`num font-bold ${over ? "text-danger" : "text-sub"}`}>{r.assigned}/{r.capacity}{over ? " — OVER CAPACITY" : ""}</span></div>
                <Progress pct={(r.assigned / r.capacity) * 100} tone={over ? "danger" : r.assigned / r.capacity > 0.85 ? "warn" : "ok"} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.stops.map((s, i) => <span key={s} className="flex items-center gap-1 rounded-md bg-canvas px-2 py-1 text-[10.5px] font-semibold text-sub"><I n="pin" size={10} /> {s}{i < r.stops.length - 1 && <I n="chevR" size={9} className="text-sub/50" />}</span>)}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-[12px]">
                <span className="text-sub">Transport fee</span><span className="num font-bold text-ink">Rs {r.fee.toLocaleString()}/mo</span>
              </div>
              {over && <Btn v="danger" sz="sm" className="w-full" icon="alert" onClick={() => app.toast("Overflow flagged to transport incharge — 1 student needs route change", "warn")}>Resolve overflow</Btn>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Inventory() {
  const app = useApp();
  const low = app.db.inventory.filter((i) => i.stock < i.reorder);
  return (
    <div className="anim-up space-y-4">
      {low.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-warn/30 bg-warnsoft px-4 py-3 text-[12.5px] text-warn">
          <I n="alert" size={16} /> <b>{low.length} items below reorder level:</b> {low.map((i) => i.name).join(", ")}.
          <Btn v="dark" sz="xs" className="ml-auto" icon="send" onClick={() => { app.set((d) => ({ ...d, inventory: d.inventory.map((i) => i.stock < i.reorder ? { ...i, stock: i.reorder * 2 } : i) })); app.toast(`Purchase orders raised for ${low.length} items — suppliers notified`, "ok"); }}>Raise purchase orders</Btn>
        </div>
      )}
      <Card pad={false} title="Stock register" sub="Live stock with reorder thresholds">
        <Tbl head={["Item", "Category", "Supplier", "In stock", "Reorder level", "Status", ""]}>
          {app.db.inventory.map((i) => {
            const isLow = i.stock < i.reorder;
            return (
              <tr key={i.id} className="tbl-row">
                <td className={`${tdCls} font-bold`}>{i.name}</td>
                <td className={tdCls}><Badge tone="primary">{i.cat}</Badge></td>
                <td className={`${tdCls} text-sub`}>{i.supplier}</td>
                <td className={`${tdCls} num font-bold ${isLow ? "text-danger" : ""}`}>{i.stock} {i.unit}</td>
                <td className={`${tdCls} num text-sub`}>{i.reorder} {i.unit}</td>
                <td className={tdCls}>{isLow ? <Badge tone="danger">LOW</Badge> : <Badge tone="ok">OK</Badge>}</td>
                <td className={tdCls}>
                  <span className="flex gap-1">
                    <Btn v="ghost" sz="xs" icon="plus" onClick={() => { app.set((d) => ({ ...d, inventory: d.inventory.map((x) => x.id === i.id ? { ...x, stock: x.stock + 10 } : x) })); app.toast(`Stock-in: +10 ${i.unit} of ${i.name}`, "info"); }}>+10</Btn>
                    <Btn v="ghost" sz="xs" icon="down" onClick={() => { app.set((d) => ({ ...d, inventory: d.inventory.map((x) => x.id === i.id ? { ...x, stock: Math.max(0, x.stock - 5) } : x) })); app.toast(`Issued 5 ${i.unit} of ${i.name}`, "info"); }}>−5</Btn>
                  </span>
                </td>
              </tr>
            );
          })}
        </Tbl>
      </Card>
    </div>
  );
}

function Events() {
  const app = useApp();
  return (
    <div className="anim-up grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {app.db.events.map((e) => (
        <div key={e.id} className="group rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="num flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primarysoft leading-none text-primarydark">
              <span className="text-[17px] font-bold">{new Date(e.date + "T12:00:00").getDate()}</span>
              <span className="text-[8.5px] font-bold uppercase">{new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { month: "short" })}</span>
            </span>
            <Badge tone={e.type === "Academic" ? "primary" : e.type === "Sports" ? "accent" : "neutral"}>{e.type}</Badge>
          </div>
          <p className="display mt-3 text-[14.5px] font-bold text-ink">{e.title}</p>
          <p className="mt-0.5 text-[11.5px] text-sub">{e.place} · {e.audience}</p>
          <Btn v="subtle" sz="xs" icon="bell" className="mt-3" onClick={() => app.toast(`Reminder scheduled for ${e.title} — 1 day before`, "info")}>Set reminder</Btn>
        </div>
      ))}
    </div>
  );
}
