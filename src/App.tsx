import React from "react";
import { AppProvider, useApp } from "./store";
import { AppShell } from "./components/shell";
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
import DeveloperDashboard from "./pages/developer/Dashboard";

function Screen() {
  const app = useApp();
  const p = app.nav.page;

  if (p === "site") return <PublicSite />;
  if (p === "login" || !app.session) return <Login />;

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    students: <Students />,
    attendance: <Attendance />,
    fees: <Fees />,
    exams: <Exams />,
    timetable: <Academics />,
    admissions: <Admissions />,
    hr: <HR />,
    operations: <Operations />,
    comms: <Comms />,
    reports: <Reports />,
    settings: <Settings />,
    "developer-dashboard": <DeveloperDashboard />,
  };

  return <AppShell>{pages[p] ?? <Dashboard />}</AppShell>;
}

export default function App() {
  return (
    <AppProvider>
      <Screen />
    </AppProvider>
  );
}
