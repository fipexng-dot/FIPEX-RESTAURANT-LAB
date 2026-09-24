    import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
    import OnboardingWizard from './pages/auth/OnboardingWizard'
    import Login from './pages/auth/Login'
    import ProtectedRoute from './components/ProtectedRoute'
    import DashboardLayout from './layouts/DashboardLayout'
    import DashboardHome from './pages/dashboard/DashboardHome'

    function App() {
      return (
          <BrowserRouter>
                <Routes>
                        <Route path="/signup" element={<OnboardingWizard />} />
                                <Route path="/login" element={<Login />} />
                                        <Route path="/" element={<h1 style={{ padding: 24 }}>Restaurant SaaS</h1>} />
                                                <Route
                                                          path="/dashboard"
                                                                    element={
                                                                                <ProtectedRoute>
                                                                                              <DashboardLayout />
                                                                                                          </ProtectedRoute>
                                                                                                                    }
                                                                                                                            >
                                                                                                                                      <Route index element={<DashboardHome />} />
                                                                                                                                              </Route>
                                                                                                                                                    </Routes>
                                                                                                                                                        </BrowserRouter>
                                                                                                                                                          )
                                                                                                                                                          }

                                                                                                                                                          export default App
                                                                                                                                                                                                                                                                        