import { Box, Chip } from '@mui/material'
import type { CategoryRef } from '../../types'

export function CategoryChip({ category, size = 'small' }: { category: CategoryRef | null; size?: 'small' | 'medium' }) {
  const color = category?.color ?? '#9e9e9e'
  return (
    <Chip
      size={size}
      variant="outlined"
      label={category?.name ?? 'Uncategorized'}
      icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, ml: '8px !important' }} />}
      sx={{ borderColor: 'divider', maxWidth: '100%' }}
    />
  )
}
