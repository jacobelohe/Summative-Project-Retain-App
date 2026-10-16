import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, LinearProgress, Paper, TablePagination, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import { PageHeader } from '../../components/common/PageHeader'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { ExpenseFilters } from '../../components/expenses/ExpenseFilters'
import { ExpenseList } from '../../components/expenses/ExpenseList'
import { useExpenses } from '../../hooks/useExpenses'
import { useCategories } from '../../hooks/useCategories'
import { useNotify } from '../../hooks/useNotify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { PAGE_SIZES, resetFilters, selectHasActiveFilters, setLimit, setPage, toggleSort } from '../../store/filtersSlice'
import { expensesApi } from '../../api/expenses'
import { getErrorMessage } from '../../api/client'
import { formatMoney } from '../../utils/format'
import type { Expense } from '../../types'

export default function ExpensesPage() {
  const dispatch = useAppDispatch()
  const notify = useNotify()
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const { categories } = useCategories()
  const { data, loading, error, reload, query } = useExpenses()

  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await expensesApi.remove(toDelete.id)
      notify(`Deleted "${toDelete.title}"`)
      setToDelete(null)
      reload()
    } catch (err) {
      notify(getErrorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const expenses = data?.data ?? []
  const firstLoad = loading && !data

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={
          data
            ? `${data.total} expense${data.total === 1 ? '' : 's'} · ${formatMoney(data.totalAmount)} total${hasActiveFilters ? ' (filtered)' : ''}`
            : 'Everything you have spent, in one place.'
        }
        actions={
          <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddIcon />}>
            Add expense
          </Button>
        }
      />

      <ExpenseFilters categories={categories} />

      {error && <ErrorAlert message={error} onRetry={reload} />}

      <Paper variant="outlined" sx={{ position: 'relative', overflow: 'hidden' }}>
        {loading && data && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}

        {firstLoad ? (
          <LoadingState label="Loading expenses…" />
        ) : expenses.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={<SearchOffOutlinedIcon />}
              title="No expenses match your filters"
              description="Try a different search term or widen the date and amount ranges."
              action={<Button onClick={() => dispatch(resetFilters())}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={<ReceiptLongOutlinedIcon />}
              title="No expenses yet"
              description="Record your first expense to start tracking your spending."
              action={
                <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddIcon />}>
                  Add expense
                </Button>
              }
            />
          )
        ) : (
          <Box sx={{ p: { xs: 1.25, sm: 0 } }}>
            <ExpenseList
              expenses={expenses}
              sortBy={query.sortBy}
              order={query.order}
              onSort={(field) => dispatch(toggleSort(field))}
              onDelete={setToDelete}
            />
          </Box>
        )}

        {data && data.total > 0 && (
          <TablePagination
            component="div"
            count={data.total}
            page={Math.min(query.page, data.totalPages) - 1}
            onPageChange={(_, page) => dispatch(setPage(page + 1))}
            rowsPerPage={query.limit}
            onRowsPerPageChange={(e) => dispatch(setLimit(Number(e.target.value)))}
            rowsPerPageOptions={[...PAGE_SIZES]}
            labelRowsPerPage="Per page"
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
      </Paper>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete expense?"
        message={
          <Typography>
            “{toDelete?.title}” ({formatMoney(toDelete?.amount)}) will be permanently removed.
          </Typography>
        }
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
