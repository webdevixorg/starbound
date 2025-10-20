'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/context/ContentContext';
import {
  fetchCategories,
  createPost,
  fetchPostBySlug,
  updatePost,
} from '@/services/api';

import {
  uploadImage,
  updateImage,
  saveImageUrlToDB,
  deleteImage,
} from '@/services/images';
import { Category, Image, ImageFile, PostData } from '@/types/types';
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
import StarBoundTextEditor from '@/modules/StarboundEditor/src/App';
import LoadingSpinner from '@/components/Common/Loading';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';
import ModalAlert from '@/components/Modals/ModalAlert';

const AddPostPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') || undefined;

  const { user } = useAuth();
  const { contentTypes, loading: contentLoading } = useContent();

  // State declarations
  const [currentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [contentTypeId, setContentTypeId] = useState<number>();
  const [contentType, setContentType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
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
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
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

  // Reset form when creating new post
  useEffect(() => {
    if (!isClient) return;

    if (!slug) {
      setTitle('');
      setDescription('');
      setPostSlug('');
      setDate('');
      setIsEditingDate(false);
      setIsEditingSlug(false);
      setStatus('draft');
      setCategories([]);
      setSelectedCategories([]);
      setSelectedFiles([]);
      setGalleryImages([]);
    }
  }, [slug, isClient]);

  // Determine content type from URL
  useEffect(() => {
    if (!isClient || contentLoading || !contentTypes) return;

    // For Next.js App Router, we're at /profile/posts/add-post
    // So we know this is for 'post' content type
    const contentTypeName = 'post';

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

  // Load categories when content type is set
  useEffect(() => {
    if (!isClient || !contentTypeId) return;

    const loadCategories = async () => {
      try {
        setLoading(true);

        const fetchedCategories = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId
        );
        setCategories(fetchedCategories);
      } catch (error) {
        setError('Error fetching categories');
        setShowErrorModal(true);
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentPage, contentTypeId, isClient]);

  // Load post data when editing
  useEffect(() => {
    if (!isClient || !slug) return;

    const loadPostData = async () => {
      try {
        setLoading(true);
        const fetchedPost = await fetchPostBySlug(slug);
        setTitle(fetchedPost.title);
        setDescription(fetchedPost.description);
        setPostSlug(fetchedPost.slug);
        setDate(new Date(fetchedPost.created_at).toISOString().slice(0, 16));
        setStatus(fetchedPost.status);
        setSelectedCategories(fetchedPost.categories);
        setGalleryImages(
          fetchedPost.images
            .map((image) => ({
              id: image.id,
              alt: image.alt,
              image_path: image.image_path,
              object_id: image.object_id,
              order: image.order,
            }))
            .filter((image): image is Image => image.image_path !== undefined)
        );
      } catch (error) {
        setError('Error fetching post data');
        setShowErrorModal(true);
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPostData();
  }, [slug, isClient]);

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

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

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
    const slugToSave = postSlug || slugify(title);

    if (selectedCategories.length === 0) {
      setError('At least one category is required');
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);

      const postData: PostData = {
        title,
        description,
        slug: slugToSave,
        created_at: formatDateToISOString(date),
        status,
        categories: selectedCategories.map((category) => category.id),
        user: user ? user.id.toString() : '',
        contentType: contentType,
        content_type_id: contentTypeId ?? 0,
      };

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

      let response;

      if (slug) {
        response = await updatePost(slug, postData);
      } else {
        response = await createPost(postData);
      }

      const newPostId = response.id;

      if (selectedFiles.length > 0 && newPostId) {
        try {
          const uploadedResults = await Promise.all(
            selectedFiles.map(async (file) => {
              try {
                const uploadedImageData = await uploadImage(
                  file.file,
                  title,
                  contentType,
                  newPostId
                );
                return { file, uploadedImageData };
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

      if (galleryImages.length > 0) {
        try {
          for (const image of galleryImages) {
            if (image.id && image.id !== 0) {
              await updateImage(image.id, { order: image.order });
            }
          }
          console.log('All images updated successfully');
        } catch (error) {
          console.error('Error updating image orders:', error);
          setError('Error updating image orders');
          setShowErrorModal(true);
        }
      }

      if (newPostId) {
        setShowSuccessModal(true);
        if (!slug) {
          // If creating new, navigate to edit page
          router.push(`/profile/posts/add-post?slug=${response.slug}`);
        }
      } else {
        console.error(
          `${capitalizeFirstLetter(
            contentType
          )} ID is not set. Navigation will not occur.`
        );
      }
    } catch (error) {
      setError(`Error ${slug ? 'updating' : 'creating'} ${contentType}`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEventListener('mousedown', handleClickOutside, isEditingDate);

  // Loading skeleton for SSR compatibility
  if (!isClient) {
    return (
      <div className="p-6 bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex space-x-6">
            <div className="w-3/4 space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="w-1/4 space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="container mx-auto">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="w-3/4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {slug ? 'Edit' : 'Add New'} {capitalizeFirstLetter(contentType)}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <button
                  onClick={() => router.back()}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to Posts
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="title"
                >
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <label className="font-medium mr-2" htmlFor="slug">
                    Slug:
                  </label>
                  <div className="flex items-center flex-1">
                    <span className="text-gray-500">{baseURL}</span>
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
                </div>
              </div>

              {/* Content */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="description"
                >
                  Content *
                </label>
                <div className="overflow-hidden">
                  <StarBoundTextEditor
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-1/4 space-y-6">
            {/* Publish Widget */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Publish</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Date */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Posted On:
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
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => setIsEditingDate(true)}
                      className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                    >
                      {date
                        ? new Date(date).toLocaleString()
                        : new Date().toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
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
                      {slug ? 'Update' : 'Publish'}{' '}
                      {capitalizeFirstLetter(contentType)}
                    </>
                  )}
                </button>

                {/* Preview Button */}
                {slug && (
                  <a
                    href={`/${contentType}s/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-4 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Preview
                  </a>
                )}
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Categories
                </h3>
              </div>
              <div className="p-4">
                {categories.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {categories.map((category: Category) => {
                      const hasChildren =
                        category.children && category.children.length > 0;
                      const isParentChecked = selectedCategories.some(
                        (selectedCategory) =>
                          selectedCategory.id === category.id
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
                              onClick={() =>
                                toggleCategoryExpansion(category.id)
                              }
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
                              {category.children.map(
                                (subcategory: Category) => {
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
                                }
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No categories available
                  </p>
                )}

                {validationErrors.categories && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.categories}
                  </p>
                )}
              </div>
            </div>

            {/* Images Widget */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              </div>
              <div className="p-4">
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
        message={`${capitalizeFirstLetter(contentType)} saved successfully`}
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
};

export default AddPostPage;
