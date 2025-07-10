import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message, Participant } from '../types/types'; // Adjust imports as needed
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
} from '../services/api'; // Adjust imports as needed
import { useAuth } from '../context/AuthContext'; // Import useAuth hook from AuthContext
import ProfileImage from '../components/UI/ProfileImage/ProfileImage';
import ImageIcon from '../components/UI/Icons/Image';
import PaperPlaneIcon from '../components/UI/Icons/PaperPlane';
import PaperClipIcon from '../components/UI/Icons/PaperClip';
import SmileIcon from '../components/UI/Icons/Smile';

const ChatContainer: React.FC = () => {
  const { isAuthenticated, profile } = useAuth(); // Access isAuthenticated and profile from AuthContext
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cachedMessages, setCachedMessages] = useState<{
    [key: number]: Message[];
  }>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const initialConversations = await fetchConversations();
        setConversations(initialConversations);

        if (initialConversations.length > 0) {
          const firstConversation = initialConversations[0];
          handleConversationSelect(firstConversation);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [cachedMessages]);

  const handleConversationSelect = async (conversation: Conversation) => {
    setIsLoading(true);

    if (cachedMessages[conversation.id]) {
      setSelectedConversation({
        ...conversation,
        messages: cachedMessages[conversation.id],
      });
      setIsLoading(false);
      return; // Messages are already cached, no need to fetch again
    }

    try {
      const messages = await fetchMessages(conversation.id);
      setCachedMessages((prev) => ({
        ...prev,
        [conversation.id]: messages,
      }));
      setSelectedConversation({
        ...conversation,
        messages: messages,
      });
    } catch (error) {
      console.error('Error fetching messages for conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !profile || messageInput.trim() === '') return;

    const newMessage: Message = {
      id: new Date().getTime(),
      sender: Number(profile.user.id),
      sender_name: profile.user.username,
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    try {
      await sendMessage(selectedConversation.id, newMessage);
      setCachedMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...prev[selectedConversation.id],
          newMessage,
        ],
      }));
      setSelectedConversation(
        (prev) =>
          prev && {
            ...prev,
            messages: [...prev.messages, newMessage],
          }
      );
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message to backend:', error);
    }
  };

  const renderMessageClass = (message: Message): any => {
    const isSent = profile && message.sender === Number(profile.user.id);
    return isSent ? 'sent' : 'received';
  };

  const formatDateHeader = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.participants.length === 2) {
      const otherParticipant = conversation.participants.find(
        (participant) => participant.id !== profile?.user.id
      );
      return otherParticipant
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
        : conversation.title;
    }
    return conversation.title;
  };

  const renderMessagesWithDateHeaders = (messages: Message[]) => {
    const messagesWithHeaders: JSX.Element[] = [];
    let currentDate: Date | null = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      if (!currentDate || !sameDate(currentDate, messageDate)) {
        currentDate = messageDate;
        messagesWithHeaders.push(
          <div
            key={message.id.toString() + '-date'}
            className="date-header text-center mt-3 mb-2"
          >
            {formatDateHeader(currentDate)}
          </div>
        );
      }

      messagesWithHeaders.push(
        <div
          key={message.id.toString()}
          className={`chat-bubble ${renderMessageClass(message)}`}
        >
          <ProfileImageInMessage message={message} />
          <div className="chat-bubble-content">
            <p>{message.content}</p>
            <span className="chat-time">
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

    return (
      <>
        {messagesWithHeaders}
        <div ref={chatMessagesRef} />
      </>
    );
  };

  const sameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const ProfileImageInMessage: React.FC<{ message: Message }> = ({
    message,
  }) => {
    const participant: Participant | undefined =
      selectedConversation?.participants.find(
        (participant) => participant.id === message.sender
      );

    if (!participant || !profile) return null;

    return (
      <div className="chat-bubble-img relative block mr-2">
        <ProfileImage
          alt="profile"
          src={typeof participant.image === 'string' ? participant.image : ''}
        />
      </div>
    );
  };

  if (!isAuthenticated) {
    return <p>Please SignIn to view messages.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="chat-container-wrapper">
      <div className="chat-container">
        <div className="message-list">
          <div className="message-list-header" ref={headerRef}>
            <h2>Conversations</h2>
          </div>
          <div className="message-list-content">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`message-item ${
                  selectedConversation?.id === conversation.id ? 'active' : ''
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="message-info">
                  <ProfileImageInList
                    conversation={conversation}
                    profile={profile}
                  />
                  <p>{getConversationTitle(conversation)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-window">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h2>{getConversationTitle(selectedConversation)}</h2>
              </div>
              <div className="chat-messages" ref={chatMessagesRef}>
                {selectedConversation.messages.length ? (
                  renderMessagesWithDateHeaders(selectedConversation.messages)
                ) : (
                  <p>No messages</p>
                )}
              </div>
            </>
          ) : (
            <p>Select a conversation to start chatting</p>
          )}
          <div className="chat-input-container">
            <div className="chat-input">
              <button className="icon-button left">
                <SmileIcon />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <button className="icon-button">
                <PaperClipIcon />
              </button>
              <button className="icon-button">
                <ImageIcon />
              </button>
              <button className="send-button" onClick={handleSendMessage}>
                <PaperPlaneIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileImageInList: React.FC<{
  conversation: Conversation;
  profile: any;
}> = ({ conversation, profile }) => {
  const otherParticipant: Participant | undefined =
    conversation.participants.find(
      (participant) => participant.id !== profile.user.id
    );

  if (!otherParticipant) return null;

  return (
    <ProfileImage
      alt="profile"
      src={
        typeof otherParticipant.image === 'string' ? otherParticipant.image : ''
      }
    />
  );
};

export default ChatContainer;
