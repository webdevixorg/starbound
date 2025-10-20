'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile, updateProfile } from '@/services/api';
import { saveUserImageUrlToDB, uploadImage } from '@/services/images';
import LoadingSpinner from '@/components/Common/Loading';
import TextInput from '@/components/Forms/Input/TextInput';
import PhoneInputField from '@/components/Forms/Input/PhoneInputField';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';
import type {
  Profile,
  ProfileFormData,
  UIState,
  User,
  ValidationErrors,
} from '@/types/types';
import SafeImage from '@/components/UI/SafeImage';
import { getPublicImageUrl } from '@/helpers/media';

// Types

// Constants
const INITIAL_PROFILE_FORM_DATA: ProfileFormData = {
  first_name: '',
  last_name: '',
  bio: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  postal_code: '',
  country: '',
  date_of_birth: '',
};

const UIState = {
  loading: true,
  saving: false,
  uploadingImage: false,
  error: null,
  showSuccessModal: false,
  showErrorModal: false,
  hasChanges: false,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validation utilities
const validateForm = (formData: ProfileFormData): ValidationErrors => {
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

  if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (formData.postal_code && !/^[\w\s\-]{3,10}$/.test(formData.postal_code)) {
    errors.postal_code = 'Please enter a valid postal code';
  }

  return errors;
};

// Main component
export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  // State management - Combined from hook and main component
  const [uiState, setUIState] = useState<UIState>(UIState);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isClient, setIsClient] = useState(false);

  // Profile data state
  const [formData, setFormData] = useState<ProfileFormData>(
    INITIAL_PROFILE_FORM_DATA
  );
  const [formImageData, setFormImageData] = useState<File>();

  const [imagePreview, setImagePreview] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  // Memoized values
  const isFormDisabled = useMemo(
    () => uiState.saving || uiState.uploadingImage,
    [uiState.saving, uiState.uploadingImage]
  );

  const canSubmit = useMemo(
    () =>
      uiState.hasChanges &&
      !isFormDisabled &&
      Object.keys(validationErrors).length === 0,
    [uiState.hasChanges, isFormDisabled, validationErrors]
  );

  // Update UI state helper
  const updateUIState = useCallback((updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Fetch profile data function
  const fetchProfileData = useCallback(async () => {
    if (!isClient || !user) return { success: false, error: null };

    try {
      const data = await fetchProfile();

      const profileData: Profile = {
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
        bio: data.bio || '',
        image_path: data.image_path || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        region: data.region || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        date_of_birth: data.date_of_birth || '',
      };

      setFormData(profileData);
      const imageUrl = data.image_path || '';
      setImagePreview(imageUrl);
      setOriginalImageUrl(imageUrl);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: 'Failed to load profile data. Please try again.',
      };
    }
  }, [isClient, user]);

  // Effects
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !user) {
      router.push('/signin');
    }
  }, [user, router, isClient]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isClient || !user) return;

      updateUIState({ loading: true, error: null });
      const result = await fetchProfileData();

      updateUIState({
        loading: false,
        error: result.error,
        showErrorModal: !result.success,
      });
    };

    loadProfile();
  }, [isClient, user, fetchProfileData, updateUIState]);

  // Event handlers
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({ ...prev, [name]: value }));
      updateUIState({ hasChanges: true });

      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [validationErrors, updateUIState]
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, phone: value }));
      updateUIState({ hasChanges: true });

      if (validationErrors.phone) {
        setValidationErrors((prev) => ({ ...prev, phone: '' }));
      }
    },
    [validationErrors.phone, updateUIState]
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const errors: ValidationErrors = {};

      if (file.size > MAX_FILE_SIZE) {
        errors.image = 'Image size must be less than 5MB';
      } else if (!file.type.startsWith('image/')) {
        errors.image = 'Please select a valid image file';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      // Set file and preview
      setFormImageData(file);
      setImagePreview(URL.createObjectURL(file));
      updateUIState({ hasChanges: true });

      // Clear validation errors
      if (validationErrors.image) {
        setValidationErrors((prev) => ({ ...prev, image: '' }));
      }
    },
    [validationErrors.image, updateUIState]
  );

  const handleImageDelete = useCallback(() => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
    updateUIState({ hasChanges: true });
  }, [updateUIState]);

  const handleDiscard = useCallback(() => {
    if (
      uiState.hasChanges &&
      confirm('Are you sure you want to discard your changes?')
    ) {
      window.location.reload();
    }
  }, [uiState.hasChanges]);

  // Form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const errors = validateForm(formData);
      setValidationErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      updateUIState({ saving: true, error: null });

      try {
        // Handle image upload
        let imageUrl = originalImageUrl;
        let imageResponse;

        if (formImageData instanceof File) {
          updateUIState({ uploadingImage: true });
          try {
            const uploadedImageData = await uploadImage(
              formImageData,
              'profile-image',
              'profile',
              user?.id || 0
            );

            if (uploadedImageData) {
              // Save the single image URL to Django
              imageResponse = await saveUserImageUrlToDB(
                uploadedImageData.url,
                uploadedImageData.title || 'profile-image',
                uploadedImageData.contentId || user?.id || 0,
                3,
                1
              );
            }

            if (!imageResponse) {
              throw new Error('Failed to get image URL from upload response');
            }
          } catch (err) {
            throw new Error('Failed to upload image. Please try again.');
          } finally {
            updateUIState({ uploadingImage: false });
          }
        }

        // Prepare profile data as FormData
        const profileData = new FormData();
        profileData.append('first_name', formData.first_name);
        profileData.append('last_name', formData.last_name);
        if (formData.bio) profileData.append('bio', formData.bio);
        if (imageResponse) profileData.append('image_id', imageResponse.id);
        if (formData.phone) profileData.append('phone', formData.phone);
        if (formData.address) profileData.append('address', formData.address);
        if (formData.city) profileData.append('city', formData.city);
        if (formData.region) profileData.append('region', formData.region);
        if (formData.postal_code)
          profileData.append('postal_code', formData.postal_code);
        if (formData.country) profileData.append('country', formData.country);
        if (formData.date_of_birth)
          profileData.append('date_of_birth', formData.date_of_birth);

        // Update profile
        await updateProfile(profileData);

        // Success
        updateUIState({
          hasChanges: false,
          showSuccessModal: true,
        });
        setOriginalImageUrl(imageUrl);
      } catch (error) {
        console.error('Error updating profile:', error);
        updateUIState({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update profile. Please try again.',
          showErrorModal: true,
        });
      } finally {
        updateUIState({ saving: false });
      }
    },
    [formData, originalImageUrl, user?.id, updateUIState, setOriginalImageUrl]
  );

  // Loading states
  if (!isClient) {
    return <LoadingSkeleton />;
  }

  if (uiState.loading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader onBack={() => router.push('/profile')} />

        {uiState.error && !uiState.showErrorModal && (
          <ErrorAlert
            error={uiState.error}
            onDismiss={() => updateUIState({ error: null })}
          />
        )}

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <ProfilePictureSection
              imagePreview={imagePreview}
              uploadingImage={uiState.uploadingImage}
              validationError={validationErrors.image}
              onImageChange={handleImageChange}
              onImageDelete={handleImageDelete}
              user={user}
              disabled={isFormDisabled}
            />

            <PersonalInfoSection
              formData={formData}
              validationErrors={validationErrors}
              onChange={handleInputChange}
              onPhoneChange={handlePhoneChange}
              disabled={isFormDisabled}
            />

            <BioSection
              value={formData.bio}
              onChange={handleInputChange}
              disabled={isFormDisabled}
            />

            <AddressSection
              formData={formData}
              validationErrors={validationErrors}
              onChange={handleInputChange}
              disabled={isFormDisabled}
            />

            <ActionButtons
              canSubmit={canSubmit}
              isDisabled={isFormDisabled}
              hasChanges={uiState.hasChanges}
              saving={uiState.saving}
              uploadingImage={uiState.uploadingImage}
              onDiscard={handleDiscard}
            />
          </form>
        </div>
      </div>

      <Modals
        showErrorModal={uiState.showErrorModal}
        showSuccessModal={uiState.showSuccessModal}
        error={uiState.error}
        onCloseError={() =>
          updateUIState({ showErrorModal: false, error: null })
        }
        onCloseSuccess={() => updateUIState({ showSuccessModal: false })}
      />
    </div>
  );
}

// Optimized Sub-components with React.memo
const LoadingSkeleton = React.memo(() => (
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
            {Array.from({ length: 6 }, (_, i) => (
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
));

const PageHeader = React.memo<{ onBack: () => void }>(({ onBack }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your personal information and preferences
        </p>
      </div>
      <button
        onClick={onBack}
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
));

const ErrorAlert = React.memo<{ error: string; onDismiss: () => void }>(
  ({ error, onDismiss }) => (
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
              onClick={onDismiss}
              className="text-red-800 hover:text-red-600 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

const ProfilePictureSection = React.memo<{
  imagePreview: string;
  uploadingImage: boolean;
  validationError?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
  user: User;
  disabled: boolean;
}>(
  ({
    imagePreview,
    uploadingImage,
    validationError,
    onImageChange,
    onImageDelete,
    user,
    disabled,
  }) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Profile Picture
      </h3>
      <div className="flex items-center space-x-6">
        <div className="relative">
          {/* Use regular img tag for blob URLs, SafeImage for regular URLs */}
          {imagePreview.startsWith('blob:') ? (
            <img
              src={imagePreview}
              alt={user.first_name || 'Profile'}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <SafeImage
              alt={user.first_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              images={[
                {
                  image_path: getPublicImageUrl(
                    'profiles',
                    user.id,
                    imagePreview
                  ),
                },
              ]}
              fallback="/placeholder-product.png"
              width={500}
              height={150}
            />
          )}

          {imagePreview && (
            <button
              type="button"
              onClick={onImageDelete}
              disabled={disabled}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors disabled:opacity-50"
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
          {uploadingImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <InlineLoaderIcon className="text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="image"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white cursor-pointer transition-colors ${
              disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploadingImage ? (
              <>
                <InlineLoaderIcon className="w-4 h-4 mr-2" />
                Uploading...
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
              </>
            )}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={onImageChange}
            disabled={disabled}
            className="hidden"
          />
          <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
          {validationError && (
            <p className="text-sm text-red-600">{validationError}</p>
          )}
        </div>
      </div>
    </div>
  )
);

const PersonalInfoSection = React.memo<{
  formData: ProfileFormData;
  validationErrors: ValidationErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string) => void;
  disabled: boolean;
}>(({ formData, validationErrors, onChange, onPhoneChange, disabled }) => (
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
          onChange={onChange}
          disabled={disabled}
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
          onChange={onChange}
          disabled={disabled}
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
          onChange={onChange}
          disabled={disabled}
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
          onChange={onPhoneChange}
          disabled={disabled}
        />
        {validationErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
        )}
      </div>
    </div>
  </div>
));

const BioSection = React.memo<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}>(({ value, onChange, disabled }) => (
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
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder="Tell us about yourself..."
    />
  </div>
));

const AddressSection = React.memo<{
  formData: ProfileFormData;
  validationErrors: ValidationErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}>(({ formData, validationErrors, onChange, disabled }) => (
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
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TextInput
            id="city"
            name="city"
            label="City"
            value={formData.city}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
        <div>
          <TextInput
            id="region"
            name="region"
            label="State/Region"
            value={formData.region}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
        <div>
          <TextInput
            id="postal_code"
            name="postal_code"
            label="Postal Code"
            value={formData.postal_code}
            onChange={onChange}
            disabled={disabled}
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
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
));

const ActionButtons = React.memo<{
  canSubmit: boolean;
  isDisabled: boolean;
  hasChanges: boolean;
  saving: boolean;
  uploadingImage: boolean;
  onDiscard: () => void;
}>(
  ({
    canSubmit,
    isDisabled,
    hasChanges,
    saving,
    uploadingImage,
    onDiscard,
  }) => (
    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onDiscard}
        disabled={isDisabled}
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
        disabled={!canSubmit}
        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving || uploadingImage ? (
          <>
            <InlineLoaderIcon className="mr-2" />
            {uploadingImage ? 'Uploading Image...' : 'Saving...'}
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
  )
);

const Modals = React.memo<{
  showErrorModal: boolean;
  showSuccessModal: boolean;
  error: string | null;
  onCloseError: () => void;
  onCloseSuccess: () => void;
}>(
  ({
    showErrorModal,
    showSuccessModal,
    error,
    onCloseError,
    onCloseSuccess,
  }) => (
    <>
      <ModalAlert
        isOpen={showErrorModal}
        title="Error"
        message={error || 'An unexpected error occurred.'}
        onClose={onCloseError}
        onConfirm={onCloseError}
        confirmText="OK"
        cancelText=""
      />
      <ModalAlert
        isOpen={showSuccessModal}
        title="Success"
        message="Profile updated successfully!"
        onClose={onCloseSuccess}
        onConfirm={onCloseSuccess}
        confirmText="OK"
        cancelText=""
      />
    </>
  )
);
