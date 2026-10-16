import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { CategoryChip } from '../common/CategoryChip'
import { formatDate, formatMoney } from '../../utils/format'
import { PAYMENT_METHOD_LABELS, type Expense, type SortField, type SortOrder } from '../../types'

interface ExpenseListProps {
  expenses: Expense[]
  sortBy: SortField
  order: SortOrder
  onSort: (field: SortField) => void
  onDelete: (expense: Expense) => void
}

/** Table on tablets/desktops, stacked cards on phones. */
export function ExpenseList({ expenses, sortBy, order, onSort, onDelete }: ExpenseListProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Stack spacing={1.25}>
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardActionArea onClick={() => navigate(`/expenses/${expense.id}`)} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {expense.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                  </Typography>
                </Box>
                <Typography className="num" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatMoney(expense.amount)}
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <CategoryChip category={expense.category} />
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    )
  }

  const sortableHeader = (field: SortField, label: string, align: 'left' | 'right' = 'left') => (
    <TableCell align={align} sortDirection={sortBy === field ? order : false}>
      <TableSortLabel
        active={sortBy === field}
        direction={sortBy === field ? order : 'desc'}
        onClick={() => onSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )

  return (
    <TableContainer>
      <Table size="medium" aria-label="Expenses">
        <TableHead>
          <TableRow>
            {sortableHeader('date', 'Date')}
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell sx={{ display: { sm: 'none', md: 'table-cell' } }}>Payment</TableCell>
            {sortableHeader('amount', 'Amount', 'right')}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow
              key={expense.id}
              hover
              onClick={() => navigate(`/expenses/${expense.id}`)}
              sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
            >
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.date)}</TableCell>
              <TableCell sx={{ maxWidth: 280 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {expense.title}
                </Typography>
                {expense.notes && (
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {expense.notes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <CategoryChip category={expense.category} />
              </TableCell>
              <TableCell sx={{ display: { sm: 'none', md: 'table-cell' } }}>
                {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
              </TableCell>
              <TableCell align="right" className="num" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatMoney(expense.amount)}
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => navigate(`/expenses/${expense.id}/edit`)} aria-label={`Edit ${expense.title}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDelete(expense)} aria-label={`Delete ${expense.title}`}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
