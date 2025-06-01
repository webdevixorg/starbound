import React, { useState } from 'react';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: 1,
      title: 'Best attractions in Sri Lanka?',
      content: 'What are the top must-see places for first-time visitors?',
      author: 'TravelGuru99',
      date: '2025-06-01',
    },
    {
      id: 2,
      title: 'Maldives in July',
      content: 'Is July a good time to visit Maldives with family?',
      author: 'IslandLover',
      date: '2025-05-30',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAddPost = () => {
    if (!newTitle || !newContent) return;
    const newPost: ForumPost = {
      id: posts.length + 1,
      title: newTitle,
      content: newContent,
      author: 'Anonymous',
      date: new Date().toISOString().split('T')[0],
    };
    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Community Forum
      </h1>

      {/* New Post Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">Start a Discussion</h2>
        <input
          type="text"
          className="w-full border rounded px-4 py-2 mb-4"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-4 py-2 mb-4"
          rows={4}
          placeholder="What's on your mind?"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <button
          onClick={handleAddPost}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Post
        </button>
      </div>

      {/* Post List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
            <p className="text-gray-700 mt-2">{post.content}</p>
            <div className="text-sm text-gray-500 mt-4">
              Posted by {post.author} on {post.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
