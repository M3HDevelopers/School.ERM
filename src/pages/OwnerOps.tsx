import { useEffect, useMemo, useState } from "react";
import { useApp, downloadCSV } from "../store";
import { ADDONS, PLANS, dayKey, fmtDate, fmtPKR, timeAgo } from "../data/seed";
import { planOf, mrrOf, statusKeyOf, StatusBadge } from "./OwnerPanel";
import { Badge, Btn, Card, Confirm, EmptyState, Field, HBars, I, Kpi, Modal, PageHead, Progress, SearchInput, Select, StatusDot, Tabs, Tbl, Textarea, TextInput, Toggle, tdCls, thCls } from "../components/ui";

// ================= LICENSES & TRIALS =================
export function LicensesPage() {
  const app = useApp();
  const tenants = app.db.ownerTenants;
  const trials = tenants.filter((t) => t.status === "trial");
  const [verify, setVerify] = useState("");
  const [verified, setVerified] = useState<null | { ok: boolean; msg: string }>(null);

  const doVerify = () => {
    const t = tenants.find((x) => x.license.key.toLowerCase() === verify.trim().toLowerCase());
    if (!verify.trim()) { setVerified({ ok: false, msg: "Enter a license key to verify." }); return; }
    setVerified(t ? { ok: true, msg: `${t.license.id} · ${t.name} · ${t.license.type} · ${t.license.expiresOn ? `valid till ${fmtDate(t.license.expiresOn)}` : "lifetime"} · status: ${t.license.status}` } : { ok: false, msg: "No license matches this key — it may be revoked, mistyped, or from another environment." });
  };

  return (
    <>
      <PageHead title="Licenses & Trials" sub="The trial engine and license lifecycle — create, extend, convert, renew, suspend"
        actions={<Btn sz="sm" icon="plus" onClick={() => app.go("tenants", { new: "1" })}>New tenant / trial</Btn>} />

      <div className="anim-up grid gap-4 lg:grid-cols-3">
        <Card title="Active trials" sub="Automatic expiry reminders at 7 / 3 / 1 days" className="lg:col-span-2">
          {trials.length === 0 ? <EmptyState icon="clock" title="No running trials" body="Create one from the onboarding wizard." /> : (
            <div className="space-y-3">
              {trials.map((t) => {
                const days = t.trialDaysLeft ?? 0;
                const total = 30;
                return (
                  <div key={t.id} className={`rounded-xl border p-3.5 ${days <= 7 ? "border-warn/40 bg-warnsoft/50" : "border-line bg-surface"}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="display text-[14px] font-bold text-ink">{t.name}</p>
                      <StatusBadge t={t} />
                      <span className="ml-auto num text-[12px] font-bold text-sub">{days} days left · ends {t.license.expiresOn ? fmtDate(t.license.expiresOn) : "—"}</span>
                    </div>
                    <div className="mt-2"><Progress pct={((total - days) / total) * 100} tone={days <= 7 ? "warn" : "primary"} /></div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Btn v="subtle" sz="xs" icon="clock" onClick={() => app.extendTrial(t.id, 7, "Commercial goodwill — requested by sales")}>+7 days</Btn>
                      <Btn v="subtle" sz="xs" icon="clock" onClick={() => app.extendTrial(t.id, 14, "Migration assistance extension")}>+14 days</Btn>
                      <Btn v="accent" sz="xs" icon="key" onClick={() => app.convertToPaid(t.id, t.planId ?? "professional", "monthly")}>Convert → Professional</Btn>
                      <Btn v="ghost" sz="xs" icon="x" onClick={() => app.setTenantStatus(t.id, "cancelled", "Trial cancelled early — not a fit")}>Cancel trial</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="License verification" sub="Same endpoint the runtime uses">
          <TextInput value={verify} onChange={(e) => setVerify(e.target.value)} placeholder="MKZ-XXXX-XXXX-XXXX-XXXX" className="num" />
          <Btn className="mt-2 w-full" icon="shield" onClick={doVerify}>Verify key</Btn>
          {verified && (
            <div className={`anim-pop mt-3 rounded-lg border p-3 text-[12px] leading-relaxed ${verified.ok ? "border-ok/30 bg-oksoft/60 text-ok" : "border-danger/30 bg-dangersoft/60 text-danger"}`}>
              <p className="flex items-center gap-1.5 font-bold"><I n={verified.ok ? "check" : "x"} size={14} /> {verified.ok ? "VALID LICENSE" : "INVALID"}</p>
              <p className="mt-1 font-medium text-ink">{verified.msg}</p>
            </div>
          )}
          <p className="mt-3 text-[10.5px] leading-relaxed text-sub">Try: <button className="num focus-ring font-bold text-primarydark hover:underline" onClick={() => setVerify("MKZ-9F2K-D8LP-Q7XN-B3T6")}>MKZ-9F2K-D8LP-Q7XN-B3T6</button> (Dar-e-Ilm) or any revoked key.</p>
        </Card>
      </div>

      <Card className="anim-up mt-4" pad={false} title="All licenses" sub="Every license issued — full history retained after renewals"
        actions={<Btn v="ghost" sz="xs" icon="download" onClick={() => { downloadCSV("licenses", tenants.map((t) => ({ license: t.license.id, key: t.license.key, tenant: t.name, type: t.license.type, activated: t.license.activatedOn, expires: t.license.expiresOn ?? "lifetime", status: t.license.status }))); app.toast("License register exported"); }}>Export</Btn>}>
        <Tbl head={["License", "Tenant", "Type", "Activated", "Expires", "Modules", "Status", "Quick actions"]}>
          {tenants.map((t) => (
            <tr key={t.id} className="tbl-row">
              <td className={`${tdCls} num font-bold`}>{t.license.id}</td>
              <td className={tdCls}><b>{t.name}</b><span className="block text-[10.5px] text-sub">{t.code}</span></td>
              <td className={tdCls}><Badge tone={t.license.type === "permanent" ? "accent" : t.license.type === "trial" ? "warn" : "primary"}>{t.license.type.toUpperCase()}</Badge></td>
              <td className={`${tdCls} num text-[12px]`}>{fmtDate(t.license.activatedOn)}</td>
              <td className={`${tdCls} num text-[12px] ${t.license.expiresOn && t.license.expiresOn < dayKey(14) ? "font-bold text-danger" : ""}`}>{t.license.expiresOn ? fmtDate(t.license.expiresOn) : "Lifetime"}</td>
              <td className={`${tdCls} num`}>{t.modules.length} enabled</td>
              <td className={tdCls}><StatusBadge t={t} /></td>
              <td className={tdCls}>
                <span className="flex gap-1.5">
                  {t.license.type !== "permanent" && t.license.type !== "trial" && <Btn v="ghost" sz="xs" icon="refresh" onClick={() => app.renewLicense(t.id, 1)}>Renew +1mo</Btn>}
                  {t.status === "active_paid" && <Btn v="ghost" sz="xs" icon="pause" onClick={() => app.setTenantStatus(t.id, "suspended", "Manual suspension from license register")}>Suspend</Btn>}
                  {["suspended", "expired"].includes(t.status) && <Btn v="ghost" sz="xs" icon="play" onClick={() => app.setTenantStatus(t.id, "active_paid", "Reactivated from license register", "normal")}>Reactivate</Btn>}
                </span>
              </td>
            </tr>
          ))}
        </Tbl>
      </Card>
    </>
  );
}

// ================= PLANS & BILLING =================
export function BillingPage() {
  const app = useApp();
  const tenants = app.db.ownerTenants;
  const mrr = tenants.reduce((a, t) => a + mrrOf(t), 0);
  const outstanding = app.db.invoices.filter((i) => i.status !== "paid").reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const collectedThisMonth = app.db.invoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.paidAmount, 0);
  const [invFor, setInvFor] = useState<string | null>(null);
  const [addonFor, setAddonFor] = useState<string | null>(null);
  const [amt, setAmt] = useState(25000);

  return (
    <>
      <PageHead title="Plans & Billing" sub="Packaging, commercial invoices, add-on revenue — the business of selling schools" />
      <div className="anim-up mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Monthly recurring" value={mrr} prefix="Rs " sub="Plans + monthly add-ons" />
        <Kpi label="Collected (all-time shown)" value={collectedThisMonth} prefix="Rs " sub="Verified payments" />
        <Kpi label="Outstanding invoices" value={outstanding} prefix="Rs " tone="var(--color-danger)" sub={`${app.db.invoices.filter((i) => i.status === "overdue").length} overdue`} />
        <Kpi label="Add-on adoption" value={tenants.reduce((a, t) => a + t.addons.length, 0)} sub="Active add-ons across tenants" />
      </div>

      {/* plans */}
      <div className="anim-up grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.id} className={`relative flex flex-col rounded-xl border-2 bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md ${p.popular ? "border-primary" : "border-line"}`}>
            {p.popular && <span className="absolute -top-2.5 left-4 rounded-md bg-primary px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-white">Most sold</span>}
            <p className="display text-[16px] font-bold text-ink">{p.name}</p>
            <p className="text-[11px] text-sub">{p.tagline}</p>
            <p className="num display mt-2 text-[22px] font-bold text-primarydark">{fmtPKR(p.price)}<span className="text-[11px] font-medium text-sub">{p.interval === "monthly" ? " /month" : p.interval === "annual" ? " /year" : " one-time"}</span></p>
            <div className="mt-3 space-y-1 text-[11.5px] text-sub">
              <p className="flex justify-between"><span>Users</span><b className="num text-ink">{p.users}</b></p>
              <p className="flex justify-between"><span>Campuses</span><b className="num text-ink">{p.campuses}</b></p>
              <p className="flex justify-between"><span>Students</span><b className="num text-ink">{p.students.toLocaleString()}</b></p>
              <p className="flex justify-between"><span>Storage</span><b className="num text-ink">{p.storageGb} GB</b></p>
              <p className="flex justify-between"><span>SMS / month</span><b className="num text-ink">{p.sms.toLocaleString()}</b></p>
              <p className="flex justify-between"><span>Support</span><b className="text-right text-ink">{p.support}</b></p>
            </div>
            <p className="mt-3 border-t border-line pt-2 text-[11px] font-semibold text-primarydark">{p.modules.length} modules included</p>
            <p className="text-[10.5px] leading-relaxed text-sub">{p.modules.slice(0, 6).map((m) => m.replace(/_/g, " ")).join(", ")}{p.modules.length > 6 ? ` +${p.modules.length - 6} more` : ""}</p>
            <p className="mt-auto pt-2 text-[10.5px] text-sub">{tenants.filter((t) => t.planId === p.id).length} tenant(s) on this plan</p>
          </div>
        ))}
      </div>

      <div className="anim-up mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Invoices" sub="Commercial billing to customers" className="lg:col-span-2" pad={false}
          actions={<Btn v="subtle" sz="xs" icon="download" onClick={() => { downloadCSV("invoices", app.db.invoices.map((i) => ({ invoice: i.no, tenant: tenants.find((t) => t.id === i.tenantId)?.name ?? "", period: i.period, amount: i.amount, status: i.status, due: i.dueDate }))); app.toast("Invoice register exported"); }}>Export</Btn>}>
          <Tbl head={["Invoice", "Customer", "Period", "Amount", "Due", "Status", ""]}>
            {app.db.invoices.map((i) => {
              const t = tenants.find((x) => x.id === i.tenantId);
              return (
                <tr key={i.id} className="tbl-row">
                  <td className={`${tdCls} num font-bold`}>{i.no}</td>
                  <td className={tdCls}><b>{t?.name ?? "—"}</b></td>
                  <td className={`${tdCls} text-sub`}>{i.period}</td>
                  <td className={`${tdCls} num font-bold`}>{fmtPKR(i.amount)}</td>
                  <td className={`${tdCls} num text-[12px] ${i.status === "overdue" ? "font-bold text-danger" : ""}`}>{fmtDate(i.dueDate)}</td>
                  <td className={tdCls}><Badge tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "danger" : "warn"}>{i.status.toUpperCase()}</Badge></td>
                  <td className={tdCls}>{i.status !== "paid" && <Btn v="subtle" sz="xs" icon="check" onClick={() => app.recordInvoicePayment(i.id, "Bank Transfer")}>Record payment</Btn>}</td>
                </tr>
              );
            })}
          </Tbl>
        </Card>

        <div className="space-y-4">
          <Card title="Add-on catalog" sub="Feature upselling layer">
            <div className="space-y-2.5">
              {ADDONS.map((a) => (
                <div key={a.id} className="rounded-lg border border-line bg-canvas/60 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold text-ink">{a.name}</p>
                    <span className="num text-[12px] font-bold text-primarydark">{fmtPKR(a.price)}{a.kind === "monthly" ? "/mo" : ""}</span>
                  </div>
                  <p className="text-[10.5px] text-sub">{a.desc}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress pct={(a.adoption / 8) * 100} tone="accent" className="flex-1" />
                    <span className="num text-[10.5px] font-bold text-sub">{a.adoption} tenants</span>
                    <Btn v="ghost" sz="xs" icon="plus" onClick={() => { setAddonFor(a.id); }}>Assign</Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Quick invoice">
            <Field label="Customer"><Select value={invFor ?? ""} onChange={(e) => setInvFor(e.target.value || null)}><option value="">Select tenant…</option>{tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
            <div className="mt-2"><Field label="Amount (PKR)"><TextInput type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></Field></div>
            <Btn className="mt-3 w-full" icon="card" disabled={!invFor} onClick={() => { if (invFor) { app.createInvoice(invFor, amt, "Manual invoice — control plane", "Setup / onboarding fee"); setInvFor(null); } }}>Generate invoice</Btn>
          </Card>
        </div>
      </div>

      <Modal open={!!addonFor} onClose={() => setAddonFor(null)} title="Assign add-on" sub={ADDONS.find((a) => a.id === addonFor)?.name}
        footer={<Btn v="outline" onClick={() => setAddonFor(null)}>Close</Btn>}>
        <div className="space-y-2">
          {tenants.filter((t) => !t.addons.some((x) => x.id === addonFor)).map((t) => (
            <button key={t.id} onClick={() => { if (addonFor) app.assignAddon(t.id, addonFor); setAddonFor(null); }}
              className="focus-ring flex w-full items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primarysoft/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-night font-bold text-accent">{t.shortName.slice(0, 2)}</span>
              <span className="flex-1"><b className="block text-[12.5px] text-ink">{t.name}</b><span className="text-[10.5px] text-sub">{planOf(t)?.name ?? "Trial"} · {t.status.replace("_", " ")}</span></span>
              <I n="plus" size={14} className="text-primarydark" />
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

// ================= SYSTEM & RELEASES =================
export function SystemPage() {
  const app = useApp();
  const [tab, setTab] = useState("health");
  const [maintConfirm, setMaintConfirm] = useState(false);
  const [killConfirm, setKillConfirm] = useState(false);
  const [integr, setIntegr] = useState<Record<string, boolean>>({ "JazzCash / Easypaisa (payments)": true, "Stripe adapter": false, "SMS — JazzCloud": true, "Email — SMTP": true, "WhatsApp Business API": true, "Push (FCM)": true, "Biometric devices API": true, "GPS transport provider": false });

  return (
    <>
      <PageHead title="System & Releases" sub="Platform health, integrations, backups, feature flags and rollouts" />
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "health", label: "Health & Jobs", icon: "zap", count: app.db.jobs.filter((j) => j.status === "failed").length },
        { id: "integrations", label: "Integrations", icon: "link" },
        { id: "backups", label: "Backups", icon: "history" },
        { id: "releases", label: "Releases & Flags", icon: "sparkle" },
      ]} />

      <div className="mt-4">
        {tab === "health" && (
          <div className="anim-up space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {app.db.services.map((s) => (
                <div key={s.name} className={`rounded-xl border p-3.5 ${s.status === "operational" ? "border-line bg-surface" : s.status === "degraded" ? "border-warn/40 bg-warnsoft/50" : "border-danger/40 bg-dangersoft/50"}`}>
                  <p className="flex items-center gap-2 text-[12.5px] font-bold text-ink"><StatusDot tone={s.status === "operational" ? "ok" : s.status === "degraded" ? "warn" : "danger"} live={s.status !== "operational"} /> {s.name}</p>
                  <p className="mt-1 text-[10.5px] text-sub">uptime {s.uptime}{s.latency !== "—" ? ` · ${s.latency}` : ""}</p>
                </div>
              ))}
            </div>
            <Card pad={false} title="Background jobs" sub="Notification batches, challan generation, nightly backups">
              <Tbl head={["Job", "Tenant scope", "Attempts", "Last run", "Status", ""]}>
                {app.db.jobs.map((j) => (
                  <tr key={j.id} className="tbl-row">
                    <td className={`${tdCls} font-bold`}>{j.name}</td>
                    <td className={`${tdCls} text-sub`}>{j.tenant}</td>
                    <td className={`${tdCls} num`}>{j.attempts}</td>
                    <td className={`${tdCls} text-sub`}>{timeAgo(j.time)}</td>
                    <td className={tdCls}><Badge tone={j.status === "failed" ? "danger" : j.status === "running" ? "primary" : "neutral"}>{j.status.toUpperCase()}</Badge>{j.error && <span className="block text-[10px] text-danger">{j.error}</span>}</td>
                    <td className={tdCls}>{j.status === "failed" && <Btn v="subtle" sz="xs" icon="refresh" onClick={() => app.retryJob(j.id)}>Retry</Btn>}</td>
                  </tr>
                ))}
              </Tbl>
            </Card>
            <Card title="Maintenance mode" sub="Shows a branded maintenance page to all tenant portals">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-sub">{app.db.maintenanceMode ? <b className="text-warn">Currently ON</b> : "All portals serving normally."}</p>
                <Toggle on={app.db.maintenanceMode} onChange={(v) => { if (v) setMaintConfirm(true); else { app.setMaintenance(false); app.toast("Maintenance mode disabled", "info"); } }} />
              </div>
            </Card>
          </div>
        )}

        {tab === "integrations" && (
          <Card className="anim-up" title="Provider adapters" sub="Business logic is provider-agnostic — tenants pick providers, credentials stored encrypted">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {Object.entries(integr).map(([name, on]) => (
                <div key={name} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${on ? "border-ok/25 bg-oksoft/40" : "border-line bg-canvas/60"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${on ? "bg-ok text-white" : "bg-line text-sub"}`}><I n={name.includes("SMS") ? "phone" : name.includes("Email") ? "mail" : name.includes("WhatsApp") ? "wa" : name.includes("Push") ? "bell" : name.includes("GPS") ? "pin" : name.includes("Biometric") ? "key" : "card"} size={15} /></span>
                  <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">{name}</p><p className="text-[10.5px] text-sub">{on ? "Connected · healthy" : "Not configured"}</p></div>
                  <Toggle on={on} onChange={(v) => { setIntegr((prev) => ({ ...prev, [name]: v })); app.logOwnerAudit(`Integration ${v ? "enabled" : "disabled"}`, name, "Operator change"); app.toast(`${name} ${v ? "enabled" : "disabled"}`, "info"); }} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "backups" && (
          <Card className="anim-up" pad={false} title="Tenant backup status" sub="Encrypted at rest · restore is an elevated, reason-logged operation">
            <Tbl head={["Tenant", "Schedule", "Last successful", "Last failed", "Size", "Status", ""]}>
              {app.db.backups.map((b) => {
                const t = app.db.ownerTenants.find((x) => x.id === b.tenantId);
                return (
                  <tr key={b.tenantId} className="tbl-row">
                    <td className={`${tdCls} font-bold`}>{t?.name ?? b.tenantId}</td>
                    <td className={`${tdCls} text-sub`}>{b.schedule}</td>
                    <td className={`${tdCls} text-sub`}>{timeAgo(b.lastOk)}</td>
                    <td className={`${tdCls} ${b.lastFail ? "text-danger" : "text-sub"}`}>{b.lastFail ? timeAgo(b.lastFail) : "—"}</td>
                    <td className={`${tdCls} num`}>{b.sizeMb.toLocaleString()} MB</td>
                    <td className={tdCls}><Badge tone={b.status === "ok" ? "ok" : b.status === "failed" ? "danger" : "warn"}>{b.status.toUpperCase()}</Badge></td>
                    <td className={tdCls}><Btn v="subtle" sz="xs" icon="refresh" onClick={() => app.runBackup(b.tenantId)}>Backup now</Btn></td>
                  </tr>
                );
              })}
            </Tbl>
          </Card>
        )}

        {tab === "releases" && (
          <div className="anim-up grid gap-4 lg:grid-cols-2">
            <Card title="Release train" sub="Gradual rollout by plan, then tenant groups">
              <div className="space-y-3">
                {app.db.releases.map((r) => (
                  <div key={r.version} className="rounded-xl border border-line bg-canvas/60 p-3.5">
                    <div className="flex items-center gap-2">
                      <p className="num display text-[14px] font-bold text-ink">{r.version}</p>
                      <Badge tone={r.status === "stable" ? "ok" : r.status === "rolling" ? "accent" : "neutral"}>{r.status.toUpperCase()}</Badge>
                      <span className="ml-auto text-[10.5px] text-sub">{fmtDate(r.date)}</span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {r.notes.map((n) => <li key={n} className="flex items-start gap-1.5 text-[11.5px] text-sub"><I n="check" size={11} className="mt-0.5 shrink-0 text-ok" /> {n}</li>)}
                    </ul>
                    <div className="mt-2 flex items-center gap-2"><Progress pct={r.rollout} tone={r.rollout === 100 ? "ok" : "accent"} className="flex-1" /><span className="num text-[11px] font-bold text-sub">{r.rollout}%</span></div>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-4">
              <Card title="Feature flags" sub="Remote kill-switches for every risky feature">
                <div className="space-y-2.5">
                  {app.db.flags.map((f) => (
                    <div key={f.key} className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                      <div className="flex-1">
                        <p className="text-[12.5px] font-bold text-ink">{f.label} <span className="num text-[10px] font-medium text-sub">flag:{f.key}</span></p>
                        <p className="text-[10.5px] text-sub">{f.desc}{f.enabled ? ` · rolling at ${f.rollout}%` : ""}</p>
                      </div>
                      <Toggle on={f.enabled} onChange={() => app.toggleFlag(f.key)} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Emergency controls">
                <Btn v="danger" sz="sm" icon="power" onClick={() => setKillConfirm(true)}>Kill switch — disable all privileged sessions</Btn>
                <p className="mt-2 text-[10.5px] leading-relaxed text-sub">Immediately revokes every operator and owner-admin session platform-wide. Use only for a confirmed compromise. The event is broadcast to the security alert center.</p>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Confirm open={maintConfirm} onClose={() => setMaintConfirm(false)} onYes={() => { app.setMaintenance(true); app.toast("Maintenance mode ON — a banner now appears across every portal", "warn"); }} danger yesLabel="Enable maintenance"
        title="Enable maintenance mode?" body="All tenant portals will show the school-branded maintenance page. Support sessions and background jobs continue. This is logged as an elevated action." />
      <Confirm open={killConfirm} onClose={() => setKillConfirm(false)} onYes={() => { app.logOwnerAudit("Kill switch activated", "Platform-wide session revocation", "Suspected compromise drill", "elevated"); app.toast("All privileged sessions revoked platform-wide", "danger"); }} danger yesLabel="Revoke all sessions"
        title="Pull the kill switch?" body="Every operator and tenant-owner session is revoked immediately. Affected users must re-authenticate with 2FA. The action is written to the immutable audit log." />
    </>
  );
}

// ================= AUDIT & SECURITY =================
export function SecurityPage() {
  const app = useApp();
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState("all");
  const logs = useMemo(() => app.db.ownerAudit.filter((a) => {
    if (risk !== "all" && a.risk !== risk) return false;
    if (q && !(a.action + a.target + a.operator + a.reason).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [app.db.ownerAudit, q, risk]);

  return (
    <>
      <PageHead title="Audit & Security" sub="Append-only audit for every privileged action · internal operators · security events"
        actions={<Btn v="outline" sz="sm" icon="download" onClick={() => { downloadCSV("owner-audit-log", logs.map((a) => ({ time: a.time, operator: a.operator, action: a.action, target: a.target, reason: a.reason, risk: a.risk, outcome: a.outcome }))); app.toast("Audit log exported (CSV)"); }}>Export audit log</Btn>} />

      <div className="anim-up grid gap-4 lg:grid-cols-3">
        <Card title="Internal operators" sub="Role-based owner permissions" className="lg:col-span-2" pad={false}>
          <Tbl head={["Operator", "Role", "2FA", "Last active", "Status"]}>
            {app.db.operators.map((o) => (
              <tr key={o.id} className="tbl-row">
                <td className={tdCls}><b>{o.name}</b><span className="block text-[10.5px] text-sub">{o.email}</span></td>
                <td className={tdCls}><Badge tone={o.role === "Super Owner" ? "night" : "primary"}>{o.role}</Badge></td>
                <td className={tdCls}>{o.twoFA ? <Badge tone="ok"><I n="shield" size={10} /> ON</Badge> : <Badge tone="danger">OFF</Badge>}</td>
                <td className={`${tdCls} text-sub`}>{timeAgo(o.lastActive)}</td>
                <td className={tdCls}><Badge tone={o.status === "active" ? "ok" : "neutral"}>{o.status.toUpperCase()}</Badge></td>
              </tr>
            ))}
          </Tbl>
        </Card>
        <Card title="Security events" sub="Fraud & isolation engine">
          <div className="space-y-2">
            {app.db.securityEvents.map((e) => (
              <div key={e.id} className={`rounded-lg border p-2.5 ${e.severity === "critical" ? "border-danger/30 bg-dangersoft/50" : e.severity === "warn" ? "border-warn/30 bg-warnsoft/50" : "border-line bg-canvas/60"}`}>
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink"><StatusDot tone={e.severity === "critical" ? "danger" : e.severity === "warn" ? "warn" : "ok"} /> {e.type}</p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-sub">{e.detail}</p>
                <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-sub/70">{timeAgo(e.time)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="anim-up mt-4" pad={false} title="Audit log" sub={`${logs.length} entries — immutable, searchable, exportable`}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search action, target, operator…" className="w-full sm:w-72" />
          <Select value={risk} onChange={(e) => setRisk(e.target.value)} className="w-auto">
            <option value="all">All risk levels</option><option value="normal">Normal</option><option value="elevated">Elevated</option>
          </Select>
          <Badge tone="primary" className="ml-auto">{logs.length} entries</Badge>
        </div>
        <Tbl head={["Time", "Operator", "Action", "Target", "Reason", "Risk", "Outcome"]}>
          {logs.map((a) => (
            <tr key={a.id} className="tbl-row">
              <td className={`${tdCls} whitespace-nowrap text-sub`}>{timeAgo(a.time)}</td>
              <td className={`${tdCls} font-bold`}>{a.operator}</td>
              <td className={tdCls}><Badge tone={a.risk === "elevated" ? "danger" : "primary"}>{a.action}</Badge></td>
              <td className={`${tdCls} max-w-[190px] truncate`} title={a.target}>{a.target}</td>
              <td className={`${tdCls} max-w-[200px] truncate text-sub`} title={a.reason}>{a.reason}</td>
              <td className={tdCls}>{a.risk === "elevated" ? <Badge tone="danger">ELEVATED</Badge> : <Badge tone="neutral">normal</Badge>}</td>
              <td className={tdCls}><Badge tone={a.outcome === "success" ? "ok" : a.outcome === "blocked" ? "danger" : "warn"}>{a.outcome.toUpperCase()}</Badge></td>
            </tr>
          ))}
        </Tbl>
      </Card>
    </>
  );
}

// ================= SUPPORT DESK =================
export function SupportPage() {
  const app = useApp();
  const tenants = app.db.ownerTenants;
  const [, forceTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const fmtLeft = (exp: number) => {
    const s = Math.max(0, Math.floor((exp - Date.now()) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const active = app.db.supportSessions.filter((s) => s.active && s.expiresAt > Date.now());
  const expired = app.db.supportSessions.filter((s) => !s.active || s.expiresAt <= Date.now());

  return (
    <>
      <PageHead title="Support Desk" sub="Customer tickets, SLA and controlled support sessions"
        actions={<Btn v="outline" sz="sm" icon="download" onClick={() => { downloadCSV("support-tickets", app.db.tickets.map((t) => ({ ticket: t.no, customer: tenants.find((x) => x.id === t.tenantId)?.name ?? "", subject: t.subject, priority: t.priority, status: t.status, assignee: t.assignee ?? "" }))); app.toast("Ticket report exported"); }}>Export</Btn>} />

      {active.length > 0 && (
        <div className="anim-up mb-4 space-y-2">
          {active.map((s) => {
            const t = tenants.find((x) => x.id === s.tenantId);
            const left = s.expiresAt - Date.now();
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-warn/50 bg-warnsoft/60 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warn text-white"><I n="eye" size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">Live support session — {t?.name} <span className="font-normal text-sub">({s.readOnly ? "read-only" : "write"})</span></p>
                  <p className="truncate text-[11px] text-sub">{s.operator} · reason: {s.reason}</p>
                </div>
                <span className={`num display text-[20px] font-bold ${left < 120000 ? "text-danger" : "text-warn"}`}>{fmtLeft(s.expiresAt)}</span>
                <Btn v="danger" sz="sm" icon="x" onClick={() => app.endSupportSession(s.id)}>Terminate</Btn>
              </div>
            );
          })}
        </div>
      )}

      <div className="anim-up grid gap-4 lg:grid-cols-3">
        <Card title="Tickets" sub="From the customer helpdesk portal" className="lg:col-span-2" pad={false}>
          <Tbl head={["Ticket", "Customer", "Subject", "Priority", "Assignee", "Status", ""]}>
            {app.db.tickets.map((tk) => {
              const t = tenants.find((x) => x.id === tk.tenantId);
              return (
                <tr key={tk.id} className="tbl-row">
                  <td className={`${tdCls} num font-bold`}>{tk.no}</td>
                  <td className={tdCls}><b>{t?.name ?? "—"}</b><span className="block text-[10.5px] text-sub">{tk.from}</span></td>
                  <td className={`${tdCls} max-w-[220px]`}><span className="block font-medium leading-snug">{tk.subject}</span><span className="text-[10px] text-sub">{tk.category} · {fmtDate(tk.created)}</span></td>
                  <td className={tdCls}><Badge tone={tk.priority === "high" ? "danger" : tk.priority === "medium" ? "warn" : "neutral"}>{tk.priority.toUpperCase()}</Badge></td>
                  <td className={tdCls}>
                    <Select value={tk.assignee ?? ""} onChange={(e) => { app.set((d) => ({ ...d, tickets: d.tickets.map((x) => x.id === tk.id ? { ...x, assignee: e.target.value } : x) })); app.toast(`Ticket ${tk.no} assigned to ${e.target.value}`, "info"); }} className="w-32 px-2 py-1 text-[11.5px]">
                      <option value="">Unassigned</option>
                      {app.db.operators.filter((o) => o.status === "active").map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
                    </Select>
                  </td>
                  <td className={tdCls}>
                    <Select value={tk.status} onChange={(e) => { const v = e.target.value as "open" | "in-progress" | "resolved"; app.set((d) => ({ ...d, tickets: d.tickets.map((x) => x.id === tk.id ? { ...x, status: v } : x) })); app.toast(v === "resolved" ? `Ticket ${tk.no} resolved — customer notified` : `Ticket ${tk.no} → ${v}`, v === "resolved" ? "ok" : "info"); }} className={`w-32 px-2 py-1 text-[11.5px]`}>
                      <option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option>
                    </Select>
                  </td>
                  <td className={tdCls}><Btn v="ghost" sz="xs" icon="edit" onClick={() => { setNoteFor(tk.id); setNote(""); }}>Note</Btn></td>
                </tr>
              );
            })}
          </Tbl>
        </Card>

        <div className="space-y-4">
          <Card title="SLA performance" sub="Last 30 days">
            <HBars data={[
              { label: "First response < 4h", v: 91, tone: "var(--color-ok)", right: "91%" },
              { label: "Resolved < 24h", v: 84, tone: "var(--color-primary)", right: "84%" },
              { label: "CSAT score", v: 94, tone: "var(--color-accent)", right: "4.7 / 5" },
            ]} />
          </Card>
          <Card title="Session history" sub="Every impersonation — audited">
            {expired.length === 0 && active.length === 0 ? <p className="text-[12px] text-sub">No support sessions yet. Open one from a tenant's Support tab.</p> : (
              <div className="space-y-2">
                {expired.slice(0, 4).map((s) => {
                  const t = tenants.find((x) => x.id === s.tenantId);
                  return (
                    <div key={s.id} className="rounded-lg border border-line bg-canvas/60 px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink"><I n="history" size={11} className="text-sub" /> {t?.name}</p>
                      <p className="text-[10.5px] text-sub">{s.operator} · {s.readOnly ? "read-only" : "write"} · ended {timeAgo(new Date(Math.min(s.expiresAt, Date.now())).toISOString())}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={!!noteFor} onClose={() => setNoteFor(null)} title="Add internal note" sub="Visible to operators only"
        footer={<><Btn v="outline" onClick={() => setNoteFor(null)}>Cancel</Btn><Btn icon="check" onClick={() => { app.toast("Internal note added to ticket", "info"); setNoteFor(null); }}>Save note</Btn></>}>
        <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Diagnostic details, links, next steps…" />
      </Modal>
    </>
  );
}
