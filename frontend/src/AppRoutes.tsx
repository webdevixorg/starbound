import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthenticatedRoutes from './context/AuthenticatedRoutes';
import { useAuth } from './context/AuthContext';
import ProfileLayout from './layouts/ProfileLayout';
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home/Home';
import Posts from './pages/Posts';
import SinglePost from './pages/SinglePost';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
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

import AdsListingPage from './pages/Products/Products';
import AdDetailPage from './pages/ProductsSingle';
import UserProfilePage from './pages/UserProfilePage';
import PostList from './pages/PostList';
import AddPost from './pages/AddPost';

import ProductList from './pages/PostList';
import Category from './pages/Category';

import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import CheckOut from './pages/CheckOut';
import OrderReceived from './pages/OderRecieved';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const defaultAuthenticatedRoute = '/';
  return (
    <Routes>
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

      {/* Protected Routes */}
      <Route
        element={<AuthenticatedRoutes isAuthenticated={isAuthenticated} />}
      >
        <Route element={<ProfileLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<History />} />

          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/feedback" element={<Feedback />} />
          {/* Conditionally render admin routes */}
          {role === 'admin' && (
            <>
              <Route path="/posts/list" element={<PostList />} />
              <Route path="/posts/:slug/edit" element={<AddPost />} />
              <Route path="/posts/add-new" element={<AddPost />} />
              <Route path="/posts/categories" element={<Category />} />
              <Route path="/products/list" element={<ProductList />} />
              <Route path="/products/:slug/edit" element={<AddProduct />} />
              <Route path="/products/add-new" element={<AddProduct />} />
              <Route path="/products/categories" element={<Category />} />
            </>
          )}
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:slug" element={<SinglePost />} />
        <Route path="/faq/" element={<FAQPage />} />
        <Route path="*" element={<NotFound />} />

        <Route path="/products" element={<AdsListingPage />} />
        <Route path="/products/:slug" element={<AdDetailPage />} />
        <Route path="/products/categories/:slug" element={<AdsListingPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route
          path="/checkout/order-received/:orderId"
          element={<OrderReceived />}
        />

        <Route path="/profile" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
