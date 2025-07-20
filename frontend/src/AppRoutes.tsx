import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthenticatedRoutes from './context/AuthenticatedRoutes';
import { useAuth } from './context/AuthContext';
import ProfileLayout from './layouts/ProfileLayout';
import MainLayout from './layouts/MainLayout';

// Common components
import NotFound from './pages/NotFound';

// Authentication pages
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/RestPassword';

// Home and content pages
import Home from './pages/home/Home';
import Posts from './pages/Posts';
import SinglePost from './pages/SinglePost';

// Protected dashboard pages
import Dashboard from './pages/Dashboard';
import FAQPage from './pages/Faq';
import EditProfile from './pages/EditProfile';
import HelpCenter from './pages/HelpCenter';
import Feedback from './pages/Feedback';
import ContactSupport from './pages/ContacSupport';
import Updates from './pages/Updates';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import History from './pages/History';
import Wishlist from './pages/WishList';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import LoadingSpinner from './components/Common/Loading';

// Product/Ads related pages
import AdsListingPage from './pages/products/Products';
import AdDetailPage from './pages/ProductsSingle';
import UserProfilePage from './pages/UserProfilePage';
import PostList from './pages/PostList';
import AddPost from './pages/AddPost';

// Admin content management
import ProductList from './pages/PostList';
import Category from './pages/Category';

// E-commerce pages
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import CheckOut from './pages/CheckOut';
import OrderReceived from './pages/OderRecieved';

// Static/informational pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import AboutUs from './pages/AboutUs';
import Career from './pages/Career';
import ContactUs from './pages/ContactUs';
import Forum from './pages/Forum';
import WarrantyAndReturn from './pages/UserProfilePage';
import HelpCenterFrontEnd from './components/PageComponents/HelpCenter/HelpCenterFrontEnd';
import CommonReviewList from './pages/CommonReviewList';
import ReviewList from './pages/ReviewList';

/**
 * Main application routing component
 * Handles route protection, layout switching, and role-based access
 */
const AppRoutes: React.FC = () => {
  // Get authentication state and user role from context
  const { isAuthenticated, loading, role } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  // Default route for authenticated users
  const defaultAuthenticatedRoute = '/';

  return (
    <Routes>
      {/* Public Authentication Routes */}
      {/* Redirect authenticated users away from auth pages */}
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to={defaultAuthenticatedRoute} />
          ) : (
            <SignUp />
          )
        }
      />
      <Route
        path="/signin"
        element={
          isAuthenticated ? (
            <Navigate to={defaultAuthenticatedRoute} />
          ) : (
            <SignIn />
          )
        }
      />

      {/* Password Reset Routes - Available to everyone */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes - Require Authentication */}
      <Route
        element={<AuthenticatedRoutes isAuthenticated={isAuthenticated} />}
      >
        {/* Profile/Dashboard Layout - Protected pages with sidebar navigation */}
        <Route element={<ProfileLayout />}>
          {/* User Dashboard and Profile Management */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<History />} />
          <Route path="/all-reviews" element={<CommonReviewList />} />
          <Route path="/reviews" element={<ReviewList />} />

          {/* Communication and Support */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Admin-Only Routes - Content Management */}
          {/* Only render these routes if user has admin role */}
          {role === 'admin' && (
            <>
              {/* Blog/Post Management */}
              <Route path="/posts/list" element={<PostList />} />
              <Route path="/posts/:slug/edit" element={<AddPost />} />
              <Route path="/posts/add-new" element={<AddPost />} />
              <Route path="/posts/categories" element={<Category />} />

              {/* Product Management */}
              <Route path="/products/list" element={<ProductList />} />
              <Route path="/products/:slug/edit" element={<AddProduct />} />
              <Route path="/products/add-new" element={<AddProduct />} />
              <Route path="/products/categories" element={<Category />} />
            </>
          )}
        </Route>
      </Route>

      {/* Public Routes - Main Website Layout */}
      <Route element={<MainLayout />}>
        {/* Homepage and Content Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:slug" element={<SinglePost />} />

        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<NotFound />} />

        {/* Product/Marketplace Pages */}
        <Route path="/products" element={<AdsListingPage />} />
        <Route path="/products/:slug" element={<AdDetailPage />} />
        <Route path="/products/categories/:slug" element={<AdsListingPage />} />

        {/* E-commerce Flow */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route
          path="/checkout/order-received/:orderId"
          element={<OrderReceived />}
        />

        {/* User Profile (Public View) */}
        <Route path="/profile" element={<UserProfilePage />} />

        {/* Static/Informational Pages */}
        <Route path="/about-us/" element={<AboutUs />} />
        <Route path="/faq/" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/Careers" element={<Career />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/warranty-and-return" element={<WarrantyAndReturn />} />
        <Route path="/helpcenter" element={<HelpCenterFrontEnd />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
