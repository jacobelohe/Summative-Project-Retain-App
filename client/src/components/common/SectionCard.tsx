import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

interface SectionCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
  /** Remove inner padding, e.g. for lists and tables that run edge to edge. */
  flush?: boolean
}

export function SectionCard({ title, action, children, flush = false }: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2, pb: flush ? 1 : 0 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {action}
      </Box>
      {flush ? children : <CardContent sx={{ flexGrow: 1 }}>{children}</CardContent>}
    </Card>
  )
}
