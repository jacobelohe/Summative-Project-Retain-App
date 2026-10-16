import { useCallback } from 'react'
import { categoriesApi } from '../api/categories'
import { useApi } from './useApi'

/** Loads the category list used by forms, filters and the admin screen. */
export function useCategories() {
  const fetcher = useCallback(() => categoriesApi.list(), [])
  const { data, ...rest } = useApi(fetcher)
  return { categories: data ?? [], ...rest }
}
