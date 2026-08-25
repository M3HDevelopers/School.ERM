import React from "react";
import { useApp } from "../../store";
import { Card, StatCard, Badge, Btn, I } from "../../components/ui";
import * as S from "../../data/seed";

export default function DeveloperTenants() {
  const app = useApp();
  const dev = app.developer;
  const [filter, setFilter] = React.useState<"all" | "active" | "trial" | "expired" | "suspended">("all");
  const [search, setSearch] = React.useState("");
  const [selectedTenant, setSelectedTenant] = React.useState<S.Tenant | null>(null);

  const filtered = dev.tenants.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
        <button onClick={() => app.toast("Create tenant wizard coming soon")} className="px-4 py-2 bg-primary text-side rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Add School
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input 
          type="text" 
          placeholder="Search by name or code..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-line rounded-md text-sm"
        />
        {(["all", "active", "trial", "expired", "suspended"] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${filter === status ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tenant List */}
      <div className="grid gap-4">
        {filtered.map(tenant => (
          <Card key={tenant.id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{tenant.name}</h3>
                  <Badge color={
                    tenant.status === "active" ? "green" :
                    tenant.status === "trial" ? "yellow" :
                    tenant.status === "expired" ? "red" :
                    tenant.status === "suspended" ? "gray" : "blue"
                  }>
                    {tenant.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{tenant.code}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{tenant.institutionType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 font-medium">{S.DEVELOPER_PLANS.find(p => p.id === tenant.license?.planId)?.name || "Custom"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Students:</span>
                    <span className="ml-2 font-medium">{tenant.usage.students}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Active:</span>
                    <span className="ml-2 font-medium">{new Date(tenant.usage.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button onClick={() => setSelectedTenant(tenant)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">View Details</button>
                  {tenant.status === "active" && (
                    <button onClick={() => { app.go("developer-licenses"); app.toast(`Managing license for ${tenant.name}`); }} className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100">Manage License</button>
                  )}
                  {tenant.status !== "suspended" && tenant.status !== "expired" && (
                    <button onClick={() => { app.toast(`Tenant ${tenant.name} suspended`); }} className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">Suspend</button>
                  )}
                  {(tenant.status === "suspended" || tenant.status === "expired") && (
                    <button onClick={() => { app.toast(`Tenant ${tenant.name} reactivated`); }} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">Reactivate</button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedTenant(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedTenant.name}</h2>
                <button onClick={() => setSelectedTenant(null)} className="text-gray-500 hover:text-gray-700"><I n="close" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Account Code</label>
                  <p className="font-medium">{selectedTenant.code}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Number</label>
                  <p className="font-medium">{selectedTenant.accountNo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Institution Type</label>
                  <p className="font-medium capitalize">{selectedTenant.institutionType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Country</label>
                  <p className="font-medium">{selectedTenant.country}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <Badge color={
                    selectedTenant.status === "active" ? "green" :
                    selectedTenant.status === "trial" ? "yellow" :
                    selectedTenant.status === "expired" ? "red" : "gray"
                  }>
                    {selectedTenant.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Created At</label>
                  <p className="font-medium">{new Date(selectedTenant.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Primary Owner</h3>
                {selectedTenant.owners[0] && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedTenant.owners[0].name}</p>
                    <p className="text-sm text-gray-600">{selectedTenant.owners[0].designation}</p>
                    <p className="text-sm text-gray-600">{selectedTenant.owners[0].email}</p>
                    <p className="text-sm text-gray-600">{selectedTenant.owners[0].phone}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold mb-2">License Details</h3>
                {selectedTenant.license && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedTenant.license.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{selectedTenant.license.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date(selectedTenant.license.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">End Date:</span>
                      <span className="font-medium">{new Date(selectedTenant.license.endDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Modules Enabled:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTenant.license.modulesEnabled.map(m => (
                          <Badge key={m} color="blue" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold mb-2">Usage Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-2xl font-bold">{selectedTenant.usage.students}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Users</p>
                    <p className="text-2xl font-bold">{selectedTenant.usage.users}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold">{Math.round(selectedTenant.usage.storageUsedMB / 1024)} GB</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">API Calls (Month)</p>
                    <p className="text-2xl font-bold">{selectedTenant.usage.apiCallsThisMonth.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setSelectedTenant(null)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
              <button onClick={() => { app.go("developer-impersonation"); setSelectedTenant(null); }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep">Impersonate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
