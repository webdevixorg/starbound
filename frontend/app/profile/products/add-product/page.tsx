'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/context/ContentContext';
import { fetchCategories } from '@/services/api';
import {
  uploadImage,
  updateImage,
  deleteImage,
  saveImageUrlToDB,
} from '@/services/images';

import {
  createProduct,
  fetchProductBySlug,
  updateProduct,
} from '@/services/apiProducts';
import DOMPurify from 'dompurify';
import { Category, Image, ImageFile, ProductData } from '@/types/types';
import GalleryImageUpload from '@/components/Forms/Input/GalleryImageUpload';
import {
  capitalizeFirstLetter,
  formatDateToISOString,
  slugify,
} from '@/helpers/common';
import {
  createHandleDateChange,
  toggleCategorySelection,
  useEventListener,
} from '@/helpers/fromSubmission';
import LoadingSpinner from '@/components/Common/Loading';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';
import ModalAlert from '@/components/Modals/ModalAlert';
import StarBoundTextEditor from '@/modules/StarboundEditor/src/App';

// Extended ProductData type
interface Product extends ProductData {
  original_price?: number;
  stock_quantity: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams ? searchParams.get('slug') || undefined : undefined;

  const { user } = useAuth();
  const { contentTypes, loading: contentLoading } = useContent();

  // Determine if we're editing or creating
  const isEditing = Boolean(slug);
  const pageTitle = isEditing ? 'Edit Product' : 'Add New Product';
  const pageDescription = isEditing
    ? 'Update your product information'
    : 'Create a new product listing';
  const submitButtonText = isEditing ? 'Update Product' : 'Save Product';

  // State declarations
  const [currentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [contentTypeId, setContentTypeId] = useState<number>(0);
  const [contentType, setContentType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string>('');
  const [postSlug, setPostSlug] = useState('');
  const [date, setDate] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [status, setStatus] = useState<string>('draft');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [galleryImages, setGalleryImages] = useState<Image[]>([]);
  const [deletedImages, setDeletedImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  // Product-specific states
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [price, setPrice] = useState<number | null>(null);
  const [sku, setSku] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);

  // Form validation
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Base URL for preview
  const baseURL = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/${contentType}s/`;

  // Toggle Category Expansion
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Validation function
  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = 'Product title is required';
    }

    if (!description.trim()) {
      errors.description = 'Product description is required';
    }

    if (selectedCategories.length === 0) {
      errors.categories = 'At least one category is required';
    }

    if (!price || price <= 0) {
      errors.price = 'Valid price is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, description, selectedCategories, price]);

  // Reset form when creating new product
  useEffect(() => {
    if (!isClient) return;

    if (!isEditing) {
      setTitle('');
      setDescription('');
      setShortDescription('');
      setPostSlug('');
      setDate('');
      setIsEditingDate(false);
      setIsEditingSlug(false);
      setStatus('draft');
      setSelectedCategories([]);
      setSelectedFiles([]);
      setGalleryImages([]);
      setPrice(null);
      setOriginalPrice(null);
      setStockQuantity(null);
      setSku('');
      setValidationErrors({});
    }
  }, [isEditing, isClient]);

  // Determine content type from URL (always 'product' for this page)
  useEffect(() => {
    if (!isClient || contentLoading || !contentTypes) return;

    const contentTypeName = 'product';

    const matchedContentType = Array.isArray(contentTypes)
      ? contentTypes.find(
          (contentType: { model: string }) =>
            contentType.model === contentTypeName
        )
      : undefined;

    if (matchedContentType) {
      setContentTypeId(matchedContentType.id);
      setContentType(matchedContentType.model);
    } else {
      console.error('No matching content type found for:', contentTypeName);
      setError('Content type not found');
      setShowErrorModal(true);
    }
  }, [contentTypes, contentLoading, isClient]);

  // ExtendedProduct type for fetched product data
  type ExtendedProduct = ProductData & {
    original_price?: number;
    stock_quantity?: number;
    additional_info?: string;
    short_description?: string;
    sku?: string;
    images: Image[];
    categories: Category[];
    date: string;
    status: string;
    slug: string;
    title: string;
    description: string;
  };

  // Load categories and product data
  useEffect(() => {
    if (!isClient || !contentTypeId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const fetchedCategories = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId
        );
        setCategories(fetchedCategories);

        // Fetch product data if editing
        if (isEditing && slug) {
          const fetchedProduct = (await fetchProductBySlug(
            slug
          )) as unknown as ExtendedProduct;

          setTitle(fetchedProduct.title);
          setDescription(fetchedProduct.description);
          setPostSlug(fetchedProduct.slug);
          setDate(
            new Date(fetchedProduct.created_at).toISOString().slice(0, 16)
          );
          setStatus(fetchedProduct.status);
          setSelectedCategories(fetchedProduct.categories);
          setGalleryImages(
            fetchedProduct.images
              .map((image) => ({
                id: image.id,
                alt: image.alt,
                image_path: image.image_path,
                object_id: image.object_id,
                order: image.order,
              }))
              .filter((image): image is Image => image.image_path !== undefined)
          );
          setAdditionalInfo(fetchedProduct.additional_info || '');
          setShortDescription(fetchedProduct.short_description || '');
          setPrice(fetchedProduct.price || null);
          setOriginalPrice((fetchedProduct as any).original_price || null);
          setStockQuantity((fetchedProduct as any).stock_quantity || null);
          setSku(fetchedProduct.sku || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(
          isEditing
            ? 'Error fetching product data'
            : 'Error fetching categories'
        );
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, contentTypeId, isEditing, slug, isClient]);

  // Enhanced handleCategoryChange with hierarchy logic
  const handleCategoryChange = useCallback(
    (category: Category) => {
      setSelectedCategories((prevSelected) => {
        const isCurrentlySelected = prevSelected.some(
          (selected) => selected.id === category.id
        );

        let newSelected = [...prevSelected];

        if (isCurrentlySelected) {
          // Remove the category
          newSelected = newSelected.filter(
            (selected) => selected.id !== category.id
          );

          // If removing a parent, also remove its children
          if (category.children && category.children.length > 0) {
            const childIds = category.children.map((child) => child.id);
            newSelected = newSelected.filter(
              (selected) => !childIds.includes(selected.id)
            );
          }

          // If removing a child, check if we should remove parent
          if (category.parent) {
            const parentStillHasSelectedChildren = category.children?.some(
              (child) =>
                child.id !== category.id &&
                newSelected.some((selected) => selected.id === child.id)
            );

            // Remove parent if no other children are selected and parent was auto-selected
            if (!parentStillHasSelectedChildren) {
              newSelected = newSelected.filter(
                (selected) => selected.id !== category.id
              );
            }
          }
        } else {
          // Add the category
          newSelected.push(category);

          // Auto-select parent if selecting a child (optional)
          if (
            category.parent &&
            !newSelected.some((selected) => selected.id === category.id)
          ) {
            newSelected.push(category);
          }
        }

        return newSelected;
      });

      // Clear validation error
      if (validationErrors.categories) {
        setValidationErrors((prev) => ({ ...prev, categories: '' }));
      }
    },
    [validationErrors.categories]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      // Clear validation error
      if (validationErrors.description) {
        setValidationErrors((prev) => ({ ...prev, description: '' }));
      }
    },
    [validationErrors.description]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      // Clear validation error
      if (validationErrors.title) {
        setValidationErrors((prev) => ({ ...prev, title: '' }));
      }
    },
    [validationErrors.title]
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ? Number(e.target.value) : null;
      setPrice(value);
      // Clear validation error
      if (validationErrors.price) {
        setValidationErrors((prev) => ({ ...prev, price: '' }));
      }
    },
    [validationErrors.price]
  );

  const handleDateChange = createHandleDateChange(setDate);

  const handleClickOutside = useCallback((event: Event) => {
    const mouseEvent = event as MouseEvent;
    if (
      inputRef.current &&
      !inputRef.current.contains(mouseEvent.target as Node)
    ) {
      setIsEditingDate(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    const slugToSave = postSlug || slugify(title);

    try {
      // Define the extended product data type inline
      type ExtendedProductData = ProductData & {
        original_price?: number | null;
        stock_quantity?: number | null;
        additional_info?: string;
        short_description?: string;
        sku?: string;
        location?: number;
        sublocation?: number;
      };

      let response;

      // Delete images
      for (const image of deletedImages) {
        if (image.id) {
          await deleteImage(
            image.object_id,
            image.id,
            contentType,
            image.image_path
          );
        } else {
          console.error('Image ID is undefined:', image);
        }
      }

      setDeletedImages([]);

      // Prepare productData without using response before declaration
      const productData: ExtendedProductData = {
        id: 0, // Will be set after response
        title: title.trim(),
        description: DOMPurify.sanitize(description),
        slug: slugToSave,
        created_at: formatDateToISOString(date),
        status,
        categories: selectedCategories.map((category) => category.id),
        user: user ? user.id.toString() : '',
        contentType: contentType,
        content_type_id: contentTypeId ?? 0,
        additional_info: DOMPurify.sanitize(additionalInfo),
        short_description: shortDescription.trim(),
        price: price ?? 0,
        original_price: originalPrice ?? 0,
        stock_quantity: stockQuantity ?? 0,
        compare_price: originalPrice ?? price ?? 0, // Added compare_price property
        sku: sku.trim(),
        location: 1,
        sublocation: 1,
      };

      if (isEditing && slug) {
        // Create a copy without the extended properties for the API call
        response = await updateProduct(slug, productData);
      } else {
        // Create a copy without the extended properties for the API call
        response = await createProduct(productData);
      }

      // Now set productData.id if editing and response.id exists
      if (isEditing && response?.id) {
        productData.id = response.id;
      }

      const newProductId = response.id;

      // Upload new images
      if (selectedFiles.length > 0 && newProductId) {
        try {
          const uploadedResults = await Promise.all(
            selectedFiles.map(async (file) => {
              try {
                const uploadedImageData = await uploadImage(
                  file.file,
                  title,
                  contentType,
                  newProductId
                );
                return { ...file, uploadedImageData };
              } catch (err) {
                return null; // allow others to continue
              }
            })
          );

          const successfulUploads = uploadedResults.filter(Boolean);

          if (successfulUploads.length > 0) {
            // Save each image URL to Django
            await Promise.all(
              successfulUploads.map((item, idx) => {
                if (item && item.uploadedImageData) {
                  return saveImageUrlToDB(
                    item.uploadedImageData.url,
                    item.uploadedImageData.title,
                    item.uploadedImageData.contentId,
                    contentTypeId ?? 0,
                    idx + 1 // or uploadedImageData.order if available
                  );
                }
                return Promise.resolve();
              })
            );
          }

          setSelectedFiles([]);
        } catch (err) {
          console.error('❌ Unexpected error during batch upload:', err);
          setError('Unexpected error during image upload');
          setShowErrorModal(true);
        }
      }

      // Update image orders
      if (galleryImages.length > 0) {
        try {
          for (const image of galleryImages) {
            if (image.id !== 0) {
              await updateImage(image.id, { order: image.order });
            }
          }
        } catch (error) {
          console.error('Error updating image orders:', error);
        }
      }

      if (newProductId) {
        setShowSuccessModal(true);
        if (!isEditing) {
          // Navigate to edit page after successful creation
          setTimeout(() => {
            router.push(`/profile/products/add-product?slug=${response.slug}`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} ${contentType}:`,
        error
      );
      setError(
        `Error ${
          isEditing ? 'updating' : 'creating'
        } ${contentType}. Please try again.`
      );
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      // If editing, go back to the product view
      router.push(`/${contentType}s/${slug}`);
    } else {
      // If creating new, go to products list
      router.push('/profile/products');
    }
  };

  useEventListener('mousedown', handleClickOutside, isEditingDate);

  // Loading skeleton for SSR compatibility
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && contentLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="mt-1 text-sm text-gray-600">{pageDescription}</p>
              {isEditing && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editing: {slug}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
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
                {isEditing ? 'Cancel' : 'Back to Products'}
              </button>
              {isEditing && (
                <Link
                  href={`/shop/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View Product
                </Link>
              )}
            </div>
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
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Basic Information
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="title"
                    >
                      Product Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      className={`w-full px-3 py-2 border rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.title
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter product title"
                      required
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  {/* URL Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{baseURL}</span>
                      {isEditingSlug ? (
                        <div className="flex items-center space-x-2">
                          <input
                            id="slug"
                            type="text"
                            value={postSlug}
                            onChange={(e) => setPostSlug(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="product-slug"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!postSlug) {
                                setPostSlug(slugify(title));
                              }
                              setIsEditingSlug(false);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingSlug(false)}
                            className="px-2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {postSlug ||
                              slugify(title) ||
                              'auto-generated-from-title'}
                          </span>
                          {/* Always show edit button - remove the !isEditing condition */}
                          <button
                            type="button"
                            onClick={() => setIsEditingSlug(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                          >
                            Edit
                          </button>
                          {/* Add regenerate button for convenience */}
                          <button
                            type="button"
                            onClick={() => setPostSlug(slugify(title))}
                            className="text-green-600 hover:text-green-800 text-sm transition-colors"
                            title="Generate slug from title"
                          >
                            Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <p className="mt-1 text-xs text-gray-500">
                        Changing the URL will break existing links to this
                        product
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="shortDescription"
                    >
                      Short Description
                    </label>
                    <input
                      id="shortDescription"
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief product description"
                      maxLength={160}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {shortDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Pricing & Inventory
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="price"
                    >
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price ?? ''}
                        onChange={handlePriceChange}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.price
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="originalPrice"
                    >
                      Original Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={originalPrice ?? ''}
                        onChange={(e) =>
                          setOriginalPrice(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      For showing discounts
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="stockQuantity"
                    >
                      Stock Quantity
                    </label>
                    <input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={stockQuantity ?? ''}
                      onChange={(e) =>
                        setStockQuantity(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="sku"
                    >
                      SKU
                    </label>
                    <input
                      id="sku"
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Product Description
                </h2>
                <div
                  className={`rounded-lg overflow-hidden ${
                    validationErrors.description
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                >
                  <StarBoundTextEditor
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </div>
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Additional Information
                </h2>
                <div className="rounded-lg overflow-hidden">
                  <StarBoundTextEditor
                    value={additionalInfo}
                    onChange={setAdditionalInfo}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Publish
              </h3>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEditing ? 'Last Modified' : 'Posted On'}
                  </label>
                  {isEditingDate ? (
                    <input
                      id="date"
                      type="datetime-local"
                      value={date}
                      ref={inputRef}
                      onChange={handleDateChange}
                      onBlur={() => setIsEditingDate(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingDate(false);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingDate(true)}
                      className="cursor-pointer px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm hover:bg-gray-100 transition-colors"
                    >
                      {date
                        ? new Date(date).toLocaleString()
                        : new Date().toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lgborder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <InlineLoaderIcon className="mr-2" />
                      {isEditing ? 'Updating...' : 'Saving...'}
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
                      {submitButtonText}
                    </>
                  )}
                </button>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  {isEditing && (
                    <Link
                      href={`/shop/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categories *
              </h3>

              {categories.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {categories.map((category: Category) => {
                    const hasChildren =
                      category.children && category.children.length > 0;
                    const isParentChecked = selectedCategories.some(
                      (selectedCategory) => selectedCategory.id === category.id
                    );
                    const isExpanded = expandedCategories.has(category.id);

                    // Count selected subcategories
                    const selectedSubcategoriesCount = hasChildren
                      ? category.children.filter((child) =>
                          selectedCategories.some(
                            (selected) => selected.id === child.id
                          )
                        ).length
                      : 0;

                    return (
                      <div key={category.id} className="space-y-1">
                        {/* Parent Category */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {hasChildren ? (
                              <svg
                                className={`w-3 h-3 text-gray-400 transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            ) : (
                              // Spacer div to preserve layout
                              <div className="w-3 h-3" />
                            )}
                          </button>

                          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors flex-1">
                            <input
                              type="checkbox"
                              checked={isParentChecked}
                              onChange={() => handleCategoryChange(category)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {category.name}
                            </span>
                            {hasChildren && (
                              <span className="text-xs text-gray-500 ml-auto">
                                ({category.children.length})
                                {selectedSubcategoriesCount > 0 && (
                                  <span className="bg-blue-100 text-blue-800 ml-1 px-2 py-1 rounded-full mr-2">
                                    {selectedSubcategoriesCount} +
                                  </span>
                                )}
                              </span>
                            )}
                          </label>
                        </div>

                        {/* Subcategories */}
                        {hasChildren && isExpanded && (
                          <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-3">
                            {category.children.map((subcategory: Category) => {
                              const isSubcategoryChecked =
                                selectedCategories.some(
                                  (selectedCategory) =>
                                    selectedCategory.id === subcategory.id
                                );

                              return (
                                <label
                                  key={subcategory.id}
                                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSubcategoryChecked}
                                    onChange={() =>
                                      handleCategoryChange(subcategory)
                                    }
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-xs text-gray-600 group-hover:text-gray-800">
                                    {subcategory.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}

              {validationErrors.categories && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.categories}
                </p>
              )}
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Images
              </h3>
              <GalleryImageUpload
                setSelectedFiles={setSelectedFiles}
                galleryImages={galleryImages}
                setGalleryImages={setGalleryImages}
                setDeletedImages={setDeletedImages}
                contentType={contentType}
              />
            </div>
          </div>
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
        message={`${capitalizeFirstLetter(contentType)} ${
          isEditing ? 'updated' : 'created'
        } successfully`}
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
