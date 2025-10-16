"use client";

import { NotificationSettings } from "@/components/notification-settings";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage real-time notifications and inventory alerts for Wan Ofi Pharmacy
          </p>
        </div>
        
        <NotificationSettings />
      </div>
    </div>
  );
}
