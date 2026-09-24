import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'

function App() {
  return (
      <BrowserRouter>
            <nav style={{ padding: 12 }}>
                    <Link to="/signup" style={{ marginRight: 12 }}>Signup</Link>
                            <Link to="/login">Login</Link>
                                  </nav>
                                        <Routes>
                                                <Route path="/signup" element={<Signup />} />
                                                        <Route path="/login" element={<Login />} />
                                                                <Route path="/" element={<h1 style={{ padding: 24 }}>Restaurant SaaS</h1>} />
                                                                      </Routes>
                                                                          </BrowserRouter>
                                                                            )
                                                                            }

                                                                            export default App