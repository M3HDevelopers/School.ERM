import React from "react";
import { useApp } from "../store";
import { OwnerProvider, useOwner } from "./store";
import { OwnerShell } from "./Shell";
import OwnerDashboard from "./Dashboard";
import Tenants from "./Tenants";
import Commercial from "./Commercial";
import Ops from "./Ops";
import Support from "./Support";
import { I } from "../components/ui";

function PageSwitch() {
  const o = useOwner();
  const school = useApp();
  switch (o.page) {
    case "tenants": return <Tenants />;
    case "commercial": return <Commercial />;
    case "ops": return <Ops />;
    case "support": return <Support />;
    default: return <OwnerDashboard />;
  }
}

function Frame() {
  const school = useApp();
  return (
    <div className="relative">
      <OwnerShell>
        <PageSwitch />
      </OwnerShell>
      {/* back to school ERP */}
      <button onClick={() => school.logout()}
        className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-[12px] font-bold text-ink shadow-xl transition hover:border-[#0b1420]/40 hover:shadow-2xl">
        <I n="logout" size={14} className="text-[#e8a226]" /> Exit control plane
      </button>
    </div>
  );
}

export default function OwnerRoot() {
  const school = useApp();
  const name = school.session?.name ?? "Operator";
  const role = school.session?.title ?? "Operator";
  return (
    <OwnerProvider operator={name} operatorRole={role.split("·")[0].trim()}>
      <Frame />
    </OwnerProvider>
  );
}
