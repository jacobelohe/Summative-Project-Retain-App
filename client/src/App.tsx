import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoadingState } from './components/common/LoadingState'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { GuestRoute } from './routes/GuestRoute'
import { useDocumentTitle } from './hooks/useDocumentTitle'

// Pages are loaded on demand so the first screen downloads less JavaScript.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const BudgetPage = lazy(() => import('./pages/BudgetPage'))
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'))
const NewExpensePage = lazy(() => import('./pages/expenses/NewExpensePage'))
const ExpenseDetailPage = lazy(() => import('./pages/expenses/ExpenseDetailPage'))
const EditExpensePage = lazy(() => import('./pages/expenses/EditExpensePage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  useDocumentTitle()

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState fullScreen />}>
        <Routes>
          {/* Public: only for signed-out visitors */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Signed-in users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/expenses/new" element={<NewExpensePage />} />
              <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
              <Route path="/expenses/:id/edit" element={<EditExpensePage />} />

              {/* Admins only */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
