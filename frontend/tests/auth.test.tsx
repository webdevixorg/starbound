import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  loading: false,
  signin: jest.fn(),
  signout: jest.fn(),
  user: null,
  role: null,
  profile: null,
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signin page correctly', async () => {
    const SignInPage = (await import('@/app/(auth)/signin/page')).default;

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <SignInPage />
      </React.Suspense>
    );

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const SignInPage = (await import('@/app/(auth)/signin/page')).default;

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <SignInPage />
      </React.Suspense>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthContext.signin).toHaveBeenCalled();
    });
  });
});
