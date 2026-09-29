    import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
    import OnboardingWizard from './pages/auth/OnboardingWizard'
    import Login from './pages/auth/Login'
    import ProtectedRoute from './components/ProtectedRoute'
    import DashboardLayout from './layouts/DashboardLayout'
    import DashboardHome from './pages/dashboard/DashboardHome'
import Menu from './pages/dashboard/Menu'
import QRManagement from './pages/dashboard/QRManagement'
import RestaurantMenu from './pages/customer/RestaurantMenu'
import Checkout from './pages/customer/Checkout'
import Pay from './pages/customer/Pay'
import Kitchen from './pages/dashboard/Kitchen'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import Orders from './pages/dashboard/Orders'
import ComingSoon from './pages/dashboard/ComingSoon'
import Payments from './pages/dashboard/Payments'
import Reports from './pages/dashboard/Reports'
import Settings from './pages/dashboard/Settings'
    function App() {
      return (
          <BrowserRouter>
                <Routes>
                        <Route path="/signup" element={<OnboardingWizard />} />
                                <Route path="/login" element={<Login />} />
                                        <Route path="/" element={<h1 style={{ padding: 24 }}>Restaurant SaaS</h1>} />
                                        <Route path="/r/:restaurantSlug/checkout" element={<Checkout />} />
                                        <Route path="/r/:restaurantSlug/pay" element={<Pay />} />
                                        <Route path="/r/:restaurantSlug/order-confirmation" element={<OrderConfirmation />} />
                                    
                                        
                                                <Route path="/r/:restaurantSlug" element={<RestaurantMenu />} />
                                                       <Route path="/dashboard"
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
                                                                                                                                            <Route path="settings" element={<Settings />} />
                                                                                                                                            <Route path="*" element={<ComingSoon />} />
                                                                                                                                              </Route>
                                                                                                                                                    </Routes>
                                                                                                                                                        </BrowserRouter>
                                                                                                                                                          )
                                                                                                                                                          }

                                                                                                                                                          export default App
                                                                                                                                                                                                                                                                        