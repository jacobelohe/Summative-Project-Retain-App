import { Box, Typography } from '@mui/material'

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="img"
        src="/favicon.svg"
        alt=""
        sx={{ width: 32, height: 32, borderRadius: 1.5, outline: inverted ? '2px solid rgba(255,255,255,0.4)' : 'none' }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700, color: inverted ? 'inherit' : 'text.primary' }}>
        Retain
      </Typography>
    </Box>
  )
}
