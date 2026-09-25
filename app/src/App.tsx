    import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
    import OnboardingWizard from './pages/auth/OnboardingWizard'
    import Login from './pages/auth/Login'
    import ProtectedRoute from './components/ProtectedRoute'
    import DashboardLayout from './layouts/DashboardLayout'
    import DashboardHome from './pages/dashboard/DashboardHome'
import Menu from './pages/dashboard/Menu'
import QRManagement from './pages/dashboard/QRManagement'
import RestaurantMenu from './pages/customer/RestaurantMenu'
    function App() {
      return (
          <BrowserRouter>
                <Routes>
                        <Route path="/signup" element={<OnboardingWizard />} />
                                <Route path="/login" element={<Login />} />
                                        <Route path="/" element={<h1 style={{ padding: 24 }}>Restaurant SaaS</h1>} />
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
                                                                                                                                              </Route>
                                                                                                                                                    </Routes>
                                                                                                                                                        </BrowserRouter>
                                                                                                                                                          )
                                                                                                                                                          }

                                                                                                                                                          export default App
                                                                                                                                                                                                                                                                        