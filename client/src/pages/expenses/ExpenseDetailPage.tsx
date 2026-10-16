import { useCallback, useState, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { expensesApi } from '../../api/expenses'
import { getErrorMessage } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { useNotify } from '../../hooks/useNotify'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { CategoryChip } from '../../components/common/CategoryChip'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import { PAYMENT_METHOD_LABELS } from '../../types'

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  )
}

export default function ExpenseDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const notify = useNotify()
  const fetcher = useCallback(() => expensesApi.get(id), [id])
  const { data: expense, loading, error, reload } = useApi(fetcher)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await expensesApi.remove(id)
      notify('Expense deleted')
      navigate('/expenses', { replace: true })
    } catch (err) {
      notify(getErrorMessage(err), 'error')
      setDeleting(false)
    }
  }

  const back = (
    <Button component={RouterLink} to="/expenses" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      All expenses
    </Button>
  )

  if (loading && !expense) return <LoadingState label="Loading expense…" />
  if (error || !expense) {
    return (
      <>
        {back}
        <ErrorAlert message={error ?? 'Expense not found'} onRetry={reload} />
      </>
    )
  }

  return (
    <>
      {back}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 760 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" component="h1" sx={{ wordBreak: 'break-word' }}>
              {expense.title}
            </Typography>
            <Typography variant="h4" className="num" sx={{ mt: 1, color: 'primary.main' }}>
              {formatMoney(expense.amount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Button
              component={RouterLink}
              to={`/expenses/${expense.id}/edit`}
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
            >
              Edit
            </Button>
            <Button color="error" variant="outlined" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Detail label="Date">
              <Typography>{formatDate(expense.date)}</Typography>
            </Detail>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Detail label="Category">
              <CategoryChip category={expense.category} size="medium" />
            </Detail>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Detail label="Payment method">
              <Typography>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</Typography>
            </Detail>
          </Grid>
          <Grid size={12}>
            <Detail label="Notes">
              <Typography color={expense.notes ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                {expense.notes || 'No notes added.'}
              </Typography>
            </Detail>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 4 }}>
          Recorded {formatDateTime(expense.createdAt)}
          {expense.updatedAt !== expense.createdAt && ` · Last updated ${formatDateTime(expense.updatedAt)}`}
        </Typography>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete expense?"
        message={`“${expense.title}” will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}
