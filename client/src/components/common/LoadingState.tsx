import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingStateProps {
  label?: string
  fullScreen?: boolean
}

export function LoadingState({ label = 'Loading…', fullScreen = false }: LoadingStateProps) {
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        minHeight: fullScreen ? '100vh' : undefined,
      }}
    >
      <CircularProgress size={32} />
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
    </Box>
  )
}
