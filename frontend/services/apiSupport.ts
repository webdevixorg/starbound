import axiosInstance from './AxiosInstance';

// Types for Contact Support
export interface SupportTicket {
  id: number;
  ticket_id: string;
  subject: string;
  message: string;
  category:
    | 'general'
    | 'technical'
    | 'billing'
    | 'feature_request'
    | 'bug_report'
    | 'account';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  contact_email?: string;
  contact_phone?: string;
  attachment?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user: number;
  assigned_to?: number;
}

export interface SupportMessage {
  id: number;
  message: string;
  is_staff_reply: boolean;
  attachment?: string;
  created_at: string;
  sender: number;
  support_ticket: number;
}

export interface CreateTicketData {
  subject: string;
  message: string;
  category: string;
  priority?: string;
  contact_email?: string;
  contact_phone?: string;
  attachment?: File;
}

export interface AddMessageData {
  message: string;
  attachment?: File;
}

// Contact Support API functions
export const contactSupportAPI = {
  // Get user's support tickets
  getTickets: async (): Promise<{
    results: SupportTicket[];
    count: number;
  }> => {
    const response = await axiosInstance.get('/contact-support/');
    return response.data;
  },

  // Get specific ticket details
  getTicket: async (id: number): Promise<SupportTicket> => {
    const response = await axiosInstance.get(`/contact-support/${id}/`);
    return response.data;
  },

  // Create new support ticket
  createTicket: async (data: CreateTicketData): Promise<SupportTicket> => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('category', data.category);
    if (data.priority) formData.append('priority', data.priority);
    if (data.contact_email)
      formData.append('contact_email', data.contact_email);
    if (data.contact_phone)
      formData.append('contact_phone', data.contact_phone);
    if (data.attachment) formData.append('attachment', data.attachment);

    const response = await axiosInstance.post('/contact-support/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Add message to existing ticket
  addMessage: async (
    ticketId: number,
    data: AddMessageData
  ): Promise<SupportMessage> => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.attachment) formData.append('attachment', data.attachment);

    const response = await axiosInstance.post(
      `/contact-support/${ticketId}/add_message/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Get ticket messages
  getMessages: async (ticketId: number): Promise<SupportMessage[]> => {
    const response = await axiosInstance.get(
      `/contact-support/${ticketId}/messages/`
    );
    return response.data;
  },
};

// Types for Help Center
export interface HelpCategory {
  id: number;
  name: string;
  description: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface HelpArticle {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category: number;
  category_name?: string;
  is_published: boolean;
  is_featured: boolean;
  order: number;
  view_count: number;
  helpful_votes: number;
  not_helpful_votes: number;
  meta_description?: string;
  keywords?: string;
  created_at: string;
  updated_at: string;
  author: number;
}

export interface ArticleVote {
  id: number;
  is_helpful: boolean;
  created_at: string;
}

// Help Center API functions
export const helpCenterAPI = {
  // Get all categories
  getCategories: async (): Promise<HelpCategory[]> => {
    const response = await axiosInstance.get('/help-categories/');
    return response.data;
  },

  // Get articles (with optional filtering)
  getArticles: async (params?: {
    category?: number;
    search?: string;
    featured?: boolean;
  }): Promise<{ results: HelpArticle[]; count: number }> => {
    const response = await axiosInstance.get('/help-articles/', {
      params,
    });
    return response.data;
  },

  // Get specific article
  getArticle: async (id: number): Promise<HelpArticle> => {
    const response = await axiosInstance.get(`/help-articles/${id}/`);
    return response.data;
  },

  // Vote on article
  voteArticle: async (id: number, isHelpful: boolean): Promise<ArticleVote> => {
    const response = await axiosInstance.post(`/help-articles/${id}/vote/`, {
      is_helpful: isHelpful,
    });
    return response.data;
  },

  // Search articles
  searchArticles: async (
    query: string
  ): Promise<{ results: HelpArticle[]; count: number }> => {
    const response = await axiosInstance.get('/help-articles/', {
      params: { search: query },
    });
    return response.data;
  },
};

// Types for Feedback
export interface Feedback {
  id: number;
  feedback_type:
    | 'general'
    | 'bug_report'
    | 'feature_request'
    | 'improvement'
    | 'compliment'
    | 'complaint';
  subject: string;
  message: string;
  overall_rating?: number;
  ease_of_use?: number;
  features?: number;
  customer_service?: number;
  contact_email?: string;
  allow_contact: boolean;
  status:
    | 'new'
    | 'reviewed'
    | 'in_progress'
    | 'implemented'
    | 'rejected'
    | 'closed';
  browser_info?: string;
  page_url?: string;
  screenshot?: string;
  attachment?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  user: number;
  assigned_to?: number;
}

export interface FeedbackResponse {
  id: number;
  message: string;
  is_public: boolean;
  created_at: string;
  responder: number;
  feedback: number;
}

export interface CreateFeedbackData {
  feedback_type: string;
  subject: string;
  message: string;
  overall_rating?: number;
  ease_of_use?: number;
  features?: number;
  customer_service?: number;
  contact_email?: string;
  allow_contact?: boolean;
  browser_info?: string;
  page_url?: string;
  screenshot?: File;
  attachment?: File;
}

export interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  feedback_by_type: Record<string, number>;
  feedback_by_status: Record<string, number>;
  recent_feedback: Feedback[];
}

// Feedback API functions
export const feedbackAPI = {
  // Get user's feedback
  getFeedback: async (): Promise<{ results: Feedback[]; count: number }> => {
    const response = await axiosInstance.get('/feedback/');
    return response.data;
  },

  // Get specific feedback
  getFeedbackItem: async (id: number): Promise<Feedback> => {
    const response = await axiosInstance.get(`/feedback/${id}/`);
    return response.data;
  },

  // Create new feedback
  createFeedback: async (data: CreateFeedbackData): Promise<Feedback> => {
    const formData = new FormData();
    formData.append('feedback_type', data.feedback_type);
    formData.append('subject', data.subject);
    formData.append('message', data.message);

    if (data.overall_rating !== undefined)
      formData.append('overall_rating', data.overall_rating.toString());
    if (data.ease_of_use !== undefined)
      formData.append('ease_of_use', data.ease_of_use.toString());
    if (data.features !== undefined)
      formData.append('features', data.features.toString());
    if (data.customer_service !== undefined)
      formData.append('customer_service', data.customer_service.toString());
    if (data.contact_email)
      formData.append('contact_email', data.contact_email);
    if (data.allow_contact !== undefined)
      formData.append('allow_contact', data.allow_contact.toString());
    if (data.browser_info) formData.append('browser_info', data.browser_info);
    if (data.page_url) formData.append('page_url', data.page_url);
    if (data.screenshot) formData.append('screenshot', data.screenshot);
    if (data.attachment) formData.append('attachment', data.attachment);

    const response = await axiosInstance.post('/feedback/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get feedback statistics
  getStats: async (): Promise<FeedbackStats> => {
    const response = await axiosInstance.get('/feedback/stats/');
    return response.data;
  },

  // Get feedback responses
  getResponses: async (feedbackId: number): Promise<FeedbackResponse[]> => {
    const response = await axiosInstance.get(
      `/feedback/${feedbackId}/responses/`
    );
    return response.data;
  },
};

// Utility functions
export const supportUtils = {
  // Get category display name
  getCategoryDisplay: (category: string): string => {
    const categories: Record<string, string> = {
      general: 'General',
      technical: 'Technical',
      billing: 'Billing',
      feature_request: 'Feature Request',
      bug_report: 'Bug Report',
      account: 'Account',
    };
    return categories[category] || category;
  },

  // Get priority display name and color
  getPriorityDisplay: (priority: string): { name: string; color: string } => {
    const priorities: Record<string, { name: string; color: string }> = {
      low: { name: 'Low', color: 'text-green-600' },
      medium: { name: 'Medium', color: 'text-yellow-600' },
      high: { name: 'High', color: 'text-orange-600' },
      urgent: { name: 'Urgent', color: 'text-red-600' },
    };
    return priorities[priority] || { name: priority, color: 'text-gray-600' };
  },

  // Get status display name and color
  getStatusDisplay: (status: string): { name: string; color: string } => {
    const statuses: Record<string, { name: string; color: string }> = {
      open: { name: 'Open', color: 'text-blue-600' },
      in_progress: { name: 'In Progress', color: 'text-yellow-600' },
      resolved: { name: 'Resolved', color: 'text-green-600' },
      closed: { name: 'Closed', color: 'text-gray-600' },
      reopened: { name: 'Reopened', color: 'text-purple-600' },
    };
    return statuses[status] || { name: status, color: 'text-gray-600' };
  },

  // Get feedback type display name
  getFeedbackTypeDisplay: (type: string): string => {
    const types: Record<string, string> = {
      general: 'General Feedback',
      bug_report: 'Bug Report',
      feature_request: 'Feature Request',
      improvement: 'Improvement Suggestion',
      complaint: 'Complaint',
      compliment: 'Compliment',
    };
    return types[type] || type;
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Get browser info
  getBrowserInfo: (): string => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'Server-side rendering';
  },

  // Get current page URL
  getCurrentPageUrl: (): string => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  },
};
