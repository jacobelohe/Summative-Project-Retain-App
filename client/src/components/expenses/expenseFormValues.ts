import { toDateInput, todayInput } from '../../utils/format'
import type { Expense, PaymentMethod } from '../../types'

/** Form values are strings so inputs can be empty while typing. */
export interface ExpenseFormValues {
  title: string
  amount: string
  category: string
  date: string
  paymentMethod: PaymentMethod | ''
  notes: string
}

export const emptyExpenseForm = (): ExpenseFormValues => ({
  title: '',
  amount: '',
  category: '',
  date: todayInput(),
  paymentMethod: '',
  notes: '',
})

export function expenseToFormValues(expense: Expense): ExpenseFormValues {
  return {
    title: expense.title,
    amount: String(expense.amount),
    category: expense.category?.id ?? '',
    date: toDateInput(expense.date),
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
  }
}
