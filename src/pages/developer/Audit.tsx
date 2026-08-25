import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperAudit() {
  const app = useApp();
  const dev = app.developer;
  const [filter, setFilter] = React.useState("");

  const filteredLogs = dev.auditLogs.filter(log => {
    if (!filter) return true;
    return log.action.toLowerCase().includes(filter.toLowerCase()) || 
           log.targetTenant?.toLowerCase().includes(filter.toLowerCase()) ||
           log.operator.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-line rounded-md text-sm"
          />
          <button onClick={() => app.toast("Audit logs exported")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
            <I n="download" size={16} /> Export
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Operator</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Target Tenant</th>
                <th className="pb-3 font-medium">Details</th>
                <th className="pb-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 50).map(log => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3">{log.operator}</td>
                  <td className="py-3">
                    <Badge color={
                      log.action.includes("suspended") || log.action.includes("revoked") ? "red" :
                      log.action.includes("created") || log.action.includes("activated") ? "green" :
                      log.action.includes("impersonation") ? "yellow" : "blue"
                    }>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3">{log.targetTenant || "—"}</td>
                  <td className="py-3 text-gray-600 max-w-md truncate">{log.details}</td>
                  <td className="py-3 font-mono text-xs">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <I n="shield" size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No audit logs found</p>
          </div>
        )}
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">Audit Log Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All critical actions are logged with timestamp, operator, and IP address</li>
          <li>• Impersonation sessions are tracked with start/end times and reasons</li>
          <li>• License changes, suspensions, and revocations are recorded</li>
          <li>• Logs are immutable and cannot be deleted</li>
          <li>• Export functionality available for compliance reporting</li>
        </ul>
      </div>
    </div>
  );
}
