import { createContext } from 'react'
import type { AlertColor } from '@mui/material'

export interface NotifyContextValue {
  notify: (message: string, severity?: AlertColor) => void
}

export const NotifyContext = createContext<NotifyContextValue | null>(null)
