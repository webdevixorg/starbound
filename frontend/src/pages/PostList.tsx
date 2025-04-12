import React, { useEffect, useState, useMemo } from 'react';
import { useContent } from '../context/ContentContext'; // Import the context hook

import { changePostStatus, deletePost, fetchPosts } from '../services/api'; // Ensure trashPost is imported
import { Post } from '../types/types'; // Adjust the path as necessary
import { Link, useLocation } from 'react-router-dom';
import { CategoryName } from '../helpers/fetching';

const PostList: React.FC = () => {
  const location = useLocation();
  const { contentTypes, loading: contentLoading } = useContent(); // Get contentTypes from context

  const [contentTypeId, setContentTypeId] = useState<number>(0);
  const [contentType, setContentType] = useState<string>('');
  const [nonTrashedPosts, setNonTrashedPosts] = useState<Post[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nonDeletedCurrentPage, setNonDeletedCurrentPage] = useState<number>(1);
  const [deletedCurrentPage, setDeletedCurrentPage] = useState<number>(1);
  const [nontrashedTotalPages, setNontrashedTotalPages] = useState<number>(1);
  const [trashedTotalPages, setTrashedTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10); // Number of posts per page
  const [activeTab, setActiveTab] = useState<string>('active'); // Active tab state
  const [status] = useState<string>('');

  const matchedContentType = useMemo(() => {
    if (Array.isArray(contentTypes)) {
      return contentTypes.find(
        (contentType: any) => contentType.id === contentTypeId
      );
    }
    return null;
  }, [contentTypes, contentTypeId]);

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
    if (contentLoading || !matchedContentType) return; // Skip if contentTypes or matchedContentType is not ready

    const loadPosts = async (page: number, isDeleted: boolean) => {
      try {
        if (isDeleted) {
          const status = 'Deleted';
          const deletedResponse = await fetchPosts(
            page,
            pageSize,
            status,
            '',
            matchedContentType.model
          );
          setTrashedPosts(deletedResponse.results);
          setTrashedTotalPages(Math.ceil(deletedResponse.count / pageSize)); // Calculate total pages
        } else {
          const nonDeletedResponse = await fetchPosts(
            page,
            pageSize,
            status,
            '',
            matchedContentType.model
          );
          setNonTrashedPosts(nonDeletedResponse.results);
          setNontrashedTotalPages(
            Math.ceil(nonDeletedResponse.count / pageSize)
          ); // Calculate total pages
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error); // Debugging: Log the error
        setError('Error fetching posts');
        setLoading(false);
      }
    };

    if (contentTypeId) {
      if (activeTab === 'trashed') {
        loadPosts(deletedCurrentPage, true);
      } else {
        loadPosts(nonDeletedCurrentPage, false);
      }
    }
  }, [contentTypeId, activeTab, nonDeletedCurrentPage, deletedCurrentPage]);

  const handleTrash = async (slug: string) => {
    try {
      await changePostStatus(slug, contentType, 'Deleted');
      setNonTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
      setTrashedTotalPages(Math.ceil(nonTrashedPosts.length / pageSize)); // Calculate total pages
    } catch (error) {
      console.error('Error Trashing post:', error);
      setError('Error Trashing post');
    }
  };

  const handleRestore = async (slug: string) => {
    try {
      await changePostStatus(slug, contentType, 'Published');
      setTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
    } catch (error) {
      console.error('Error restoring post:', error);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      // Call the deletePost function to delete the post from the server
      await deletePost(slug, contentType);

      // Update the state to remove the post from the list
      setTrashedPosts((prevPosts) =>
        prevPosts.filter((post) => post.slug !== slug)
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error deleting post');
    }
  };

  const handlePreviousPage = () => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage > 1) {
        setDeletedCurrentPage(deletedCurrentPage - 1);
      }
    } else {
      if (nonDeletedCurrentPage > 1) {
        setNonDeletedCurrentPage(nonDeletedCurrentPage - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (activeTab === 'trashed') {
      if (deletedCurrentPage < trashedTotalPages) {
        setDeletedCurrentPage(deletedCurrentPage + 1);
      }
    } else {
      if (nonDeletedCurrentPage < nontrashedTotalPages) {
        setNonDeletedCurrentPage(nonDeletedCurrentPage + 1);
      }
    }
  };

  const posts = activeTab === 'active' ? nonTrashedPosts : trashedPosts;
  const currentPage =
    activeTab === 'active' ? nonDeletedCurrentPage : deletedCurrentPage;
  const totalPages =
    activeTab === 'active' ? nontrashedTotalPages : trashedTotalPages;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Posts</h2>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 ${
            activeTab === 'active'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-300 text-gray-700'
          } rounded`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('trashed')}
          className={`px-4 py-2 ml-2 ${
            activeTab === 'trashed'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-300 text-gray-700'
          } rounded`}
        >
          Trash
        </button>
      </div>
      {posts && posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 text-left">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200">Title</th>
                <th className="py-2 px-4 border-b border-gray-200">Category</th>
                <th className="py-2 px-4 border-b border-gray-200">Date</th>
                <th className="py-2 px-4 border-b border-gray-200">Status</th>
                <th className="py-2 px-4 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts &&
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b border-gray-200 hover:text-blue-500">
                      <Link to={`/${contentType}s/${post.slug}/edit`}>
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {post.categories.map((category, index) => (
                        <React.Fragment>
                          <CategoryName categoryId={category} />
                          {index < post.categories.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </td>

                    <td className="py-2 px-4 border-b border-gray-200">
                      {new Date(post.date).toLocaleDateString()}
                    </td>

                    <td className="py-2 px-4 border-b border-gray-200">
                      {post.status}
                    </td>

                    <td className="py-2 px-4 border-b border-gray-200">
                      <a
                        href={`/${contentType}s/${post.slug}`}
                        className="text-blue-500 hover:underline mr-2"
                      >
                        View
                      </a>

                      {activeTab === 'active' && (
                        <>
                          <button
                            onClick={() => handleTrash(post.slug)}
                            className="text-red-500 hover:underline"
                          >
                            Trash
                          </button>
                        </>
                      )}

                      {activeTab === 'trashed' && (
                        <>
                          <button
                            onClick={() => handleRestore(post.slug)}
                            className="text-green-500 hover:underline"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(post.slug)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PostList;
