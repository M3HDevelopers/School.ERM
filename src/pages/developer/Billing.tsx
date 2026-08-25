import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperBilling() {
  const app = useApp();
  const dev = app.developer;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
        <button onClick={() => app.toast("Create invoice wizard coming soon")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Create Invoice
        </button>
      </div>

      <Card title="Recent Invoices">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Invoice #</th>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Due Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: "INV-2024-001", tenant: "Dar-e-Ilm Academy", amount: 9999, status: "paid", due: "2024-02-01" },
                { no: "INV-2024-002", tenant: "Knowledge Point School", amount: 4999, status: "pending", due: "2024-02-15" },
                { no: "INV-2024-003", tenant: "Modern College of Sciences", amount: 24999, status: "overdue", due: "2024-01-20" },
              ].map(inv => (
                <tr key={inv.no} className="border-b last:border-0">
                  <td className="py-3 font-medium">{inv.no}</td>
                  <td className="py-3">{inv.tenant}</td>
                  <td className="py-3">Rs {inv.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge color={inv.status === "paid" ? "green" : inv.status === "overdue" ? "red" : "yellow"}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3">{new Date(inv.due).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button onClick={() => app.toast(`View invoice ${inv.no}`)} className="text-blue-600 hover:underline mr-2">View</button>
                    {inv.status !== "paid" && (
                      <button onClick={() => app.toast(`Payment recorded for ${inv.no}`)} className="text-green-600 hover:underline">Mark Paid</button>
                    )}
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
