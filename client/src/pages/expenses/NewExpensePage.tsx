import { useNavigate } from 'react-router-dom'
import { Paper } from '@mui/material'
import { PageHeader } from '../../components/common/PageHeader'
import { ExpenseForm } from '../../components/expenses/ExpenseForm'
import { emptyExpenseForm } from '../../components/expenses/expenseFormValues'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useCategories } from '../../hooks/useCategories'
import { useNotify } from '../../hooks/useNotify'
import { expensesApi } from '../../api/expenses'
import type { ExpenseInput } from '../../types'

export default function NewExpensePage() {
  const navigate = useNavigate()
  const notify = useNotify()
  const { categories, loading, error, reload } = useCategories()

  const handleSubmit = async (input: ExpenseInput) => {
    const created = await expensesApi.create(input)
    notify(`Added "${created.title}"`)
    navigate('/expenses')
  }

  return (
    <>
      <PageHeader title="Add expense" subtitle="Record something you've spent money on." />
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 760 }}>
        {loading && categories.length === 0 ? (
          <LoadingState label="Loading categories…" />
        ) : error ? (
          <ErrorAlert message={error} onRetry={reload} />
        ) : (
          <ExpenseForm
            initialValues={emptyExpenseForm()}
            categories={categories}
            submitLabel="Add expense"
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        )}
      </Paper>
    </>
  )
}
