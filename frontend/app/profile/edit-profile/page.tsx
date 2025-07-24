'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile, updateProfile } from '@/services/api';
import LoadingSpinner from '@/components/Common/Loading';
import TextInput from '@/components/Forms/Input/TextInput';
import PhoneInputField from '@/components/Forms/Input/PhoneInputField';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  bio: string;
  image: string | File;
  phone: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  date_of_birth: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    bio: '',
    image: '',
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, isClient]);

  // Fetch profile data
  useEffect(() => {
    if (!isClient || !user) return;

    const getProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProfile();

        const profileData: ProfileFormData = {
          first_name: data.user?.first_name || '',
          last_name: data.user?.last_name || '',
          bio: data.bio || '',
          image: data.image || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          postal_code: data.postal_code || '',
          country: data.country || '',
          date_of_birth: data.date_of_birth || '',
        };

        setFormData(profileData);

        // Set image preview
        if (typeof data.image === 'string' && data.image) {
          setImagePreview(data.image);
        } else if (data.image instanceof File) {
          setImagePreview(URL.createObjectURL(data.image));
        } else {
          setImagePreview('');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [isClient, user]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (formData.date_of_birth && isNaN(Date.parse(formData.date_of_birth))) {
      errors.date_of_birth = 'Please select a valid date';
    }

    // Validate phone number format if provided
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate postal code if provided
    if (
      formData.postal_code &&
      !/^[\w\s\-]{3,10}$/.test(formData.postal_code)
    ) {
      errors.postal_code = 'Please enter a valid postal code';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setHasChanges(true);

      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [validationErrors]
  );

  // Handle image upload
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setValidationErrors((prev) => ({
            ...prev,
            image: 'Image size must be less than 5MB',
          }));
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setValidationErrors((prev) => ({
            ...prev,
            image: 'Please select a valid image file',
          }));
          return;
        }

        setFormData((prev) => ({
          ...prev,
          image: file,
        }));
        setImagePreview(URL.createObjectURL(file));
        setHasChanges(true);

        // Clear image validation error
        if (validationErrors.image) {
          setValidationErrors((prev) => ({
            ...prev,
            image: '',
          }));
        }
      }
    },
    [validationErrors.image]
  );

  // Handle image deletion
  const handleImageDelete = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));
    setImagePreview('');
    setHasChanges(true);
  }, []);

  // Handle phone number change
  const handlePhoneChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));
      setHasChanges(true);

      // Clear phone validation error
      if (validationErrors.phone) {
        setValidationErrors((prev) => ({
          ...prev,
          phone: '',
        }));
      }
    },
    [validationErrors.phone]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedData = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'first_name' || key === 'last_name') {
          updatedData.append(`user.${key}`, value as string);
        } else if (key === 'image') {
          if (value instanceof File) {
            updatedData.append('image', value);
          } else if (value === '') {
            updatedData.append('image', '');
          }
        } else {
          updatedData.append(key, value as string);
        }
      });

      await updateProfile(updatedData);

      setHasChanges(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle discard changes
  const handleDiscard = useCallback(() => {
    if (hasChanges) {
      if (confirm('Are you sure you want to discard your changes?')) {
        window.location.reload();
      }
    }
  }, [hasChanges]);

  // Loading skeleton for SSR compatibility
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your personal information and preferences
              </p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Profile
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && !showErrorModal && (
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
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-800 hover:text-red-600 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Profile Picture Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Picture
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={imagePreview || 'https://via.placeholder.com/150'}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      title="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="image"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Change Picture
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                  {validationErrors.image && (
                    <p className="text-sm text-red-600">
                      {validationErrors.image}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TextInput
                    id="first_name"
                    name="first_name"
                    label="First Name *"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {validationErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.first_name}
                    </p>
                  )}
                </div>
                <div>
                  <TextInput
                    id="last_name"
                    name="last_name"
                    label="Last Name *"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {validationErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.last_name}
                    </p>
                  )}
                </div>
                <div>
                  <TextInput
                    id="date_of_birth"
                    name="date_of_birth"
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                  {validationErrors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.date_of_birth}
                    </p>
                  )}
                </div>
                <div>
                  <PhoneInputField
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Address Information
              </h3>
              <div className="space-y-6">
                <div>
                  <TextInput
                    id="address"
                    name="address"
                    label="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <TextInput
                      id="city"
                      name="city"
                      label="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <TextInput
                      id="region"
                      name="region"
                      label="State/Region"
                      value={formData.region}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <TextInput
                      id="postal_code"
                      name="postal_code"
                      label="Postal Code"
                      value={formData.postal_code}
                      onChange={handleChange}
                    />
                    {validationErrors.postal_code && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.postal_code}
                      </p>
                    )}
                  </div>
                  <div>
                    <TextInput
                      id="country"
                      name="country"
                      label="Country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <InlineLoaderIcon className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <ModalAlert
        isOpen={showErrorModal}
        title="Error"
        message={error || 'An unexpected error occurred.'}
        onClose={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        onConfirm={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        confirmText="OK"
        cancelText=""
      />

      <ModalAlert
        isOpen={showSuccessModal}
        title="Success"
        message="Profile updated successfully!"
        onClose={() => {
          setShowSuccessModal(false);
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
