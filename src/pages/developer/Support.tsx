import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperSupport() {
  const app = useApp();
  const dev = app.developer;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <button onClick={() => app.toast("Create ticket wizard coming soon")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Create Ticket
        </button>
      </div>

      <div className="grid gap-4">
        {dev.supportSessions.length > 0 ? dev.supportSessions.map(session => (
          <Card key={session.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold">{session.targetTenantName}</h3>
                  <Badge color={session.status === "active" ? "green" : session.status === "completed" ? "blue" : "gray"}>
                    {session.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Reason: {session.reason}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Operator: {session.operatorName}</span>
                  <span>Started: {new Date(session.startTime).toLocaleString()}</span>
                  {session.endTime && <span>Ended: {new Date(session.endTime).toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {session.status === "active" && (
                  <button onClick={() => app.toast(`Session ${session.id} terminated`)} className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">End Session</button>
                )}
                <button onClick={() => app.toast(`View audit report for ${session.id}`)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Audit Report</button>
              </div>
            </div>
          </Card>
        )) : (
          <Card className="p-8 text-center text-gray-500">
            <I n="help" size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No active support sessions</p>
          </Card>
        )}
      </div>

      <Card title="Open Tickets">
        <div className="space-y-3">
          {[
            { id: "TKT-001", tenant: "Dar-e-Ilm Academy", subject: "Payment integration issue", priority: "high", status: "open" },
            { id: "TKT-002", tenant: "Knowledge Point School", subject: "Feature request: Custom reports", priority: "medium", status: "in-progress" },
            { id: "TKT-003", tenant: "Starlight School System", subject: "Login issues after suspension", priority: "high", status: "open" },
          ].map(ticket => (
            <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-sm text-gray-500">{ticket.tenant} · {ticket.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={ticket.priority === "high" ? "red" : ticket.priority === "medium" ? "yellow" : "blue"}>
                  {ticket.priority}
                </Badge>
                <button onClick={() => app.toast(`Working on ticket ${ticket.id}`)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Respond</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
