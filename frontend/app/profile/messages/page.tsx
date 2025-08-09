'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchConversations, fetchMessages, sendMessage } from '@/services/api';
import { Conversation, Message, Participant } from '@/types/types';
import LoadingSpinner from '@/components/Common/Loading';
import ProfileImage from '@/components/UI/ProfileImage/ProfileImage';
import ImageIcon from '@/components/UI/Icons/Image';
import PaperPlaneIcon from '@/components/UI/Icons/PaperPlane';
import PaperClipIcon from '@/components/UI/Icons/PaperClip';
import SmileIcon from '@/components/UI/Icons/Smile';
import ModalAlert from '@/components/Modals/ModalAlert';

// Types for better type safety
interface CachedMessages {
  [key: number]: Message[];
}

interface ChatContainerState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messageInput: string;
  isLoading: boolean;
  cachedMessages: CachedMessages;
  error: string | null;
  showErrorModal: boolean;
  isClient: boolean;
  isSending: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // State management with better type safety
  const [state, setState] = useState<ChatContainerState>({
    conversations: [],
    selectedConversation: null,
    messageInput: '',
    isLoading: true,
    cachedMessages: {},
    error: null,
    showErrorModal: false,
    isClient: false,
    isSending: false,
  });

  // Refs for DOM manipulation
  const headerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Ensure client-side rendering
  useEffect(() => {
    setState((prev) => ({ ...prev, isClient: true }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isClient && !user) {
      router.push('/auth/login');
    }
  }, [user, router, state.isClient]);

  // Fetch initial conversations
  useEffect(() => {
    if (!state.isClient || !user) return;

    const fetchInitialData = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const initialConversations = await fetchConversations();
        setState((prev) => ({
          ...prev,
          conversations: initialConversations,
          isLoading: false,
        }));

        // Auto-select first conversation if available
        if (initialConversations.length > 0) {
          await handleConversationSelect(initialConversations[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to load conversations. Please try again.',
          showErrorModal: true,
          isLoading: false,
        }));
      }
    };

    fetchInitialData();
  }, [state.isClient, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [state.selectedConversation?.messages, state.cachedMessages]);

  // Handle conversation selection with caching
  const handleConversationSelect = useCallback(
    async (conversation: Conversation) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Check if messages are already cached
      if (state.cachedMessages[conversation.id]) {
        setState((prev) => ({
          ...prev,
          selectedConversation: {
            ...conversation,
            messages: prev.cachedMessages[conversation.id],
          },
          isLoading: false,
        }));
        return;
      }

      try {
        const messages = await fetchMessages(conversation.id);

        setState((prev) => ({
          ...prev,
          cachedMessages: {
            ...prev.cachedMessages,
            [conversation.id]: messages,
          },
          selectedConversation: {
            ...conversation,
            messages: messages,
          },
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to load messages. Please try again.',
          showErrorModal: true,
          isLoading: false,
        }));
      }
    },
    [state.cachedMessages]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!state.selectedConversation || !profile || !state.messageInput.trim()) {
      return;
    }

    setState((prev) => ({ ...prev, isSending: true }));

    const newMessage: Message = {
      id: Date.now(), // Better temporary ID
      sender: Number(profile.user.id),
      sender_name: profile.user.username,
      content: state.messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    setState((prev) => ({
      ...prev,
      cachedMessages: {
        ...prev.cachedMessages,
        [prev.selectedConversation!.id]: [
          ...prev.cachedMessages[prev.selectedConversation!.id],
          newMessage,
        ],
      },
      selectedConversation: prev.selectedConversation
        ? {
            ...prev.selectedConversation,
            messages: [...prev.selectedConversation.messages, newMessage],
          }
        : null,
      messageInput: '',
    }));

    try {
      await sendMessage(state.selectedConversation.id, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);

      // Revert optimistic update on failure
      setState((prev) => {
        if (!prev.selectedConversation) return prev;

        return {
          ...prev,
          cachedMessages: {
            ...prev.cachedMessages,
            [prev.selectedConversation.id]: prev.cachedMessages[
              prev.selectedConversation.id
            ].filter((msg) => msg.id !== newMessage.id),
          },
          selectedConversation: {
            ...prev.selectedConversation,
            messages: prev.selectedConversation.messages.filter(
              (msg) => msg.id !== newMessage.id
            ),
          },
          error: 'Failed to send message. Please try again.',
          showErrorModal: true,
        };
      });
    } finally {
      setState((prev) => ({ ...prev, isSending: false }));
    }
  }, [state.selectedConversation, profile, state.messageInput]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, messageInput: e.target.value }));
    },
    []
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Utility functions
  const renderMessageClass = useCallback(
    (message: Message): string => {
      return profile && message.sender === Number(profile.user.id)
        ? 'sent'
        : 'received';
    },
    [profile]
  );

  const formatDateHeader = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getConversationTitle = useCallback(
    (conversation: Conversation): string => {
      if (conversation.participants.length === 2) {
        const otherParticipant = conversation.participants.find(
          (participant) => participant.id !== profile?.user.id
        );
        return otherParticipant
          ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
          : conversation.title;
      }
      return conversation.title;
    },
    [profile]
  );

  const sameDate = useCallback((date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  // Memoized components
  const ProfileImageInMessage = useMemo(
    () =>
      React.memo<{ message: Message }>(({ message }) => {
        const participant = state.selectedConversation?.participants.find(
          (p) => p.id === message.sender
        );

        if (!participant || !profile) return null;

        return (
          <div className="chat-bubble-img relative block mr-2">
            <ProfileImage
              alt={`${participant.first_name} ${participant.last_name}`}
              src={
                typeof participant.image === 'string' ? participant.image : ''
              }
            />
          </div>
        );
      }),
    [state.selectedConversation, profile]
  );

  const ProfileImageInList = useMemo(
    () =>
      React.memo<{ conversation: Conversation }>(({ conversation }) => {
        const otherParticipant = conversation.participants.find(
          (participant) => participant.id !== profile?.user.id
        );

        if (!otherParticipant) return null;

        return (
          <ProfileImage
            alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
            src={
              typeof otherParticipant.image === 'string'
                ? otherParticipant.image
                : ''
            }
          />
        );
      }),
    [profile]
  );

  // Render messages with date headers
  const renderMessagesWithDateHeaders = useCallback(
    (messages: Message[]) => {
      const messagesWithHeaders: JSX.Element[] = [];
      let currentDate: Date | null = null;

      messages.forEach((message) => {
        const messageDate = new Date(message.timestamp);

        if (!currentDate || !sameDate(currentDate, messageDate)) {
          currentDate = messageDate;
          messagesWithHeaders.push(
            <div
              key={`${message.id}-date`}
              className="date-header text-center mt-3 mb-2 text-sm text-gray-500 font-medium"
            >
              {formatDateHeader(currentDate)}
            </div>
          );
        }

        messagesWithHeaders.push(
          <div
            key={message.id}
            className={`chat-bubble ${renderMessageClass(
              message
            )} mb-4 flex items-end ${
              renderMessageClass(message) === 'sent'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {renderMessageClass(message) === 'received' && (
              <ProfileImageInMessage message={message} />
            )}
            <div
              className={`chat-bubble-content max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                renderMessageClass(message) === 'sent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span
                className={`chat-time text-xs mt-1 block ${
                  renderMessageClass(message) === 'sent'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {messageDate.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        );
      });

      return messagesWithHeaders;
    },
    [ProfileImageInMessage, renderMessageClass, formatDateHeader, sameDate]
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-600">
            Stay connected with your conversations
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200" ref={headerRef}>
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversations
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {state.conversations.length > 0 ? (
                  state.conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        state.selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border-blue-200'
                          : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <ProfileImageInList conversation={conversation} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getConversationTitle(conversation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {state.selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getConversationTitle(state.selectedConversation)}
                    </h2>
                  </div>

                  {/* Messages Area */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4 overflow-y-scroll"
                    ref={chatMessagesRef}
                  >
                    {state.selectedConversation.messages.length > 0 ? (
                      renderMessagesWithDateHeaders(
                        state.selectedConversation.messages
                      )
                    ) : (
                      <div className="text-center text-gray-500 mt-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add emoji"
                      >
                        <SmileIcon />
                      </button>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={state.messageInput}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          disabled={state.isSending}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>

                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Attach file"
                      >
                        <PaperClipIcon />
                      </button>

                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add image"
                      >
                        <ImageIcon />
                      </button>

                      <button
                        onClick={handleSendMessage}
                        disabled={!state.messageInput.trim() || state.isSending}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Send message"
                      >
                        <PaperPlaneIcon />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">
                      Choose a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ModalAlert
        isOpen={state.showErrorModal}
        title="Error"
        message={state.error || 'An unexpected error occurred.'}
        onClose={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        onConfirm={() =>
          setState((prev) => ({ ...prev, showErrorModal: false, error: null }))
        }
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
