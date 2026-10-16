import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

export default function NotFoundPage() {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or has moved.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go home
      </Button>
    </Box>
  )
}
