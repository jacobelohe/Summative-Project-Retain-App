import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { theme } from './theme'
import { AuthProvider } from './context/AuthProvider'
import { NotifyProvider } from './context/NotifyProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReduxProvider store={store}>
        <NotifyProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </NotifyProvider>
      </ReduxProvider>
    </ThemeProvider>
  </StrictMode>,
)
