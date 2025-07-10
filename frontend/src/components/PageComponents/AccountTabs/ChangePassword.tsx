import React from 'react';
import TextInput from '../../Forms/Input/TextInput';

interface Props {
  formData: {
    email: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
    username: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const BasicInfoTab: React.FC<Props> = ({
  formData,
  handleChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="current_password"
        >
          Current Password
        </label>
        <TextInput
          id="current_password"
          name="current_password"
          type="password"
          value={formData.current_password}
          onChange={handleChange}
          label={''}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="new_password"
        >
          New Password
        </label>
        <TextInput
          id="new_password"
          name="new_password"
          type="password"
          value={formData.new_password}
          onChange={handleChange}
          label={''}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-semibold mb-2"
          htmlFor="confirm_password"
        >
          Confirm Password
        </label>
        <TextInput
          id="confirm_password"
          name="confirm_password"
          type="password"
          value={formData.confirm_password}
          onChange={handleChange}
          label={''}
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default BasicInfoTab;
