import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface ForumPost {
  id: number;
  user: User;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
}

// Mock API fetch
const fetchPosts = async (): Promise<ForumPost[]> => {
  return [
    {
      id: 1,
      user: { id: 1, name: 'Alice Johnson', avatar: '/avatars/alice.jpg' },
      content:
        'Just finished installing Tailwind CSS in my project! Loving the utility-first approach. ✨',
      createdAt: '2025-06-23T10:20:00Z',
      likes: 12,
      comments: 4,
    },
    {
      id: 2,
      user: { id: 2, name: 'Bob Smith', avatar: '/avatars/bob.jpg' },
      content:
        'Does anyone have tips for optimizing React context performance? 🤔',
      createdAt: '2025-06-22T17:45:00Z',
      likes: 8,
      comments: 2,
    },
    {
      id: 3,
      user: { id: 3, name: 'Carol Lee', avatar: '/avatars/carol.jpg' },
      content:
        'Check out my new blog post on Next.js incremental static regeneration!',
      createdAt: '2025-06-21T14:00:00Z',
      likes: 20,
      comments: 5,
    },
  ];
};

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    (async () => {
      const data = await fetchPosts();
      setPosts(data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    const newPost: ForumPost = {
      id: Date.now(),
      user: { id: 999, name: 'You', avatar: '/avatars/default.png' },
      content: newContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setNewContent('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>

      {/* New Post Box */}
      <div className="bg-white p-4 rounded-lg shadow">
        <textarea
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
          rows={3}
          placeholder="Share something with the community..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <p className="text-gray-500">Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex items-center mb-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {post.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="flex items-center text-gray-500 text-sm space-x-6">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 9l-2-2m0 0L10 9m2-2v6m8 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 0a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h10z"
                    />
                  </svg>
                  <span>{post.comments}</span>
                </button>
                <Link
                  to={`/forum/${post.id}`}
                  className="ml-auto text-blue-600 hover:underline"
                >
                  View Thread
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;
