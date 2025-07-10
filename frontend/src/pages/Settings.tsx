import React, { useState, useEffect } from 'react';
import { updateAccountSettings, fetchAccountSettings } from '../services/api';

import BasicInfoTab from '../components/PageComponents/AccountTabs/ChangePassword';
import AccountSecurityTab from '../components/PageComponents/AccountTabs/AccountSecurityTab';
import PreferencesTab from '../components/PageComponents/AccountTabs/PreferencesTab';
import PaymentMethodsTab from '../components/PageComponents/AccountTabs/PaymentMethodsTab';
import NotificationsTab from '../components/PageComponents/AccountTabs/NotificationsTab';
import TabsNavigation from '../components/PageComponents/AccountTabs/TabsNavigation';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    username: '',
    twoFactorSMS: false,
    twoFactorTOTP: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic-info');

  useEffect(() => {
    const getAccountSettings = async () => {
      try {
        const data = await fetchAccountSettings();
        setFormData({
          email: data.email,
          current_password: '',
          new_password: '',
          confirm_password: '',
          username: data.username,
          twoFactorSMS: data.twoFactorSMS,
          twoFactorTOTP: data.twoFactorTOTP,
        });
      } catch (error) {
        setError('Error fetching account settings');
        console.error('Error fetching account settings', error);
      } finally {
        setLoading(false);
      }
    };

    getAccountSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateAccountSettings(formData);
      alert('Account settings updated successfully');
    } catch (error: any) {
      setError('Error updating account settings');
      console.error('Error updating account settings', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return (
          <BasicInfoTab
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        );
      case 'account-security':
        return (
          <AccountSecurityTab
            formData={formData}
            handleSwitchChange={handleSwitchChange}
          />
        );
      case 'preferences':
        return <PreferencesTab />;
      case 'payment-methods':
        return <PaymentMethodsTab />;
      case 'notifications':
        return <NotificationsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-semibold mb-4 px-4">Settings</h2>
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-[600px] px-4 "> {renderContent()}</div>
    </div>
  );
};

export default Settings;
