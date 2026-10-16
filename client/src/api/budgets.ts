import { api } from './client'
import type { BudgetOverview } from '../types'

export const budgetsApi = {
  get: async (month: string) => (await api.get<BudgetOverview>(`/budgets/${month}`)).data,
  set: async (month: string, amount: number) =>
    (await api.put<BudgetOverview>(`/budgets/${month}`, { amount })).data,
  clear: async (month: string) => (await api.delete<BudgetOverview>(`/budgets/${month}`)).data,
}
