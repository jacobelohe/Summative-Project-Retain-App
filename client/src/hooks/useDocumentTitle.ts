import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES: [RegExp, string][] = [
  [/^\/login$/, 'Sign in'],
  [/^\/register$/, 'Create account'],
  [/^\/dashboard$/, 'Dashboard'],
  [/^\/expenses$/, 'Expenses'],
  [/^\/expenses\/new$/, 'Add expense'],
  [/^\/expenses\/[^/]+\/edit$/, 'Edit expense'],
  [/^\/expenses\/[^/]+$/, 'Expense details'],
  [/^\/budget$/, 'Budget'],
  [/^\/admin$/, 'Platform insights'],
  [/^\/admin\/categories$/, 'Categories'],
]

/** Keeps the browser tab title in sync with the current route. */
export function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const match = TITLES.find(([pattern]) => pattern.test(pathname))
    document.title = match ? `${match[1]} · Retain` : 'Retain · Expense & Budget Manager'
  }, [pathname])
}
