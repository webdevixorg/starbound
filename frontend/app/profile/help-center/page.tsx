'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/Common/Loading';
import ModalAlert from '@/components/Modals/ModalAlert';
import InlineLoaderIcon from '@/components/UI/Icons/InlineLoader';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  messages: number;
  last_response?: string;
}

interface HelpCenterState {
  loading: boolean;
  tickets: Ticket[];
  filteredTickets: Ticket[];
  error: string | null;
  showErrorModal: boolean;
  isClient: boolean;
  submittingTicket: boolean;
}

const HELP_CATEGORIES = [
  { id: 'all', label: 'All Tickets', icon: '📋' },
  { id: 'open', label: 'Open Tickets', icon: '🔓' },
  { id: 'in-progress', label: 'In Progress', icon: '⏳' },
  { id: 'resolved', label: 'Resolved', icon: '✅' },
  { id: 'closed', label: 'Closed', icon: '🔒' },
] as const;

const TICKET_CATEGORIES = [
  { value: 'general', label: 'General Support' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Payment' },
  { value: 'account', label: 'Account Management' },
  { value: 'booking', label: 'Booking Assistance' },
  { value: 'refund', label: 'Refund Request' },
] as const;

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
} as const;

// Mock data for development - remove when API is ready
const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    subject: 'Unable to access my booking',
    status: 'open',
    priority: 'medium',
    category: 'booking',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    messages: 3,
    last_response: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    subject: 'Refund request for cancelled trip',
    status: 'in-progress',
    priority: 'high',
    category: 'refund',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messages: 7,
    last_response: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    subject: 'Account verification issue',
    status: 'resolved',
    priority: 'low',
    category: 'account',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    messages: 5,
    last_response: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('tab') || 'all'
  );

  const [state, setState] = useState<HelpCenterState>({
    loading: true,
    tickets: [],
    filteredTickets: [],
    error: null,
    showErrorModal: false,
    isClient: false,
    submittingTicket: false,
  });

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium' as const,
    description: '',
  });

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

  // Load tickets
  const loadTickets = useCallback(async () => {
    if (!state.isClient || !user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const tickets = MOCK_TICKETS;

      // Uncomment when API is ready:
      // const response = await fetch('/api/support/tickets', {
      //   headers: {
      //     'Authorization': `Bearer ${await user.getAccessToken()}`, // Fixed: Use proper auth method
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to fetch tickets');
      // }

      // const tickets = await response.json();

      setState((prev) => ({
        ...prev,
        tickets,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load support tickets. Please try again.',
        showErrorModal: true,
        loading: false,
      }));
    }
  }, [state.isClient, user]);

  // Initial load
  useEffect(() => {
    if (state.isClient && user) {
      loadTickets();
    }
  }, [loadTickets, state.isClient, user]);

  // Filter tickets based on active tab
  useEffect(() => {
    const filtered =
      activeTab === 'all'
        ? state.tickets
        : state.tickets.filter((ticket) => ticket.status === activeTab);

    setState((prev) => ({ ...prev, filteredTickets: filtered }));
  }, [state.tickets, activeTab]);

  // Handle tab change with URL update
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams);
      params.set('tab', tab);
      router.replace(`/profile/help-center?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle new ticket form submission
  const handleNewTicketSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newTicket.subject.trim() || !newTicket.description.trim()) {
        setState((prev) => ({
          ...prev,
          error: 'Please fill in all required fields.',
          showErrorModal: true,
        }));
        return;
      }

      setState((prev) => ({ ...prev, submittingTicket: true }));

      try {
        // TODO: Replace with actual API call
        // For now, create a mock ticket
        const newTicketData: Ticket = {
          id: Date.now().toString(),
          subject: newTicket.subject,
          status: 'open',
          priority: newTicket.priority,
          category: newTicket.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: 1,
        };

        // Add to local state (replace with API call)
        setState((prev) => ({
          ...prev,
          tickets: [newTicketData, ...prev.tickets],
        }));

        // Uncomment when API is ready:
        // const response = await fetch('/api/support/tickets', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${await user.getAccessToken()}`, // Fixed: Use proper auth method
        //   },
        //   body: JSON.stringify({
        //     ...newTicket,
        //     userId: user.id,
        //     created_at: new Date().toISOString(),
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to create ticket');
        // }

        // Reset form and reload tickets
        setNewTicket({
          subject: '',
          category: 'general',
          priority: 'medium',
          description: '',
        });
        setShowNewTicketForm(false);
        // await loadTickets(); // Remove when using local state update
      } catch (error) {
        console.error('Error creating ticket:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to create support ticket. Please try again.',
          showErrorModal: true,
        }));
      } finally {
        setState((prev) => ({ ...prev, submittingTicket: false }));
      }
    },
    [newTicket, user]
  );

  // Handle new ticket form changes
  const handleNewTicketChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setNewTicket((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get priority badge
  const getPriorityBadge = useCallback((priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find((p) => p.value === priority);
    return priorityConfig || PRIORITY_LEVELS[1]; // Default to medium
  }, []);

  // Get ticket count for category
  const getTicketCount = useCallback(
    (categoryId: string) => {
      if (categoryId === 'all') {
        return state.tickets.length;
      }
      return state.tickets.filter((ticket) => ticket.status === categoryId)
        .length;
    },
    [state.tickets]
  );

  // Memoized sidebar component
  const Sidebar = useMemo(
    () => (
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Help Center</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your support tickets
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {HELP_CATEGORIES.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleTabChange(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === category.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{category.icon}</span>
                  {category.label}
                  <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {getTicketCount(category.id)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowNewTicketForm(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Ticket
          </button>
        </div>
      </div>
    ),
    [activeTab, getTicketCount, handleTabChange]
  );

  // Loading skeleton for SSR compatibility
  if (!state.isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="w-64 bg-white border-r border-gray-200">
            <div className="animate-pulse p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {Sidebar}

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {HELP_CATEGORIES.find((c) => c.id === activeTab)?.label ||
                    'Help Center'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {state.filteredTickets.length} ticket
                  {state.filteredTickets.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Profile
              </button>
            </div>
          </div>

          {/* Tickets List */}
          <div className="p-8">
            {state.error && !state.showErrorModal && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{state.error}</p>
                  </div>
                </div>
              </div>
            )}

            {state.filteredTickets.length > 0 ? (
              <div className="space-y-4">
                {state.filteredTickets.map((ticket) => {
                  const priorityBadge = getPriorityBadge(ticket.priority);
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/profile/help-center/ticket/${ticket.id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {ticket.subject}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                STATUS_COLORS[ticket.status]
                              }`}
                            >
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge.color}`}
                            >
                              {priorityBadge.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            Category:{' '}
                            {TICKET_CATEGORIES.find(
                              (c) => c.value === ticket.category
                            )?.label || ticket.category}
                          </p>

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                              Created: {formatDate(ticket.created_at)}
                            </span>
                            <span>•</span>
                            <span>Messages: {ticket.messages}</span>
                            {ticket.last_response && (
                              <>
                                <span>•</span>
                                <span>
                                  Last response:{' '}
                                  {formatDate(ticket.last_response)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="ml-4">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all'
                    ? "You haven't created any support tickets yet."
                    : `No ${activeTab.replace('-', ' ')} tickets found.`}
                </p>
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Support Ticket
              </h3>
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleNewTicketSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newTicket.category}
                    onChange={handleNewTicketChange}
                    disabled={state.submittingTicket}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    required
                  >
                    {TICKET_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTicket.priority}
                    onChange={handleNewTicketChange}
                    disabled={state.submittingTicket}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    required
                  >
                    {PRIORITY_LEVELS.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={newTicket.subject}
                  onChange={handleNewTicketChange}
                  disabled={state.submittingTicket}
                  placeholder="Brief description of your issue"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={newTicket.description}
                  onChange={handleNewTicketChange}
                  disabled={state.submittingTicket}
                  placeholder="Please provide detailed information about your issue..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-vertical"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  disabled={state.submittingTicket}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    state.submittingTicket ||
                    !newTicket.subject.trim() ||
                    !newTicket.description.trim()
                  }
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.submittingTicket ? (
                    <>
                      <InlineLoaderIcon className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
