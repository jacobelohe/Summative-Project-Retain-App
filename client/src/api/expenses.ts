import { api } from './client'
import type { Expense, ExpenseInput, ExpensePage, ExpenseQuery } from '../types'

/** Drops empty values so they are not sent as `?search=&category=`. */
function cleanParams(query: ExpenseQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export const expensesApi = {
  list: async (query: ExpenseQuery, signal?: AbortSignal) =>
    (await api.get<ExpensePage>('/expenses', { params: cleanParams(query), signal })).data,
  get: async (id: string) => (await api.get<Expense>(`/expenses/${id}`)).data,
  create: async (input: ExpenseInput) => (await api.post<Expense>('/expenses', input)).data,
  update: async (id: string, input: Partial<ExpenseInput>) =>
    (await api.put<Expense>(`/expenses/${id}`, input)).data,
  remove: async (id: string) => (await api.delete<{ message: string; id: string }>(`/expenses/${id}`)).data,
}
