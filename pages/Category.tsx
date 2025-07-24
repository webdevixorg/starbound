import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchCategories,
  deleteCategory,
  addCategory,
  updateCategory,
} from '../services/api';
import { useContent } from '../context/ContentContext';
import { Category } from '../types/types';
import { slugify } from '../helpers/common';
import LoadingSpinner from '../components/Common/Loading';
import ModalAlert from '../components/Modals/ModalAlert';

const PostCategory: React.FC = () => {
  const location = useLocation();
  const { contentTypes, loading: contentLoading } = useContent();

  const [contentTypeId, setContentTypeId] = useState<number>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
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

  useEffect(() => {
    if (contentLoading || !contentTypes) return;
    let basePath = location.pathname.split('/')[1];
    if (basePath.endsWith('s')) {
      basePath = basePath.slice(0, -1);
    }
    const matched = Object.values(contentTypes).find(
      (ct) => ct.model === basePath
    );
    setContentTypeId(matched?.id);
  }, [contentTypes, contentLoading, location.pathname]);

  useEffect(() => {
    if (!contentTypeId) return;

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchCategories(
          currentPage,
          pageSize,
          contentTypeId
        );
        setCategories(response || []);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch {
        setError('Failed to fetch categories.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentPage, contentTypeId]);

  const handleDelete = useCallback(async (slug: string) => {
    try {
      const response = await deleteCategory(slug);
      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.slug !== slug));
      } else {
        setError('Delete failed.');
        setShowErrorModal(true);
      }
    } catch {
      setError('Error deleting category.');
      setShowErrorModal(true);
    }
  }, []);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const added = editMode
          ? await updateCategory(newCategory.oldSlug!, newCategory)
          : await addCategory({
              ...newCategory,
              content_type_id: contentTypeId ?? 0,
            });

        const updated = editMode
          ? categories.map((cat) => (cat.id === added.id ? added : cat))
          : [...categories, added];

        setCategories(updated);
        setShowAddForm(false);
        setEditMode(false);
        setNewCategory({ name: '', slug: '', description: '', parent: null });
      } catch {
        setError('Error saving category.');
        setShowErrorModal(true);
      } finally {
        setSubmitting(false);
      }
    },
    [editMode, newCategory, contentTypeId, categories]
  );

  const handleEdit = useCallback(
    (cat: Category) => {
      setNewCategory({
        id: cat.id,
        oldSlug: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? '',
        parent: cat.parent ?? null,
        content_type_id: contentTypeId,
      });
      setShowAddForm(true);
      setEditMode(true);
    },
    [contentTypeId]
  );

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCategory({ ...newCategory, name, slug: slugify(name) });
  };

  const renderCategories = useMemo(() => {
    const recursive = (cats: Category[], level: number = 0): React.ReactNode =>
      cats.map((cat) => (
        <React.Fragment key={cat.id}>
          <tr className="hover:bg-gray-50">
            <td className="py-2 px-4 border-b">
              {'— '.repeat(level) + cat.name}
            </td>
            <td className="py-2 px-4 border-b">{cat.slug}</td>
            <td className="py-2 px-4 border-b">{cat.description}</td>
            <td className="py-2 px-4 border-b space-x-2">
              <button
                onClick={() => handleEdit(cat)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.slug)}
                className="text-red-500 hover:underline text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
          {cat.children && recursive(cat.children, level + 1)}
        </React.Fragment>
      ));
    return recursive(categories);
  }, [categories, handleDelete, handleEdit]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="relative">
      {submitting && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div
        className={`p-6 bg-white rounded transition-opacity ${submitting ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Categories
          </h2>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditMode(false);
              setNewCategory({
                name: '',
                slug: '',
                description: '',
                parent: null,
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddCategory}
            className="mb-6 space-y-4 border rounded p-4 bg-gray-50"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={handleNameChange}
                className="mt-1 block w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, slug: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Parent
              </label>
              <select
                value={newCategory.parent ? String(newCategory.parent) : ''}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    parent: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="mt-1 block w-full border border-gray-300 p-2 rounded"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editMode ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <table className="w-full table-auto border border-gray-200 bg-white shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left text-sm font-medium">
                  Name
                </th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium">
                  Slug
                </th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium">
                  Description
                </th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{renderCategories}</tbody>
          </table>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default PostCategory;
