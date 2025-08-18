'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SafeImage from '@/components/UI/SafeImage';
import HtmlContent from '@/helpers/content';
import { fetchThreadBySlug, createThreadReply } from '@/services/forum';
import { getPublicImageUrl } from '@/helpers/media';

interface Thread {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: {
    profile: {
      image_path: string;
    };
    id: number;
    username: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  created_at: string;
  views: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  replies?: Reply[];
}

interface Reply {
  id: number;
  content: string;
  author: {
    profile: {
      image_path: string;
    };
    id: number;
    username: string;
  };
  created_at: string;
  is_solution?: boolean;
}

const ThreadPage: React.FC = () => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      loadThreadData();
    }
  }, [slug]);

  const loadThreadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const threadData = await fetchThreadBySlug(slug);

      setThread(threadData);

      // Handle replies - they might be included in the thread response or separate
      if (threadData.replies && Array.isArray(threadData.replies)) {
        setReplies(threadData.replies);
      } else {
        setReplies([]);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      console.error('Error loading thread:', error);

      if (err.response?.status === 404) {
        setError('Thread not found');
      } else {
        setError('Failed to load thread. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !thread) return;

    try {
      setReplyLoading(true);

      const reply = await createThreadReply(thread.slug, newReply);

      // Add the new reply to the list
      setReplies((prev) => [...prev, reply]);
      setNewReply('');

      // Update thread reply count
      setThread((prev) =>
        prev
          ? {
              ...prev,
              replies_count: prev.replies_count + 1,
            }
          : null
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error posting reply:', error);
      alert(err.message || 'Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-8 text-center">
          <div className="text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Thread Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              {error || "The thread you're looking for doesn't exist."}
            </p>
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
            >
              Back to Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Thread Content */}
        <div className="lg:w-2/3 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/forum"
              className="hover:text-blue-600 transition-colors"
            >
              Forum
            </Link>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
            {thread.category && (
              <>
                <Link
                  href={`/forum?category=${thread.category.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {thread.category.name}
                </Link>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
            <span className="text-gray-900 font-medium">Thread</span>
          </nav>

          {/* Thread Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-6">
              {/* Thread Meta */}
              <div className="flex items-center gap-3 mb-4">
                {thread.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path
                        fillRule="evenodd"
                        d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pinned
                  </span>
                )}
                {thread.is_locked && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Locked
                  </span>
                )}
                {thread.is_solved && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Solved
                  </span>
                )}
                {thread.category && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{
                      backgroundColor: thread.category.color || '#6B7280',
                    }}
                  >
                    {thread.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {thread.title}
              </h1>

              {/* Author & Stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <SafeImage
                      alt={thread.author.username || 'Author Avatar'}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                      images={[
                        {
                          image_path: getPublicImageUrl(
                            'profiles',
                            thread.author.id,
                            thread.author.profile.image_path
                          ),
                        },
                      ]}
                      width={400}
                      height={300}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {thread.author.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(thread.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {thread.views} views
                  </div>
                  <div className="flex items-center gap-1">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {thread.replies_count} replies
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-gray max-w-none">
                <HtmlContent htmlContent={thread.content || ''} />
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Replies ({replies.length})
            </h2>

            {replies.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-6 text-center">
                <p className="text-gray-500">
                  No replies yet. Be the first to respond!
                </p>
              </div>
            ) : (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    {/* Reply Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          <SafeImage
                            alt={reply.author.username || 'Author Avatar'}
                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                            images={[
                              {
                                image_path: getPublicImageUrl(
                                  'profiles',
                                  reply.author.id,
                                  reply.author.profile.image_path
                                ),
                              },
                            ]}
                            width={400}
                            height={300}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {reply.author.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {reply.is_solution && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Solution
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reply Content */}
                    <div className="prose prose-gray max-w-none text-sm">
                      <HtmlContent htmlContent={reply.content} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          {!thread.is_locked && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Post a Reply
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmitReply}>
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts or solution..."
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/60 rounded-xl text-sm 
                             placeholder:text-gray-400 text-gray-900 resize-none
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:bg-white/80
                             transition-all duration-200 ease-out"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={!newReply.trim() || replyLoading}
                      className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                               transition-all duration-200 ease-out font-medium text-sm
                               shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                               disabled:hover:bg-blue-500 disabled:active:scale-100"
                    >
                      {replyLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Posting...
                        </div>
                      ) : (
                        'Post Reply'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-1/3 space-y-6">
          {/* Thread Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50/60 rounded-lg transition-all duration-200">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Follow Thread</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50/60 rounded-lg transition-all duration-200">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span className="text-sm font-medium">Share Thread</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50/60 rounded-lg transition-all duration-200">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Report Issue</span>
              </button>
            </div>
          </div>

          {/* Thread Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">
                Thread Info
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Views</span>
                <span className="font-medium text-gray-900">
                  {thread.views}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Replies</span>
                <span className="font-medium text-gray-900">
                  {replies.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Author</span>
                <span className="font-medium text-gray-900">
                  {thread.author.username}
                </span>
              </div>
            </div>
          </div>

          {/* Related Threads */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">
                Related Discussions
              </h3>
            </div>
            <div className="divide-y divide-gray-100/70">
              {[1, 2, 3].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block p-4 hover:bg-gray-50/60 transition-colors duration-200"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    Turbo lag diagnosis and solutions
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>12 replies</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ThreadPage;
