import { api } from './client'
import type { Budget, BudgetOverview } from '../types'

export const budgetsApi = {
  list: async () => (await api.get<Budget[]>('/budgets')).data,
  get: async (month: string) => (await api.get<BudgetOverview>(`/budgets/${month}`)).data,
  set: async (month: string, amount: number) =>
    (await api.put<BudgetOverview>(`/budgets/${month}`, { amount })).data,
  clear: async (month: string) => (await api.delete<BudgetOverview>(`/budgets/${month}`)).data,
}
