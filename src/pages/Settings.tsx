import { useEffect, useState } from "react";
import { useApp } from "../store";
import { SCHOOL, THEMES, timeAgo } from "../data/seed";
import { Badge, Btn, Card, Confirm, Field, I, PageHead, Select, Tabs, TextInput, Textarea, Toggle, tdCls, thCls, Tbl } from "../components/ui";

export default function Settings() {
  const app = useApp();
  const [tab, setTab] = useState(app.nav.params?.tab === "audit" ? "audit" : "branding");
  const [name, setName] = useState(app.branding.schoolName);
  const [tagline, setTagline] = useState(app.branding.tagline);
  const [confirmReset, setConfirmReset] = useState(false);

  const modulesNav = [
    ["Students", "students"], ["Attendance", "attendance"], ["Fees", "fees"], ["Exams", "exams"],
    ["Admissions", "admissions"], ["HR", "hr"], ["Reports", "reports"], ["Public website", "public_website"],
  ] as const;

  return (
    <>
      <PageHead title="Settings & White-Label Branding" sub="Everything a tenant can change without writing a line of code" />
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "branding", label: "Branding", icon: "sparkle" },
        { id: "school", label: "School Profile", icon: "building" },
        { id: "modules", label: "Modules & Permissions", icon: "layers" },
        { id: "audit", label: "Audit Log", icon: "history" },
        { id: "danger", label: "Danger Zone", icon: "alert" },
      ]} />

      <div className="mt-4">
        {tab === "branding" && (
          <div className="anim-up grid gap-4 lg:grid-cols-3">
            <Card title="Theme" sub="Applies instantly across ERP, printed documents and the public website" className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {THEMES.map((t) => (
                  <button key={t.id} onClick={() => { app.applyTheme(t.id); app.toast(`Theme "${t.name}" applied — white-label re-skin live`, "info"); }}
                    className={`focus-ring group rounded-xl border-2 p-4 text-left transition-all ${app.branding.themeId === t.id ? "border-primary shadow-md" : "border-line hover:border-primary/40"}`}>
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg shadow-inner" style={{ background: t.primary }} />
                      <span className="h-8 w-8 rounded-lg shadow-inner" style={{ background: t.primarydark }} />
                      <span className="h-8 w-8 rounded-lg shadow-inner" style={{ background: t.accent }} />
                      <span className="h-8 w-8 rounded-lg border border-line" style={{ background: t.primarysoft }} />
                    </div>
                    <p className="display mt-2.5 text-[14px] font-bold text-ink">{t.name}</p>
                    <p className="text-[11px] text-sub">{app.branding.themeId === t.id ? "Active — applied everywhere" : "Tap to preview live"}</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-canvas/70 px-3 py-2.5 text-[11.5px] text-sub"><I n="shield" size={14} className="text-primarydark" /> Every tenant sees their own school's identity — logo, colors, PDF headers, challan branding and portal title. This is the white-label promise, working live.</p>
            </Card>
            <Card title="Identity" sub="Sidebar, login page & documents">
              <div className="space-y-3">
                <Field label="School name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label="Tagline"><TextInput value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
                <Field label="Portal favicon / monogram"><div className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: "var(--color-primary)" }}><I n="student" size={19} /></span><span className="text-[11px] text-sub">Auto-generated from short name · upload supported in production</span></div></Field>
                <Btn icon="check" onClick={() => { app.setBranding({ schoolName: name, tagline, shortName: name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase() }); app.toast("Branding saved — check the sidebar, it's already live", "ok"); }}>Save identity</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "school" && (
          <div className="anim-up grid gap-4 lg:grid-cols-2">
            <Card title="Institution profile">
              <div className="grid gap-3 sm:grid-cols-2">
                {[["School code", SCHOOL.code], ["Session", SCHOOL.session], ["Established", String(SCHOOL.est)], ["Phone", SCHOOL.phone]].map(([l, v]) => (
                  <Field key={l} label={l}><TextInput defaultValue={v} readOnly className="bg-canvas/70 text-sub" /></Field>
                ))}
                <Field label="Email"><TextInput defaultValue={SCHOOL.email} /></Field>
                <Field label="Address"><TextInput defaultValue={SCHOOL.address} /></Field>
              </div>
              <Btn className="mt-3" icon="check" onClick={() => app.toast("School profile saved — audit entry written", "ok")}>Save profile</Btn>
            </Card>
            <Card title="Campuses & sessions">
              {SCHOOL.campuses.map((c, i) => (
                <div key={c} className="mb-2 flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primarysoft text-primarydark"><I n="building" size={15} /></span>
                  <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">{c}</p><p className="text-[10.5px] text-sub">{i === 0 ? "Grades 4–10 · 480 students" : "Grades 1–3 · 132 students"}</p></div>
                  <Badge tone="ok">Active</Badge>
                </div>
              ))}
              <p className="rounded-lg bg-primarysoft px-3 py-2 text-[11px] text-primarydark">Multi-campus is available on the Enterprise package — one central admin with campus-scoped permissions.</p>
            </Card>
          </div>
        )}

        {tab === "modules" && (
          <div className="anim-up grid gap-4 lg:grid-cols-3">
            <Card title="Enabled modules" sub="Entitlements granted by your license — toggles simulate the owner's control plane" className="lg:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {modulesNav.map(([label, key]) => {
                  const on = app.moduleEnabled(key);
                  return (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                      <p className="text-[12.5px] font-bold text-ink">{label}</p>
                      <Toggle on={on} onChange={() => { app.toggleTenantModule("t-dia", key); }} />
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-warn/30 bg-warnsoft px-3 py-2.5 text-[11.5px] text-warn"><I n="info" size={14} /> Try switching one off — the sidebar navigation updates instantly. In production only the Software Owner panel can change entitlements.</p>
            </Card>
            <Card title="Role permission matrix" sub="Sample — full matrix in production">
              <Tbl head={["Module", "Admin", "Teacher", "Parent"]}>
                {[["Students", "Full", "Read (own class)", "Own child"], ["Fees", "Full", "—", "View & pay"], ["Marks", "Approve", "Enter", "View"], ["Reports", "Full", "Class-level", "—"]].map((r) => (
                  <tr key={r[0]} className="tbl-row">{r.map((c, i) => <td key={i} className={`${tdCls} ${i === 0 ? "font-bold" : "text-sub"}`}>{c}</td>)}</tr>
                ))}
              </Tbl>
            </Card>
          </div>
        )}

        {tab === "audit" && (
          <Card pad={false} className="anim-up" title="School audit trail" sub="Every fee, result and record action — append-only"
            actions={<Btn v="ghost" sz="xs" icon="download" onClick={() => app.toast("Audit log exported (CSV)", "info")}>Export</Btn>}>
            <Tbl head={["Time", "User", "Action", "Detail"]}>
              {app.db.schoolAudit.map((a) => (
                <tr key={a.id} className="tbl-row">
                  <td className={`${tdCls} text-sub`}>{timeAgo(a.time)}</td>
                  <td className={`${tdCls} font-bold`}>{a.user || "System"}</td>
                  <td className={tdCls}><Badge tone="primary">{a.action}</Badge></td>
                  <td className={`${tdCls} text-sub`}>{a.detail}</td>
                </tr>
              ))}
            </Tbl>
          </Card>
        )}

        {tab === "danger" && (
          <div className="anim-up max-w-xl space-y-4">
            <Card title="Reset demo data" sub="Restores the original Dar-e-Ilm dataset">
              <p className="text-[12.5px] text-sub">All students, vouchers, leads, marks and owner-panel changes you made in this browser will be wiped and re-seeded. This only affects the demo tenant.</p>
              <Btn v="danger" className="mt-3" icon="refresh" onClick={() => setConfirmReset(true)}>Reset demo data</Btn>
            </Card>
            <Card title="Data portability">
              <div className="flex flex-wrap gap-2">
                <Btn v="outline" sz="sm" icon="download" onClick={() => app.toast("Full tenant export (JSON) prepared — download link expires in 24h", "info")}>Export tenant data</Btn>
                <Btn v="outline" sz="sm" icon="shield" onClick={() => app.toast("Backup verification report sent to admin email", "info")}>Verify latest backup</Btn>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} onYes={app.resetDemo} danger yesLabel="Reset everything"
        title="Reset demo data?" body="This wipes every change made in this browser session — new students, payments, leads, owner-panel edits — and restores the original seed. It cannot be undone." />
    </>
  );
}
