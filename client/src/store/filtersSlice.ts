import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ExpenseQuery, PaymentMethod, SortField, SortOrder } from '../types'
import type { RootState } from './index'

/**
 * All searching, filtering, sorting and paging state for the expense list.
 * Values are kept as strings where they come straight from inputs, and
 * converted into a typed API query by `selectExpenseQuery`.
 */
export interface FiltersState {
  search: string
  category: string
  paymentMethod: PaymentMethod | ''
  startDate: string
  endDate: string
  minAmount: string
  maxAmount: string
  sortBy: SortField
  order: SortOrder
  page: number
  limit: number
}

export const PAGE_SIZES = [5, 10, 20, 50] as const

export const initialFiltersState: FiltersState = {
  search: '',
  category: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
}

type FilterField = 'category' | 'paymentMethod' | 'startDate' | 'endDate' | 'minAmount' | 'maxAmount'

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFiltersState,
  reducers: {
    // Every change that alters the result set sends the user back to page 1.
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload
      state.page = 1
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | ''>) {
      state.paymentMethod = action.payload
      state.page = 1
    },
    setDateRange(state, action: PayloadAction<{ startDate?: string; endDate?: string }>) {
      if (action.payload.startDate !== undefined) state.startDate = action.payload.startDate
      if (action.payload.endDate !== undefined) state.endDate = action.payload.endDate
      state.page = 1
    },
    setAmountRange(state, action: PayloadAction<{ minAmount?: string; maxAmount?: string }>) {
      if (action.payload.minAmount !== undefined) state.minAmount = action.payload.minAmount
      if (action.payload.maxAmount !== undefined) state.maxAmount = action.payload.maxAmount
      state.page = 1
    },
    setSort(state, action: PayloadAction<{ sortBy: SortField; order: SortOrder }>) {
      state.sortBy = action.payload.sortBy
      state.order = action.payload.order
      state.page = 1
    },
    /** Clicking the active column flips direction; a new column starts descending. */
    toggleSort(state, action: PayloadAction<SortField>) {
      if (state.sortBy === action.payload) {
        state.order = state.order === 'asc' ? 'desc' : 'asc'
      } else {
        state.sortBy = action.payload
        state.order = 'desc'
      }
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload)
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload
      state.page = 1
    },
    clearFilter(state, action: PayloadAction<FilterField>) {
      state[action.payload] = ''
      state.page = 1
    },
    resetFilters(state) {
      // Keep the user's preferred page size when clearing filters.
      return { ...initialFiltersState, limit: state.limit }
    },
  },
})

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateRange,
  setAmountRange,
  setSort,
  toggleSort,
  setPage,
  setLimit,
  clearFilter,
  resetFilters,
} = filtersSlice.actions

export default filtersSlice.reducer

// ---- Selectors ----

export const selectFilters = (state: RootState) => state.filters

function toAmount(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/** Converts filter state into the query the API expects. */
export const selectExpenseQuery = createSelector(
  selectFilters,
  (f): ExpenseQuery => ({
    search: f.search.trim() || undefined,
    category: f.category || undefined,
    paymentMethod: f.paymentMethod || undefined,
    startDate: f.startDate || undefined,
    endDate: f.endDate || undefined,
    minAmount: toAmount(f.minAmount),
    maxAmount: toAmount(f.maxAmount),
    sortBy: f.sortBy,
    order: f.order,
    page: f.page,
    limit: f.limit,
  }),
)

/** Number of active filters (search excluded) — shown as a badge on mobile. */
export const selectActiveFilterCount = createSelector(selectFilters, (f) =>
  [f.category, f.paymentMethod, f.startDate, f.endDate, f.minAmount, f.maxAmount].filter(Boolean).length,
)

export const selectHasActiveFilters = createSelector(
  selectFilters,
  selectActiveFilterCount,
  (f, count) => count > 0 || f.search.trim() !== '',
)

/** Validation shown inline in the filter panel. */
export const selectFilterErrors = createSelector(selectFilters, (f) => {
  const errors: Partial<Record<'dates' | 'amounts', string>> = {}
  if (f.startDate && f.endDate && f.startDate > f.endDate) {
    errors.dates = 'Start date must be before end date'
  }
  const min = toAmount(f.minAmount)
  const max = toAmount(f.maxAmount)
  if (min !== undefined && max !== undefined && min > max) {
    errors.amounts = 'Minimum must be less than maximum'
  }
  return errors
})
