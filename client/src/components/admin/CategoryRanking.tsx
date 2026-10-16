import { Box, LinearProgress, List, ListItem, Typography } from '@mui/material'
import type { CategoryInsight } from '../../types'

interface CategoryRankingProps {
  categories: CategoryInsight[]
  /** Usage count that represents a full bar (usually the most-used category). */
  maxCount: number
}

/** Ranked list of categories by how many expenses use them. */
export function CategoryRanking({ categories, maxCount }: CategoryRankingProps) {
  return (
    <List dense disablePadding>
      {categories.map((c, index) => (
        <ListItem key={c.id} disableGutters sx={{ display: 'block', py: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary" className="num" sx={{ width: 18 }}>
              {index + 1}.
            </Typography>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
              {c.name}
            </Typography>
            <Typography variant="body2" className="num" sx={{ fontWeight: 600 }}>
              {c.count} {c.count === 1 ? 'expense' : 'expenses'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={maxCount ? (c.count / maxCount) * 100 : 0}
            sx={{ height: 6, borderRadius: 3, ml: 4, '& .MuiLinearProgress-bar': { bgcolor: c.color } }}
          />
        </ListItem>
      ))}
    </List>
  )
}
