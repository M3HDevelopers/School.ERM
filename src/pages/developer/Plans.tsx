import React from "react";
import { useApp } from "../../store";
import { Card, Badge, I } from "../../components/ui";
import * as S from "../../data/seed";

export default function DeveloperPlans() {
  const app = useApp();
  const plans = S.DEVELOPER_PLANS;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <button onClick={() => app.toast("Create plan wizard coming soon")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primarydeep transition flex items-center gap-2">
          <I n="plus" size={16} /> Create Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                Rs {plan.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">/{plan.billingInterval}</span>
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Users</span>
                <span className="font-medium">{plan.userLimit === -1 ? "Unlimited" : plan.userLimit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Students</span>
                <span className="font-medium">{plan.studentLimit === -1 ? "Unlimited" : plan.studentLimit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Campuses</span>
                <span className="font-medium">{plan.campusLimit === -1 ? "Unlimited" : plan.campusLimit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Storage</span>
                <span className="font-medium">{plan.storageGB} GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Support</span>
                <span className="font-medium capitalize">{plan.supportLevel}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Modules Included:</h4>
              <div className="flex flex-wrap gap-1">
                {plan.modules.length === 1 && plan.modules[0] === "all" ? (
                  <Badge color="green">All Modules</Badge>
                ) : (
                  plan.modules.slice(0, 5).map(m => (
                    <Badge key={m} color="blue" className="text-xs">{m}</Badge>
                  ))
                )}
                {plan.modules.length > 5 && <span className="text-xs text-gray-500">+{plan.modules.length - 5} more</span>}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => app.toast(`Plan ${plan.name} cloned`)} className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-50">Clone</button>
              <button onClick={() => app.toast(`Plan ${plan.name} archived`)} className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-50">Archive</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
