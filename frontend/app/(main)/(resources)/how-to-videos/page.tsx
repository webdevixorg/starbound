'use client';

import React, { useState, useEffect } from 'react';

interface HowToVideo {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  video_url: string;
  views: number;
  rating: number;
  created_at: string;
  author: string;
  tags: string[];
}

const HowToVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<HowToVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchVideos = async () => {
      try {
        // Mock data - replace with actual API call
        const mockVideos: HowToVideo[] = [
          {
            id: 1,
            title: 'How to Install Car Audio System - Complete Guide',
            description:
              'Learn how to professionally install a car audio system from start to finish. Includes wiring diagrams and safety tips.',
            duration: '15:30',
            category: 'Audio Systems',
            difficulty: 'Intermediate',
            thumbnail: '/images/audio-install-thumb.jpg',
            video_url: 'https://example.com/video1',
            views: 12500,
            rating: 4.8,
            created_at: '2024-01-15',
            author: 'ProInstaller Mike',
            tags: ['audio', 'installation', 'wiring', 'car stereo'],
          },
          {
            id: 2,
            title: 'LED Headlight Installation Made Easy',
            description:
              'Step-by-step guide to replacing your halogen headlights with LED bulbs. No special tools required!',
            duration: '8:45',
            category: 'Lighting',
            difficulty: 'Beginner',
            thumbnail: '/images/led-install-thumb.jpg',
            video_url: 'https://example.com/video2',
            views: 8900,
            rating: 4.6,
            created_at: '2024-01-12',
            author: 'AutoLED Expert',
            tags: ['LED', 'headlights', 'bulbs', 'lighting'],
          },
          {
            id: 3,
            title: 'Cold Air Intake Installation Tutorial',
            description:
              'Boost your engine performance with this detailed cold air intake installation guide. Includes dyno results!',
            duration: '12:20',
            category: 'Performance Parts',
            difficulty: 'Intermediate',
            thumbnail: '/images/intake-install-thumb.jpg',
            video_url: 'https://example.com/video3',
            views: 15600,
            rating: 4.9,
            created_at: '2024-01-10',
            author: 'PerformancePro',
            tags: ['performance', 'intake', 'engine', 'horsepower'],
          },
          {
            id: 4,
            title: 'Interior Detailing: Deep Clean Your Car',
            description:
              "Professional techniques for deep cleaning your car's interior. Seats, dashboard, and carpet cleaning covered.",
            duration: '18:15',
            category: 'Interior',
            difficulty: 'Beginner',
            thumbnail: '/images/detail-thumb.jpg',
            video_url: 'https://example.com/video4',
            views: 22100,
            rating: 4.7,
            created_at: '2024-01-08',
            author: 'DetailKing',
            tags: ['detailing', 'cleaning', 'interior', 'maintenance'],
          },
          {
            id: 5,
            title: 'Advanced Paint Correction Techniques',
            description:
              'Master the art of paint correction with compound and polish. Remove swirls and scratches like a pro.',
            duration: '25:40',
            category: 'Exterior',
            difficulty: 'Advanced',
            thumbnail: '/images/paint-correction-thumb.jpg',
            video_url: 'https://example.com/video5',
            views: 9800,
            rating: 4.9,
            created_at: '2024-01-05',
            author: 'PaintPerfection',
            tags: ['paint', 'correction', 'polishing', 'detailing'],
          },
          {
            id: 6,
            title: 'Brake Pad Replacement Guide',
            description:
              'Safety-focused tutorial on replacing brake pads. Essential maintenance every car owner should know.',
            duration: '14:30',
            category: 'Maintenance',
            difficulty: 'Intermediate',
            thumbnail: '/images/brake-pads-thumb.jpg',
            video_url: 'https://example.com/video6',
            views: 18200,
            rating: 4.8,
            created_at: '2024-01-03',
            author: 'SafeDriving Tech',
            tags: ['brakes', 'maintenance', 'safety', 'repair'],
          },
        ];

        setVideos(mockVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const categories = [
    'all',
    'Audio Systems',
    'Lighting',
    'Performance Parts',
    'Interior',
    'Exterior',
    'Maintenance',
  ];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    const matchesSearch =
      searchTerm === '' ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading how-to videos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              How-To Videos
            </h1>
          </div>
          <p className="text-lg text-gray-600 ml-11">
            Learn from expert tutorials and step-by-step video guides
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search videos, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 py-2">
                  Categories:
                </span>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 py-2">
                  Difficulty:
                </span>
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedDifficulty === difficulty
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200'
                    }`}
                  >
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(video.difficulty)}`}
                >
                  {video.difficulty}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                    {video.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{video.author}</span>
                  <span>{formatViews(video.views)} views</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {video.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{video.rating}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {video.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{video.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HowToVideosPage;
