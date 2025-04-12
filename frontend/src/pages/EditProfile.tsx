import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '../services/api';

import TextInput from '../components/Forms/Input/TextInput';
import PhoneInputField from '../components/Forms/Input/PhoneInputField';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    image: '' as string | File,
    phone: '',
    address: '',
    city: '',
    region: '',
    postal_code: '',
    country: '',
    date_of_birth: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchProfile();
        setFormData({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          bio: data.bio,
          image: data.image,
          phone: data.phone,
          address: data.address,
          city: data.city,
          region: data.region,
          postal_code: data.postal_code,
          country: data.country,
          date_of_birth: data.date_of_birth,
        });

        if (typeof data.image === 'string') {
          setImagePreview(data.image);
        } else if (data.image instanceof File) {
          setImagePreview(URL.createObjectURL(data.image));
        } else {
          setImagePreview('');
        }
      } catch (error) {
        setError('Error fetching profile');
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData({
      ...formData,
      phone: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'first_name' || key === 'last_name') {
        updatedData.append(`user.${key}`, value as string);
      } else {
        updatedData.append(key, value as string);
      }
    });

    try {
      await updateProfile(updatedData);
      alert('Profile updated successfully');
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="edit-profile-container bg-white dark:bg-gray-900 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Profile</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center">
            <img
              src={imagePreview || 'https://via.placeholder.com/150'}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover mr-4"
            />
            <div className="flex items-center space-x-2">
              <label
                htmlFor="image"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                <i className="fas fa-camera mr-2"></i> Change picture
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setImagePreview('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <i className="fas fa-trash mr-2"></i> Delete picture
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TextInput
            id="first_name"
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <TextInput
            id="last_name"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
          <TextInput
            id="date_of_birth"
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
          <PhoneInputField
            id="phone"
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>

        <h3 className="text-xl font-semibold mb-4">Personal Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          <TextInput
            id="address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TextInput
            id="city"
            name="city"
            label="City"
            value={formData.city}
            onChange={handleChange}
          />
          <TextInput
            id="region"
            name="region"
            label="Region"
            value={formData.region}
            onChange={handleChange}
          />
          <TextInput
            id="postal_code"
            name="postal_code"
            label="Postal Code"
            value={formData.postal_code}
            onChange={handleChange}
          />
          <TextInput
            id="country"
            name="country"
            label="Country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => window.location.reload()}
          >
            Discard
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <i className="fas fa-save mr-2"></i>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
