import React, { useState, useEffect } from 'react';
import {
  PreferenceSettings,
  fetchPreferenceSettings,
  updatePreferenceSettings,
} from '@/services/api';

interface Props {
  onSettingsChange?: (hasChanges: boolean) => void;
}

const PreferencesTab: React.FC<Props> = ({ onSettingsChange }) => {
  const [formData, setFormData] = useState<PreferenceSettings>({
    language: 'en',
    theme: 'light',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  const [initialData, setInitialData] = useState<PreferenceSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (initialData && onSettingsChange) {
      const hasChanges =
        JSON.stringify(formData) !== JSON.stringify(initialData);
      onSettingsChange(hasChanges);
    }
  }, [formData, initialData, onSettingsChange]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await fetchPreferenceSettings();
      setFormData(preferences);
      setInitialData(preferences);
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      await updatePreferenceSettings(formData);
      setInitialData(formData);

      // Show success message or handle success
      console.log('Preferences updated successfully');
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Preferences</h3>
      <p className="text-gray-600 mb-6">
        Customize your experience with language, theme, and display preferences.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="language"
          >
            Preferred Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="theme"
          >
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="timezone"
          >
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Europe/Berlin">Berlin (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
          </select>
        </div>

        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="dateFormat"
          >
            Date Format
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
            <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2023)</option>
          </select>
        </div>

        <div>
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="currency"
          >
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
            <option value="CNY">CNY (¥)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 backdrop-blur-sm"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="animate-pulse">Saving...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default PreferencesTab;
