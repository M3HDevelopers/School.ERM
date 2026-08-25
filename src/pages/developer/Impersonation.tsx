import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperImpersonation() {
  const app = useApp();
  const dev = app.developer;
  const [reason, setReason] = React.useState("");
  const [selectedTenant, setSelectedTenant] = React.useState("");

  const handleImpersonate = () => {
    if (!selectedTenant || !reason) {
      app.toast("Please select tenant and provide reason", "danger");
      return;
    }
    app.toast(`Impersonation started for ${dev.tenants.find(t => t.id === selectedTenant)?.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
          <I n="warning" size={20} /> Security Notice
        </h2>
        <p className="text-sm text-yellow-700">
          Impersonation allows you to access a tenant's account for support purposes. All actions are logged and audited. 
          You must provide a valid reason before starting an impersonation session.
        </p>
      </div>

      <Card title="Start Impersonation Session">
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-md text-sm"
            >
              <option value="">-- Select a tenant --</option>
              {dev.tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Access</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you need to access this tenant's account..."
              rows={4}
              className="w-full px-3 py-2 border border-line rounded-md text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleImpersonate}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition"
            >
              Start Session
            </button>
            <button 
              onClick={() => { setReason(""); setSelectedTenant(""); }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </Card>

      <Card title="Active Sessions">
        {dev.supportSessions.filter(s => s.status === "active").length > 0 ? (
          <div className="space-y-3">
            {dev.supportSessions.filter(s => s.status === "active").map(session => (
              <div key={session.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.targetTenantName}</p>
                  <p className="text-sm text-gray-600">Operator: {session.operatorName} · Reason: {session.reason}</p>
                </div>
                <button onClick={() => app.toast(`Session ${session.id} terminated`)} className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">
                  Terminate
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active impersonation sessions</p>
        )}
      </Card>

      <Card title="Recent Sessions">
        <div className="space-y-3">
          {dev.supportSessions.slice(0, 5).map(session => (
            <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{session.targetTenantName}</p>
                <p className="text-sm text-gray-600">{session.operatorName} · {new Date(session.startTime).toLocaleString()}</p>
              </div>
              <Badge color={session.status === "completed" ? "green" : "gray"}>{session.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
