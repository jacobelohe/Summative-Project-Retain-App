/**
 * Shared domain types. These mirror the JSON shapes returned by the Retain API.
 */

export type Role = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterInput extends Credentials {
  name: string
}

export const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer', 'other'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile_money: 'Mobile money',
  bank_transfer: 'Bank transfer',
  other: 'Other',
}

export interface CategoryRef {
  id: string
  name: string
  color: string
}

export interface Category extends CategoryRef {
  isDefault: boolean
  createdAt: string
  expenseCount: number
}

export interface CategoryInput {
  name: string
  color: string
}

export interface CategoryDeleteResult {
  message: string
  id: string
  reassignedCount: number
  reassignedTo: CategoryRef
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: CategoryRef | null
  /** ISO date string; the calendar day is the first 10 characters. */
  date: string
  paymentMethod: PaymentMethod
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseInput {
  title: string
  amount: number
  category: string
  /** `YYYY-MM-DD` */
  date: string
  paymentMethod: PaymentMethod
  notes: string
}

export interface Paginated<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ExpensePage extends Paginated<Expense> {
  /** Sum of all expenses matching the current filters (not just this page). */
  totalAmount: number
}

export interface Budget {
  id: string
  /** `YYYY-MM` */
  month: string
  amount: number
  updatedAt: string
}

export type BudgetStatus ='unset' | 'within' | 'approaching' | 'over'

export interface BudgetOverview {
  /** `YYYY-MM` */
  month: string
  budget: number | null
  totalSpent: number
  remaining: number | null
  percentUsed: number | null
  status: BudgetStatus
  expenseCount: number
}

export interface CategorySpending {
  categoryId: string | null
  name: string
  color: string
  total: number
  count: number
}

export interface DashboardSummary extends BudgetOverview {
  highestExpense: Expense | null
  byCategory: CategorySpending[]
  recentExpenses: Expense[]
}

export interface CategoryInsight {
  id: string
  name: string
  color: string
  isDefault: boolean
  count: number
  total: number
}

export interface AdminExpense extends Expense {
  user: { id: string; name: string; email: string } | null
}

export interface AdminInsights {
  totals: {
    users: number
    expenses: number
    value: number
    expensesThisMonth: number
  }
  spendingByCategory: CategoryInsight[]
  topCategories: CategoryInsight[]
  bottomCategories: CategoryInsight[]
  recentExpenses: AdminExpense[]
  recentUsers: User[]
}

export interface ApiErrorBody {
  message: string
  details?: { field: string; message: string }[]
}

export type SortField = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

/** Query parameters accepted by `GET /api/expenses`. */
export interface ExpenseQuery {
  search?: string
  category?: string
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  sortBy: SortField
  order: SortOrder
  page: number
  limit: number
}
