import React from "react";
import { useApp } from "../../store";
import { Card, StatCard, Badge, Button } from "../../components/ui";

export default function DeveloperDashboard() {
  const app = useApp();
  const dev = app.developer;

  const stats = [
    { label: "Total Tenants", value: dev.tenants.length, color: "blue" },
    { label: "Active", value: dev.tenants.filter(t => t.status === "active").length, color: "green" },
    { label: "Trials", value: dev.tenants.filter(t => t.licenseType === "trial").length, color: "yellow" },
    { label: "Expired", value: dev.tenants.filter(t => t.status === "expired").length, color: "red" },
    { label: "Suspended", value: dev.tenants.filter(t => t.status === "suspended").length, color: "gray" },
    { label: "Monthly Revenue", value: `Rs ${dev.revenue.monthly.toLocaleString()}`, color: "green" },
    { label: "Annual Revenue", value: `Rs ${dev.revenue.annual.toLocaleString()}`, color: "green" },
    { label: "Pending Renewals", value: dev.renewalsDue.length, color: "orange" },
  ];

  const recentTenants = dev.tenants.slice(0, 5);
  const alerts = dev.alerts.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
        <Button onClick={() => app.go("developer-tenants")}>Manage Tenants</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={String(stat.value)} color={stat.color as any} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <Card title="Recent Tenants">
          <div className="space-y-3">
            {recentTenants.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.code} · {t.institutionType}</p>
                </div>
                <Badge color={
                  t.status === "active" ? "green" :
                  t.status === "trial" ? "yellow" :
                  t.status === "expired" ? "red" : "gray"
                }>
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card title="System Alerts">
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map(a => (
              <div key={a.id} className={`p-3 rounded-lg ${a.type === "error" ? "bg-red-50" : "bg-yellow-50"}`}>
                <p className="font-medium text-sm">{a.message}</p>
                <p className="text-xs text-gray-500">{a.ts}</p>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No active alerts</p>
            )}
          </div>
        </Card>

        {/* Module Usage */}
        <Card title="Module Adoption Across Tenants">
          <div className="space-y-2">
            {Object.entries(dev.moduleUsage).map(([module, count]) => (
              <div key={module} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 capitalize">{module.replace(/-/g, " ")}</span>
                <Badge color="blue">{count} tenants</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Trial Conversions */}
        <Card title="Trial Conversion Summary">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Trials</span>
              <span className="font-medium">{dev.trials.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Converted to Paid</span>
              <span className="font-medium text-green-600">{dev.trials.converted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-medium">{Math.round((dev.trials.converted / dev.trials.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${(dev.trials.converted / dev.trials.total) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
