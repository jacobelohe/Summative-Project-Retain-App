import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { GuestRoute } from './routes/GuestRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ExpensesPage from './pages/expenses/ExpensesPage'
import NewExpensePage from './pages/expenses/NewExpensePage'
import ExpenseDetailPage from './pages/expenses/ExpenseDetailPage'
import EditExpensePage from './pages/expenses/EditExpensePage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/new" element={<NewExpensePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/expenses/:id/edit" element={<EditExpensePage />} />

          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<PlaceholderPage title="Platform insights" />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
