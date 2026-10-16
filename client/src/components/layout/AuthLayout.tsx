import type { ReactNode } from 'react'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { BrandMark } from './BrandMark'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

const YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  'Record expenses in seconds',
  'Set a monthly budget and see where you stand',
  'Search, filter and sort your spending history',
]

/** Two-column sign-in/sign-up shell that collapses to one column on phones. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: 'primary.contrastText',
          background: 'linear-gradient(160deg, #1f6f5c 0%, #0f4a3c 100%)',
        }}
      >
        <BrandMark inverted />
        <Box>
          <Typography variant="h4" sx={{ mb: 2, maxWidth: 420 }}>
            Know where your money goes, every month.
          </Typography>
          <Stack spacing={1.25}>
            {HIGHLIGHTS.map((item) => (
              <Typography key={item} sx={{ opacity: 0.85 }}>
                ✓ {item}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          © {YEAR} Retain
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Paper variant="outlined" sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <BrandMark />
          </Box>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </Paper>
      </Box>
    </Box>
  )
}
