import type { ReactNode } from 'react'
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material'

interface StatCardProps {
  label: string
  value: ReactNode
  caption?: ReactNode
  icon: ReactNode
  color?: string
}

/** Compact KPI tile used on the user and admin dashboards. */
export function StatCard({ label, value, caption, icon, color = 'primary.main' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'action.hover', color, width: 44, height: 44 }}>
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" className="num" sx={{ mt: 0.25, wordBreak: 'break-word' }}>
            {value}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25 }} noWrap>
              {caption}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
