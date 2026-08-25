import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";
import * as S from "../../data/seed";

export default function DeveloperLicenses() {
  const app = useApp();
  const dev = app.developer;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
        <button onClick={() => app.toast("Create license wizard coming soon")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Create License
        </button>
      </div>

      <div className="grid gap-4">
        {dev.tenants.map(tenant => (
          <Card key={tenant.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold">{tenant.name}</h3>
                  <Badge color={tenant.license?.status === "active" ? "green" : tenant.license?.status === "expired" ? "red" : "yellow"}>
                    {tenant.license?.status || "N/A"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">License Type:</span>
                    <span className="ml-2 font-medium capitalize">{tenant.license?.type || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <span className="ml-2 font-medium">{tenant.license?.startDate ? new Date(tenant.license.startDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">End Date:</span>
                    <span className="ml-2 font-medium">{tenant.license?.endDate ? new Date(tenant.license.endDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 font-medium">{S.DEVELOPER_PLANS.find(p => p.id === tenant.license?.planId)?.name || "Custom"}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button onClick={() => app.toast(`Extended trial for ${tenant.name}`)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Extend Trial</button>
                  <button onClick={() => app.toast(`License renewed for ${tenant.name}`)} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">Renew</button>
                  <button onClick={() => app.toast(`License suspended for ${tenant.name}`)} className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">Suspend</button>
                  <button onClick={() => app.toast(`License revoked for ${tenant.name}`)} className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">Revoke</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
