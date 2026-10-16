import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './filtersSlice'

/**
 * Redux store. It holds the expense search / filter / sort / pagination state;
 * authentication lives in React Context (see context/AuthProvider).
 */
export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
