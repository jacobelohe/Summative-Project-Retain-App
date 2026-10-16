import { useCallback, useEffect } from 'react'
import { expensesApi } from '../api/expenses'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectExpenseQuery, setPage } from '../store/filtersSlice'
import { useApi } from './useApi'

/**
 * Fetches the current page of expenses for whatever search / filter / sort
 * state is in Redux. Any change to that state triggers a new request.
 */
export function useExpenses() {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectExpenseQuery)

  const fetcher = useCallback((signal: AbortSignal) => expensesApi.list(query, signal), [query])
  const state = useApi(fetcher)

  // If the current page no longer exists (e.g. after deleting the last item), step back.
  const totalPages = state.data?.totalPages
  useEffect(() => {
    if (totalPages && query.page > totalPages) dispatch(setPage(totalPages))
  }, [totalPages, query.page, dispatch])

  return { ...state, query }
}
