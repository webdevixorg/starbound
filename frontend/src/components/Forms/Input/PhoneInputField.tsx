import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <PhoneInput
        country="us"
        value={value}
        onChange={onChange}
        inputProps={{
          id,
          name: id,
          required: true,
        }}
        inputStyle={{
          width: "100%",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          padding: "10px 12px 10px 50px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
        buttonStyle={{
          borderRadius: "6px 0 0 6px",
          border: "1px solid #d1d5db",
        }}
      />
    </div>
  );
};

export default PhoneInputField;
