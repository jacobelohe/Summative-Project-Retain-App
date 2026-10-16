import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Alert, Snackbar, type AlertColor } from '@mui/material'
import { NotifyContext } from './notifyContext'

interface Toast {
  key: number
  message: string
  severity: AlertColor
}

/** App-wide toast notifications for success and error feedback. */
export function NotifyProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ key: Date.now(), message, severity })
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    setToast(null)
  }

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toast !== null}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity ?? 'success'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  )
}
