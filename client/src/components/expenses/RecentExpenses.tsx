import { Link as RouterLink } from 'react-router-dom'
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'
import { formatDate, formatMoney } from '../../utils/format'
import type { Expense } from '../../types'

interface RecentExpensesProps<T extends Expense> {
  expenses: T[]
  /** Optional secondary line per item, e.g. the owner's name on the admin dashboard. */
  secondary?: (expense: T) => string
  /** Link each row to its detail page (only for the signed-in user's own expenses). */
  linkToDetail?: boolean
}

export function RecentExpenses<T extends Expense>({ expenses, secondary, linkToDetail = true }: RecentExpensesProps<T>) {
  return (
    <List disablePadding>
      {expenses.map((expense) => {
        const content = (
          <>
            <Box
              sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: expense.category?.color ?? '#9e9e9e', mr: 1.5, flexShrink: 0 }}
            />
            <ListItemText
              primary={expense.title}
              secondary={
                secondary ? secondary(expense) : `${expense.category?.name ?? 'Uncategorized'} · ${formatDate(expense.date)}`
              }
              slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
              sx={{ minWidth: 0, my: 0.25 }}
            />
            <Typography className="num" sx={{ fontWeight: 600, ml: 1.5, whiteSpace: 'nowrap' }}>
              {formatMoney(expense.amount)}
            </Typography>
          </>
        )
        return linkToDetail ? (
          <ListItemButton key={expense.id} component={RouterLink} to={`/expenses/${expense.id}`} divider>
            {content}
          </ListItemButton>
        ) : (
          <ListItem key={expense.id} divider>
            {content}
          </ListItem>
        )
      })}
    </List>
  )
}
