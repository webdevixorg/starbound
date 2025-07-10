import React, { useState, ChangeEvent } from 'react';

const PreferencesTab: React.FC = () => {
  const [formData, setFormData] = useState({
    preferred_language: 'English',
    theme: 'light',
    notifications: true,
    text_size: 'medium',
    additional_notes: '',
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form data
    console.log('Website Preferences Submitted:', formData);
  };

  return (
    <>
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Preferences</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="preferred_language"
          >
            Preferred Language
          </label>
          <select
            id="preferred_language"
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
        <div className="mb-4">
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
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div className="mb-4 flex items-center">
          <input
            id="notifications"
            name="notifications"
            type="checkbox"
            checked={formData.notifications}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label
            className="ml-2 block text-gray-700 font-semibold"
            htmlFor="notifications"
          >
            Enable Notifications
          </label>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="text_size"
          >
            Text Size
          </label>
          <select
            id="text_size"
            name="text_size"
            value={formData.text_size}
            onChange={handleChange}
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-semibold mb-2"
            htmlFor="additional_notes"
          >
            Additional Notes
          </label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            value={formData.additional_notes}
            onChange={handleChange}
            rows={4}
            className="form-textarea mt-1 block w-full border border-gray-300 rounded-md p-2 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </>
  );
};

export default PreferencesTab;
