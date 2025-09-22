'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  contactSupportAPI,
  SupportTicket,
  SupportMessage,
  supportUtils,
} from '@/services/apiSupport';
import ModalAlert from '@/components/Modals/ModalAlert';

const TicketDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const ticketId = parseInt(params.id as string);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const fetchTicketDetails = useCallback(async () => {
    try {
      const ticketData = await contactSupportAPI.getTicket(ticketId);
      setTicket(ticketData);
    } catch (err) {
      setError('Failed to load ticket details');
      console.error('Error fetching ticket:', err);
    }
  }, [ticketId]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesData = await contactSupportAPI.getMessages(ticketId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
      fetchMessages();
    }
  }, [ticketId, fetchTicketDetails, fetchMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachment(file);
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    try {
      setMessageLoading(true);
      setError(null);

      await contactSupportAPI.addMessage(ticketId, {
        message: newMessage,
        attachment: attachment || undefined,
      });

      setNewMessage('');
      setAttachment(null);
      setSuccess('Message sent successfully');

      // Refresh messages
      await fetchMessages();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : 'Failed to send message. Please try again.';

      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setMessageLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

    switch (status) {
      case 'open':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'resolved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'reopened':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

    switch (priority) {
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to view support tickets.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!ticket && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The requested support ticket could not be found.
          </p>
          <button
            onClick={() => router.push('/profile/contact-support')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/profile/contact-support')}
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
            Back to Support Tickets
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <ModalAlert
            isOpen={!!success}
            onClose={() => setSuccess(null)}
            title="Success"
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

        {loading && !ticket ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : ticket ? (
          <>
            {/* Ticket Header */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {ticket.subject}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span className="font-medium">#{ticket.ticket_id}</span>
                      <span>•</span>
                      <span>
                        {supportUtils.getCategoryDisplay(ticket.category)}
                      </span>
                      <span>•</span>
                      <span>
                        Created {supportUtils.formatDate(ticket.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadgeClass(ticket.status)}>
                        {supportUtils.getStatusDisplay(ticket.status).name}
                      </span>
                      <span className={getPriorityBadgeClass(ticket.priority)}>
                        {supportUtils.getPriorityDisplay(ticket.priority).name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="px-6 py-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          You
                        </span>
                        <span className="text-xs text-gray-500">
                          {supportUtils.formatDate(ticket.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {ticket.message}
                      </div>
                      {ticket.attachment && (
                        <div className="mt-3">
                          <a
                            href={ticket.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Conversation
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No messages yet. Add a message below to continue the
                    conversation.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.is_staff_reply
                              ? 'bg-green-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          <span
                            className={`font-medium text-sm ${
                              message.is_staff_reply
                                ? 'text-green-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {message.is_staff_reply
                              ? 'S'
                              : user.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.is_staff_reply ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {supportUtils.formatDate(message.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {message.message}
                        </div>
                        {message.attachment && (
                          <div className="mt-2">
                            <a
                              href={message.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                              View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Message Form */}
            {ticket.status !== 'closed' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Add Message
                  </h3>
                </div>
                <form onSubmit={handleSubmitMessage} className="p-6">
                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>

                  {/* File Attachment */}
                  <div className="mb-4">
                    <label
                      htmlFor="message-attachment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Attachment (Optional)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="message-attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      {attachment && (
                        <span className="text-sm text-green-600">
                          {attachment.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={messageLoading || !newMessage.trim()}
                      className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {messageLoading && (
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {messageLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {ticket.status === 'closed' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      This ticket has been closed
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      You cannot add new messages to a closed ticket. If you
                      need further assistance, please create a new ticket.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TicketDetailPage;
