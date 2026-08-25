import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";

export default function DeveloperSettings() {
  const app = useApp();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Developer Panel Settings</h1>

      <Card title="System Configuration">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Trial Duration (days)</label>
            <select className="w-full px-3 py-2 border border-line rounded-md text-sm">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30" selected>30 days</option>
              <option value="60">60 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Grace Period (days)</label>
            <select className="w-full px-3 py-2 border border-line rounded-md text-sm">
              <option value="3">3 days</option>
              <option value="7" selected>7 days</option>
              <option value="14">14 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
            <select className="w-full px-3 py-2 border border-line rounded-md text-sm">
              <option>Standard (8+ chars)</option>
              <option selected>Strong (12+ chars, special chars)</option>
              <option>Enterprise (16+ chars, MFA required)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-suspend After Overdue (days)</label>
            <select className="w-full px-3 py-2 border border-line rounded-md text-sm">
              <option value="7">7 days</option>
              <option value="15" selected>15 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={() => app.toast("Settings saved")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep">Save Changes</button>
        </div>
      </Card>

      <Card title="Feature Flags">
        <div className="space-y-3">
          {[
            { name: "AI-powered analytics", enabled: false },
            { name: "WhatsApp Business integration", enabled: true },
            { name: "Biometric attendance", enabled: false },
            { name: "Mobile app access", enabled: true },
            { name: "Custom domain support", enabled: true },
            { name: "Advanced reporting module", enabled: false },
          ].map(flag => (
            <div key={flag.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{flag.name}</span>
              <button 
                onClick={() => app.toast(`Feature "${flag.name}" ${flag.enabled ? "disabled" : "enabled"}`)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${flag.enabled ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
              >
                {flag.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Global Notifications">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">System-wide Announcement</label>
            <textarea 
              placeholder="Enter announcement to send to all tenants..."
              rows={3}
              className="w-full px-3 py-2 border border-line rounded-md text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => app.toast("Announcement sent to all tenants")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep">Send to All</button>
            <button onClick={() => app.toast("Announcement scheduled")} className="px-4 py-2 border rounded-md hover:bg-gray-50">Schedule</button>
          </div>
        </div>
      </Card>

      <Card title="Maintenance Mode">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Enable maintenance mode for all tenants</p>
            <p className="text-sm text-gray-500">Tenants will see a maintenance page and won't be able to access the system</p>
          </div>
          <button onClick={() => app.toast("Maintenance mode toggled")} className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100">
            Toggle Maintenance
          </button>
        </div>
      </Card>

      <Card title="API & Integration Settings">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Payment Gateway (Stripe/PayPal)</p>
              <p className="text-sm text-gray-500">Status: Connected</p>
            </div>
            <button onClick={() => app.toast("Payment gateway settings opened")} className="px-3 py-1.5 text-sm border rounded hover:bg-white">Configure</button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">SMS Provider (Twilio)</p>
              <p className="text-sm text-gray-500">Status: Connected</p>
            </div>
            <button onClick={() => app.toast("SMS provider settings opened")} className="px-3 py-1.5 text-sm border rounded hover:bg-white">Configure</button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Email Service (SendGrid)</p>
              <p className="text-sm text-gray-500">Status: Connected</p>
            </div>
            <button onClick={() => app.toast("Email service settings opened")} className="px-3 py-1.5 text-sm border rounded hover:bg-white">Configure</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
