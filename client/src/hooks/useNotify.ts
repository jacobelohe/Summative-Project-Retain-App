import { useContext } from 'react'
import { NotifyContext } from '../context/notifyContext'

export function useNotify() {
  const context = useContext(NotifyContext)
  if (!context) throw new Error('useNotify must be used inside <NotifyProvider>')
  return context.notify
}
