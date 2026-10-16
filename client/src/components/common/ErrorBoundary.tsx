import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Typography } from '@mui/material'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/** Catches render errors so one broken screen doesn't blank the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
        <Typography variant="h5" gutterBottom>
          Something went wrong
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          An unexpected error occurred while showing this page.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </Box>
    )
  }
}
