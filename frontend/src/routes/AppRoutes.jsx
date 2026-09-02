import { Route, Routes } from 'react-router-dom';

import HomePage from '../pages/Home/Home';
import LoginPage from '../pages/Login/Login';
import RegisterPage from '../pages/Register/Register';
import OnboardingPage from '../pages/Onboarding/Onboarding';
import DashboardPage from '../pages/Dashboard/Dashboard';
import ProfilePage from '../pages/Profile/Profile';
import WorkoutsPage from '../pages/Workouts/Workouts';
import ProgressPage from '../pages/Progress/Progress';
import NutritionPage from '../pages/Nutrition/Nutrition';
import GoalsPage from '../pages/Goals/Goals';
import CaloriesCalculatorPage from '../pages/CaloriesCalculator/CaloriesCalculator';
import CalendarPage from '../pages/Calendar/Calendar';
import AnalyticsPage from '../pages/Analytics/Analytics';
import SettingsPage from '../pages/Settings/Settings';
import NotFoundPage from '../pages/NotFound/NotFound';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import AppLayout from '../layouts/AppLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminPartners from '../pages/Admin/AdminPartners';
import AdminCoachChat from '../pages/Admin/AdminCoachChat';
import AdminTickets from '../pages/Admin/AdminTickets';
import SupportTickets from '../pages/Support/SupportTickets';
import MembershipPage from '../pages/Membership/Membership';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPassword';
import ResetPasswordPage from '../pages/ResetPassword/ResetPassword';

// Shop Pages
import Shop from '../pages/Shop/Shop';
import ProductDetail from '../pages/Shop/ProductDetail';
import Cart from '../pages/Shop/Cart';
import Checkout from '../pages/Shop/Checkout';
import OrderHistory from '../pages/Shop/OrderHistory';

// Seller Pages
import SellerDashboard from '../pages/Seller/SellerDashboard';
import SellerOrders from '../pages/Seller/SellerOrders';
import SellerProducts from '../pages/Seller/SellerProducts';
import SellerSettings from '../pages/Seller/SellerSettings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* ===================== SHOP ROUTES ===================== */}
      {/* Shop listing & product detail are public (no auth needed) */}
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<ProductDetail />} />

      {/* Cart, Checkout, Orders require authentication */}
      <Route element={<AppLayout />}>
        <Route
          path="/shop/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* ===================== USER APP ROUTES ===================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calories-calculator"
          element={
            <ProtectedRoute>
              <CaloriesCalculatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <MembershipPage />
            </ProtectedRoute>
          }
        />

        {/* ===================== SELLER ROUTES ===================== */}
        <Route
          path="/seller"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <SellerRoute>
              <SellerOrders />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <SellerRoute>
              <SellerProducts />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/settings"
          element={
            <SellerRoute>
              <SellerSettings />
            </SellerRoute>
          }
        />
      </Route>

      {/* Admin Panel Layout */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/coach-chat" element={<AdminCoachChat />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/partners" element={<AdminPartners />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}