import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperPayments() {
  const app = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Records</h1>
        <button onClick={() => app.toast("Record payment wizard coming soon")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Record Payment
        </button>
      </div>

      <Card title="Recent Payments">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Receipt #</th>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { receipt: "RCP-001", tenant: "Dar-e-Ilm Academy", amount: 9999, method: "bank", date: "2024-02-01" },
                { receipt: "RCP-002", tenant: "Modern College of Sciences", amount: 24999, method: "online", date: "2024-01-28" },
                { receipt: "RCP-003", tenant: "Starlight School System", amount: 4999, method: "cash", date: "2024-01-25" },
              ].map(pay => (
                <tr key={pay.receipt} className="border-b last:border-0">
                  <td className="py-3 font-medium">{pay.receipt}</td>
                  <td className="py-3">{pay.tenant}</td>
                  <td className="py-3">Rs {pay.amount.toLocaleString()}</td>
                  <td className="py-3 capitalize"><Badge color="blue">{pay.method}</Badge></td>
                  <td className="py-3">{new Date(pay.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button onClick={() => app.toast(`View receipt ${pay.receipt}`)} className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
