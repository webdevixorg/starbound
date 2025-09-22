'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  helpCenterAPI,
  HelpArticle,
  supportUtils,
} from '@/services/apiSupport';
import ModalAlert from '@/components/Modals/ModalAlert';

const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const articleId = parseInt(params.id as string);

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const articleData = await helpCenterAPI.getArticle(articleId);
      setArticle(articleData);
    } catch (err) {
      setError('Failed to load article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId, fetchArticle]);

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      setError('Please sign in to vote on articles');
      return;
    }

    if (hasVoted) {
      setError('You have already voted on this article');
      return;
    }

    try {
      setVoting(true);
      await helpCenterAPI.voteArticle(articleId, isHelpful);
      setHasVoted(true);
      setSuccess(
        `Thank you for your ${isHelpful ? 'positive' : 'negative'} feedback!`
      );

      // Refresh article to get updated vote counts
      await fetchArticle();
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          'number' &&
        (err as { response: { status: number } }).response.status === 400
      ) {
        setError('You have already voted on this article');
        setHasVoted(true);
      } else {
        setError('Failed to submit vote. Please try again.');
      }
      console.error('Error voting on article:', err);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The requested help article could not be found.
          </p>
          <button
            onClick={() => router.push('/support/help')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Help Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/support/help')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Help Center
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {article.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>{article.view_count} views</span>
                <span>•</span>
                <span>
                  Updated {supportUtils.formatDate(article.updated_at)}
                </span>
                {article.is_featured && (
                  <>
                    <span>•</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Featured
                    </span>
                  </>
                )}
              </div>
              {article.summary && (
                <p className="text-lg text-gray-600">{article.summary}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <ModalAlert
            isOpen={!!success}
            onClose={() => setSuccess(null)}
            title="Thank You"
            message={success}
          />
        )}

        {/* Error Message */}
        {error && (
          <ModalAlert
            isOpen={!!error}
            onClose={() => setError(null)}
            title="Error"
            message={error}
          />
        )}

        {/* Article Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div
              className="prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Article Footer */}
          <div className="border-t border-gray-200 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  Was this article helpful?
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voting || hasVoted}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      hasVoted
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <span>👍</span>
                    <span>Yes ({article.helpful_votes})</span>
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    disabled={voting || hasVoted}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      hasVoted
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <span>👎</span>
                    <span>No ({article.not_helpful_votes})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/support/contact/new')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Still need help?
                </button>
              </div>
            </div>

            {hasVoted && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Thank you for your feedback! If this article didn&apos;t
                  answer your question, you can
                  <button
                    onClick={() => router.push('/support/contact/new')}
                    className="font-medium underline hover:no-underline"
                  >
                    contact our support team
                  </button>{' '}
                  for personalized assistance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Articles or Contact Support */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need More Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help.
            </p>
            <button
              onClick={() => router.push('/support/contact/new')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Give Feedback
            </h3>
            <p className="text-gray-600 mb-4">
              Help us improve our help center by sharing your thoughts and
              suggestions.
            </p>
            <button
              onClick={() => router.push('/support/feedback')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Article Metadata */}
        {article.keywords && (
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Related Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.keywords.split(',').map((keyword, index) => (
                <span
                  key={index}
                  className="inline-block bg-white px-3 py-1 rounded-full text-sm text-gray-700"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
