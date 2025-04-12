import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { useContent } from '../context/ContentContext'; // Import the context hook

import {
  fetchCategories,
  uploadImage,
  updateImage,
  deleteImage,
  createPost,
  fetchPostBySlug,
  updatePost,
} from '../services/api'; // Adjust the path as necessary

import { Category, Image, ImageFile, PostData } from '../types/types';
import GalleryImageUpload from '../components/Forms/Input/GalleryImageUpload';
import {
  capitalizeFirstLetter,
  formatDateToISOString,
  slugify,
} from '../helpers/common';
import {
  createHandleDateChange,
  toggleCategorySelection,
  useEventListener,
} from '../helpers/fromSubmission';
import StarBoundTextEditor from '../modules/StarboundEditor/src/App';

const AddPost: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth(); // Use useAuth hook to get the current user
  const { contentTypes, loading: contentLoading } = useContent(); // Get contentTypes from context

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [contentTypeId, setContentTypeId] = useState<number>();
  const [contentType, setContentType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [postSlug, setPostSlug] = useState('');
  const [date, setDate] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [status, setStatus] = useState<string>('Draft');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[] | []>([]);
  const [galleryImages, setGalleryImages] = useState<Image[]>([]);
  const [deletedImages, setDeletedImages] = useState<Image[]>([]);

  const baseURL = `${window.location.origin}/${contentType}s/`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.pathname.includes('new')) {
      setTitle('');
      setDescription('');
      setPostSlug('');
      setDate('');
      setIsEditingDate(false);
      setIsEditingSlug(false);
      setStatus('Draft');
      setCategories([]);
      setSelectedCategories([]);
      setSelectedFiles([]);
      setGalleryImages([]);
    }
  }, [location.pathname]);

  // Fetch content type on pathname change
  useEffect(() => {
    if (contentLoading || !contentTypes) return; // Ensure contentTypes is loaded before processing

    // Extract the base path (e.g., "/products" or "/posts") from the pathname
    const basePath = location.pathname.split('/')[1]; // Use 'let' to allow reassignment

    // Remove trailing "s" if it exists
    let contentTypeName = basePath;
    if (basePath.endsWith('s')) {
      contentTypeName = basePath.slice(0, -1); // Remove last character 's'
    }

    const matchedContentType = Array.isArray(contentTypes)
      ? contentTypes.find(
          (contentType: { model: string }) =>
            contentType.model === contentTypeName
        )
      : undefined;

    setContentTypeId(matchedContentType.id);
    setContentType(matchedContentType.model);
  }, [contentTypes, contentLoading, location.pathname]);

  useEffect(() => {
    // Only run the effect if contentTypeId has a valid value
    if (!contentTypeId) return;

    const loadCategories = async () => {
      try {
        // Fetch categories
        const fetchedCategories = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId ?? 0
        );
        setCategories(fetchedCategories);

        // Fetch post data if slug is provided
        if (slug) {
          const fetchedPost = await fetchPostBySlug(slug);
          setTitle(fetchedPost.title);
          setDescription(fetchedPost.description);
          setPostSlug(fetchedPost.slug);
          setDate(new Date(fetchedPost.date).toISOString().slice(0, 16));
          setStatus(fetchedPost.status);
          setSelectedCategories(fetchedPost.categories);
          setGalleryImages(
            fetchedPost.images
              .map((image) => ({
                id: image.id,
                alt: image.alt,
                image_path: image.image_path,
                order: image.order,
              }))
              .filter((image): image is Image => image.image_path !== undefined)
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadCategories();
  }, [currentPage, contentTypeId]); // Dependency on currentPage and contentTypeId

  const handleCategoryChange = useCallback((category: Category) => {
    setSelectedCategories((prevSelected) =>
      toggleCategorySelection(prevSelected, category)
    );
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
      console.error('At least one category is required');
      return;
    }

    try {
      const postData: PostData = {
        title,
        description,
        slug: slugToSave,
        date: formatDateToISOString(date),
        status,
        categories: selectedCategories.map((category) => category.id), // Ensure category IDs are sent
        user: user ? user.id.toString() : '',
        contentType: contentType, // Add content_type_id here
        content_type_id: contentTypeId ?? 0, // Add content_type_id here
      };

      // Delete images
      for (const image of deletedImages) {
        if (image.id) {
          await deleteImage(image.id);
        } else {
          console.error('Image ID is undefined:', image);
        }
      }

      // Clear the deleted images list
      setDeletedImages([]);

      let response;

      if (slug) {
        response = await updatePost(slug, postData);
      } else {
        response = await createPost(postData);
      }

      const newPostId = response.id;

      if (selectedFiles.length > 0 && newPostId) {
        // Upload images
        await Promise.all(
          selectedFiles.map(async (file) => {
            try {
              const uploadedImageData = await uploadImage(
                file,
                title,
                newPostId,
                contentTypeId ?? 0
              );
              return { ...file, uploadedImageData };
            } catch (error) {
              console.error('Error uploading image:', error);
              return null;
            }
          })
        );
        // Clear the selected files after upload
        setSelectedFiles([]);
      }

      if (galleryImages.length > 0) {
        // Upload images
        try {
          for (const image of galleryImages) {
            if (image.id && image.id !== 0) {
              await updateImage(image.id, { order: image.order });
            }
          }
          console.log('All images updated successfully');
          // Clear the gallery images after upload
          setGalleryImages([]);
        } catch (error) {
          console.error('Error updating image orders:', error);
        }
      }

      if (newPostId) {
        alert(`${capitalizeFirstLetter(contentType)} saved successfully`);
        // Fetch the updated post data to ensure the state is updated
        const updatedPost = await fetchPostBySlug(response.slug);
        setGalleryImages(updatedPost.images);
        navigate(`/${contentType}s/${response.slug}/edit`); // Corrected template literal
      } else {
        console.error(
          `${capitalizeFirstLetter(
            contentType
          )} ID is not set. Navigation will not occur.`
        );
      }
    } catch (error) {
      console.error(`Error creating ${contentType}:`, error);
    }
  };

  useEventListener('mousedown', handleClickOutside, isEditingDate);

  return (
    <div className="p-4 flex">
      <div className="w-3/4">
        <h1 className="text-3xl font-bold mb-6">
          {slug ? 'Edit' : 'Add New'} {capitalizeFirstLetter(contentType)}
        </h1>
        <form onSubmit={handleSubmit} className="bg-white px-1 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center block text-gray-700 text-sm">
              <label className="block font-bold mr-1" htmlFor="slug">
                Slug:
              </label>
              <div className="flex items-center">
                <span className="text-gray-700">{baseURL}</span>
                {isEditingSlug ? (
                  <div className="flex items-center">
                    <input
                      id="slug"
                      type="text"
                      value={postSlug}
                      onChange={(e) => setPostSlug(e.target.value)}
                      className="appearance-none border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!postSlug) {
                          setPostSlug(slugify(title));
                        }
                        setIsEditingSlug(false);
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-gray-700">{postSlug}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(true)}
                      className="ml-2 text-blue-500 hover:text-blue-700 underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Content
            </label>
            <StarBoundTextEditor
              value={description}
              onChange={setDescription}
            />
          </div>
        </form>
      </div>
      <div className="w-1/4 pl-4">
        <div className="widget bg-white border border-gray-300 mb-4">
          <div className="widget-content p-4">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <label
                  className="block text-gray-700 text-sm font-bold mr-1 w-1/2"
                  htmlFor="date"
                >
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
                    className="appearance-none border max-w-[125px] flex-grow flex-shrink p-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingDate(true)}
                    className="cursor-pointer appearance-none max-w-[125px] p-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
                  >
                    {date
                      ? new Date(date).toLocaleString()
                      : new Date().toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <label
                  className="block text-gray-700 text-sm font-bold mr-1"
                  htmlFor="status"
                >
                  Status:
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none border p-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="widget-footer bg-gray-200">
            <div className="text-lg font-semibold bg-gray-200 p-2 flex justify-between">
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 focus:outline-none focus:shadow-outline"
              >
                Save
              </button>
              {slug && (
                <a
                  href={`/posts/${slug}`}
                  target="_blank" // Open in a new page
                  rel="noopener noreferrer" // Security best practice
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-4 focus:outline-none focus:shadow-outline inline-block text-center"
                >
                  Preview
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="widget bg-white border border-gray-300 mb-4">
          <div className="widget-title">
            <h3 className="text-lg font-semibold mb-2 bg-gray-200 p-2 rounded">
              Categories
            </h3>
          </div>
          <div className="widget-content">
            <div className="block mb-2">
              <div className="flex flex-wrap">
                {categories.length > 0 ? (
                  <div className="max-h-64 w-full overflow-y-auto">
                    <ul className="list-none px-4">
                      {categories.map((category: Category) => {
                        const isChecked = selectedCategories.some(
                          (selectedCategory) =>
                            selectedCategory.id === category.id
                        );

                        return (
                          <li key={category.id} className="mr-2 mb-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCategoryChange(category)}
                                className="form-checkbox"
                              />
                              <span className="ml-2">{category.name}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p>No categories available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="widget bg-white border border-gray-300 mb-4">
          <div className="widget-title">
            <h3 className="text-lg font-semibold mb-2 bg-gray-200 p-2 rounded">
              Images
            </h3>
          </div>
          <div className="widget-content">
            <GalleryImageUpload
              setSelectedFiles={setSelectedFiles}
              galleryImages={galleryImages}
              setGalleryImages={setGalleryImages}
              setDeletedImages={setDeletedImages} // Pass the new prop
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
