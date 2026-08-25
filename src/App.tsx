import { AppProvider, useApp } from "./store";
import { Shell } from "./components/shell";
import { I } from "./components/ui";
import Login from "./pages/Login";
import PublicSite from "./pages/PublicSite";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Exams from "./pages/Exams";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import HR from "./pages/HR";
import Operations from "./pages/Operations";
import Comms from "./pages/Comms";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import { OwnerDashboard, TenantsPage } from "./pages/OwnerPanel";
import { LicensesPage, BillingPage, SystemPage, SecurityPage, SupportPage } from "./pages/OwnerOps";

function Toasts() {
  const app = useApp();
  const meta = {
    ok: { icon: "check", cls: "bg-night text-canvas border-ok/60" },
    info: { icon: "info", cls: "bg-night text-canvas border-primary/50" },
    warn: { icon: "alert", cls: "bg-warnsoft text-warn border-warn/50" },
    danger: { icon: "alert", cls: "bg-dangersoft text-danger border-danger/50" },
  } as const;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2">
      {app.toasts.map((t) => {
        const m = meta[t.kind];
        return (
          <div key={t.id} className={`anim-slide pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg ${m.cls}`}>
            <span className="mt-0.5 shrink-0"><I n={m.icon} size={15} /></span>
            <p className="flex-1 text-[12.5px] font-medium leading-snug">{t.msg}</p>
            <button onClick={() => app.dismissToast(t.id)} className="shrink-0 opacity-60 transition hover:opacity-100"><I n="x" size={13} /></button>
          </div>
        );
      })}
    </div>
  );
}

function Router() {
  const app = useApp();
  const id = app.nav.id;
  const pages: Record<string, React.ReactNode> = {
    login: <Login />,
    website: <PublicSite />,
    dashboard: <Dashboard />,
    students: <Students />,
    attendance: <Attendance />,
    fees: <Fees />,
    exams: <Exams />,
    academics: <Academics />,
    admissions: <Admissions />,
    hr: <HR />,
    ops: <Operations />,
    comms: <Comms />,
    settings: <Settings />,
    reports: <Reports />,
    ownerDash: <OwnerDashboard />,
    tenants: <TenantsPage />,
    licenses: <LicensesPage />,
    billing: <BillingPage />,
    system: <SystemPage />,
    security: <SecurityPage />,
    support: <SupportPage />,
  };
  const page = pages[id] ?? <Login />;
  const bare = id === "login" || id === "website";
  const paramKey = JSON.stringify(app.nav.params ?? {});
  return (
    <>
      {bare ? page : <Shell key={`${id}-${paramKey}`}>{page}</Shell>}
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
