import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchCategories,
  deleteCategory,
  addCategory,
  updateCategory,
} from '../services/api';
import { useContent } from '../context/ContentContext'; // Import the context hook
import { Category } from '../types/types';
import { slugify } from '../helpers/common';

const PostCategory: React.FC = () => {
  const location = useLocation();
  const { contentTypes, loading: contentLoading } = useContent(); // Get contentTypes from context

  const [contentTypeId, setContentTypeId] = useState<number>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<{
    id?: number;
    oldSlug?: string;
    slug: string;
    name: string;
    description: string;
    parent: number | null | Category | null;
    content_type_id?: number;
  }>({
    name: '',
    description: '',
    slug: '',
    parent: null,
  });

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
  }, [contentTypes, contentLoading, location.pathname]);

  useEffect(() => {
    // Only run the effect if contentTypeId has a valid value
    if (!contentTypeId) return;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId
        );
        setCategories(response || []);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch (error) {
        setError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentPage, contentTypeId]); // Dependency on currentPage and contentTypeId

  // Memoize the function to prevent unnecessary re-renders
  const handleDelete = useCallback(async (slug: string) => {
    try {
      const response = await deleteCategory(slug);
      if (response.ok) {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.slug !== slug)
        );
      } else {
        setError('Failed to delete category');
      }
    } catch (error) {
      setError('Error deleting category');
    }
  }, []);

  // Add or update category
  const handleAddCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const addedCategory = editMode
          ? await updateCategory(newCategory.oldSlug!, newCategory)
          : await addCategory({
              ...newCategory,
              content_type_id: contentTypeId ?? 0,
            });

        setCategories((prevCategories) => {
          const updatedCategories = editMode
            ? prevCategories.map((category) =>
                category.id === addedCategory.id ? addedCategory : category
              )
            : [...prevCategories, addedCategory];

          if (newCategory.parent) {
            return updatedCategories.map((category) =>
              category.id === newCategory.parent
                ? {
                    ...category,
                    children: [...(category.children || []), addedCategory],
                  }
                : category
            );
          }
          return updatedCategories;
        });

        setShowAddForm(false);
        setEditMode(false);
        setNewCategory({ name: '', slug: '', description: '', parent: null });
      } catch (error) {
        setError('Error adding/updating category');
      }
    },
    [editMode, newCategory, contentTypeId]
  );

  // Edit category
  const handleEdit = useCallback(
    (category: Category) => {
      setNewCategory({
        id: category.id,
        name: category.name,
        oldSlug: category.slug,
        slug: category.slug,
        description: category.description ?? '',
        parent: category.parent ?? null,
        content_type_id: contentTypeId,
      });
      setShowAddForm(true);
      setEditMode(true);
    },
    [contentTypeId]
  );

  // Pagination controls
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);

  // Handle category name change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setNewCategory({ ...newCategory, name, slug: slugify(name) });
    },
    [newCategory]
  );

  // Render category tree recursively
  const renderCategories = useMemo(
    () =>
      (categories: Category[], level: number = 0) => {
        return categories.map((category) => (
          <React.Fragment key={category.id}>
            <tr
              className={`hover:bg-gray-100 ${
                level > 0 ? 'pl-' + level * 4 : ''
              }`}
            >
              <td className="py-2 px-4 border-b border-gray-200">
                {category.parent ? '-' : ''} {category.name}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {category.slug}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {category.description ?? ''}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                <a
                  href={`/categories/${category.slug}`}
                  className="text-blue-500 hover:underline mr-2"
                >
                  View
                </a>
                <button
                  onClick={() => handleEdit(category)}
                  className="text-yellow-500 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.slug)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
            {category.children &&
              renderCategories(category.children, level + 1)}
          </React.Fragment>
        ));
      },
    [categories, handleDelete, handleEdit]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <button
        onClick={() => {
          setShowAddForm(!showAddForm);
          setEditMode(false);
          setNewCategory({ name: '', slug: '', description: '', parent: null });
        }}
        className="mb-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        {showAddForm ? 'Cancel' : 'Add Category'}
      </button>
      {showAddForm && (
        <form onSubmit={handleAddCategory} className="mb-4">
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={handleNameChange}
              className="border py-2 px-4 mb-4 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Slug</label>
            <input
              type="text"
              value={newCategory.slug}
              onChange={(e) =>
                setNewCategory({ ...newCategory, slug: e.target.value })
              }
              className="border py-2 px-4 mb-4 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="border py-2 px-4 mb-4 w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Parent Category</label>
            <select
              value={newCategory.parent ? newCategory.parent.toString() : ''}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  parent: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="border py-2 px-4 mb-4 w-full"
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            {editMode ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      )}
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200">Name</th>
              <th className="py-2 px-4 border-b border-gray-200">Slug</th>
              <th className="py-2 px-4 border-b border-gray-200">
                Description
              </th>
              <th className="py-2 px-4 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>{renderCategories(categories)}</tbody>
        </table>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostCategory;
