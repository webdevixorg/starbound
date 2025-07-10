import React, { useState } from 'react';
import Switch from '../../Forms/Input/Switch';

const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    orderUpdates: true,
  });

  const handleSwitchChange = (name: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [name]: value,
    });
  };

  return (
    <>
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h3>
      <div className="mb-4">
        <Switch
          id="emailNotifications"
          name="emailNotifications"
          label="Email Notifications"
          checked={notifications.emailNotifications}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive notifications via email.
        </p>
      </div>
      <div className="mb-4">
        <Switch
          id="smsNotifications"
          name="smsNotifications"
          label="SMS Notifications"
          checked={notifications.smsNotifications}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive notifications via SMS.
        </p>
      </div>
      <div className="mb-4">
        <Switch
          id="pushNotifications"
          name="pushNotifications"
          label="Push Notifications"
          checked={notifications.pushNotifications}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive notifications via push notifications.
        </p>
      </div>
      <div className="mb-4">
        <Switch
          id="marketingEmails"
          name="marketingEmails"
          label="Marketing Emails"
          checked={notifications.marketingEmails}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive marketing and promotional emails.
        </p>
      </div>
      <div className="mb-4">
        <Switch
          id="securityAlerts"
          name="securityAlerts"
          label="Security Alerts"
          checked={notifications.securityAlerts}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive security alerts and notifications.
        </p>
      </div>
      <div className="mb-4">
        <Switch
          id="orderUpdates"
          name="orderUpdates"
          label="Order Updates"
          checked={notifications.orderUpdates}
          onChange={handleSwitchChange}
          icon={undefined}
        />
        <p className="text-gray-500 text-sm mt-2">
          Receive updates on your orders and activities.
        </p>
      </div>
    </>
  );
};

export default NotificationsTab;
