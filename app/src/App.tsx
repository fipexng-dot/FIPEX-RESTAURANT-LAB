import Landing from "./pages/Landing";
import Track from "./pages/Track";
import Deliver from "./pages/Deliver";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupShell from "./pages/auth/SignupShell";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Menu from "./pages/dashboard/Menu";
import QRManagement from "./pages/dashboard/QRManagement";
import RestaurantMenu from "./pages/customer/RestaurantMenu";
import Checkout from "./pages/customer/Checkout";
import Pay from "./pages/customer/Pay";
import Kitchen from "./pages/dashboard/Kitchen";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import Orders from "./pages/dashboard/Orders";
import ComingSoon from "./pages/dashboard/ComingSoon";
import Payments from "./pages/dashboard/Payments";
import Reports from "./pages/dashboard/Reports";
import Notifications from "./pages/dashboard/Notifications";
import Staff from "./pages/dashboard/Staff";
import Settings from "./pages/dashboard/Settings";
import Customers from "./pages/dashboard/Customers";
import CounterOrder from "./pages/dashboard/CounterOrder";
import ShareLink from "./pages/dashboard/ShareLink";
import Receipt from "./pages/receipt/Receipt";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupShell />} />
        <Route path="/login" element={<Login />} />
        <Route path="/receipt/:key" element={<Receipt />} />
        <Route path="/track/:key" element={<Track />} />
        <Route path="/deliver/:token" element={<Deliver />} />
        <Route
          path="/"
          element={<Landing />}
        />
        <Route path="/r/:restaurantSlug/checkout" element={<Checkout />} />
        <Route path="/r/:restaurantSlug/pay" element={<Pay />} />
        <Route
          path="/r/:restaurantSlug/order-confirmation"
          element={<OrderConfirmation />}
        />

        <Route path="/r/:restaurantSlug" element={<RestaurantMenu />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="menu" element={<Menu />} />
          <Route path="tables" element={<QRManagement />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="customers" element={<Customers />} />
          <Route path="staff" element={<Staff />} />
          <Route path="settings" element={<Settings />} />
          <Route path="counter" element={<CounterOrder />} />
          <Route path="share" element={<ShareLink />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
