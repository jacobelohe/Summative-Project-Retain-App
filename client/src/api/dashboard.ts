import { api } from './client'
import type { AdminInsights, DashboardSummary } from '../types'

export const dashboardApi = {
  summary: async (month: string) =>
    (await api.get<DashboardSummary>('/dashboard/summary', { params: { month } })).data,
}

export const adminApi = {
  insights: async () => (await api.get<AdminInsights>('/admin/insights')).data,
}
