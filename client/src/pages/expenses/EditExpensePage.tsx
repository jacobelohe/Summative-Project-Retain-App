import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Paper } from '@mui/material'
import { PageHeader } from '../../components/common/PageHeader'
import { ExpenseForm } from '../../components/expenses/ExpenseForm'
import { expenseToFormValues } from '../../components/expenses/expenseFormValues'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useCategories } from '../../hooks/useCategories'
import { useApi } from '../../hooks/useApi'
import { useNotify } from '../../hooks/useNotify'
import { expensesApi } from '../../api/expenses'
import type { ExpenseInput } from '../../types'

export default function EditExpensePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const notify = useNotify()
  const categoriesState = useCategories()
  const fetcher = useCallback(() => expensesApi.get(id), [id])
  const expenseState = useApi(fetcher)

  const handleSubmit = async (input: ExpenseInput) => {
    const updated = await expensesApi.update(id, input)
    notify(`Saved "${updated.title}"`)
    navigate(`/expenses/${id}`)
  }

  const loading = (expenseState.loading && !expenseState.data) || (categoriesState.loading && !categoriesState.categories.length)
  const error = expenseState.error ?? categoriesState.error

  return (
    <>
      <PageHeader title="Edit expense" subtitle="Update the details of this expense." />
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 760 }}>
        {loading ? (
          <LoadingState label="Loading expense…" />
        ) : error || !expenseState.data ? (
          <ErrorAlert
            message={error ?? 'Expense not found'}
            onRetry={() => {
              expenseState.reload()
              categoriesState.reload()
            }}
          />
        ) : (
          <ExpenseForm
            key={expenseState.data.id}
            initialValues={expenseToFormValues(expenseState.data)}
            categories={categoriesState.categories}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        )}
      </Paper>
    </>
  )
}
