import { api } from './client'
import type { Category, CategoryDeleteResult, CategoryInput } from '../types'

export const categoriesApi = {
  list: async () => (await api.get<Category[]>('/categories')).data,
  create: async (input: CategoryInput) => (await api.post<Category>('/categories', input)).data,
  update: async (id: string, input: Partial<CategoryInput>) =>
    (await api.put<Category>(`/categories/${id}`, input)).data,
  remove: async (id: string) => (await api.delete<CategoryDeleteResult>(`/categories/${id}`)).data,
}
