// src/App.jsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './config/theme.jsx';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

// Layout Component
import AppLayout from './components/Layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/Home'));
const BooksPage = React.lazy(() => import('./pages/Books'));
const BookDetailsPage = React.lazy(() => import('./pages/BookDetails'));
const LoansPage = React.lazy(() => import('./pages/Loans'));
const AuthorsPage = React.lazy(() => import('./pages/Authors'));
const CategoriesPage = React.lazy(() => import('./pages/Categories'));
const PublishersPage = React.lazy(() => import('./pages/Publishers'));
const ImportPage = React.lazy(() => import('./pages/Import'));
const ExportPage = React.lazy(() => import('./pages/Export'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const UserManagementPage = React.lazy(() => import('./pages/UserManagement'));

// Protected route component that checks for authentication
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { authenticated, loading, theme, isAdmin } = useAppContext();

  if (loading) {
    return <LoadingScreen theme={theme} message="אימות הרשאות..." />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App with auth check
const AppWithAuth = () => {
  const { authenticated, loading, theme } = useAppContext();

  if (loading) {
    return <LoadingScreen theme={theme} message="טוען..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={authenticated ? <Navigate to="/" replace /> : <Login />}
          />

          <Route
            path="/register"
            element={authenticated ? <Navigate to="/" replace /> : <Register />}
          />

          <Route
            path="/forgot-password"
            element={
              authenticated ? <Navigate to="/" replace /> : <ForgotPassword />
            }
          />

          <Route
            path="/reset-password"
            element={
              authenticated ? <Navigate to="/" replace /> : <ResetPassword />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <HomePage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <BooksPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <BookDetailsPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <LoansPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/authors"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <AuthorsPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <CategoriesPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/publishers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <PublishersPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/import"
            element={
              <ProtectedRoute adminOnly={true}>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <ImportPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <ExportPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <SettingsPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AppLayout>
                  <React.Suspense
                    fallback={
                      <LoadingScreen theme={theme} message="טוען דף..." />
                    }
                  >
                    <UserManagementPage />
                  </React.Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

// Main App component with the provider
const App = () => {
  return (
    <AppProvider>
      <AppWithAuth />
    </AppProvider>
  );
};

export default App;
