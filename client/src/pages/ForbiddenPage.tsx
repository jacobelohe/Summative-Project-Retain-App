import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

export default function ForbiddenPage() {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <LockOutlinedIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Admins only
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        You need an administrator account to view this page.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to my dashboard
      </Button>
    </Box>
  )
}
