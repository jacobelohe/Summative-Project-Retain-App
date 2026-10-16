import { useState, type FormEvent } from 'react'
import { Alert, Box, Button, Grid, InputAdornment, MenuItem, Stack, TextField } from '@mui/material'
import { getErrorMessage, getFieldErrors } from '../../api/client'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type Category, type ExpenseInput, type PaymentMethod } from '../../types'
import type { ExpenseFormValues } from './expenseFormValues'

type FormErrors = Partial<Record<keyof ExpenseFormValues, string>>

function validate(values: ExpenseFormValues): FormErrors {
  const errors: FormErrors = {}
  const amount = Number(values.amount)
  if (!values.title.trim()) errors.title = 'Give the expense a short title'
  else if (values.title.trim().length > 120) errors.title = 'Keep the title under 120 characters'
  if (values.amount === '' || !Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than 0'
  if (!values.category) errors.category = 'Choose a category'
  if (!values.date) errors.date = 'Pick the date of the expense'
  if (!values.paymentMethod) errors.paymentMethod = 'Choose how you paid'
  if (values.notes.length > 500) errors.notes = 'Notes must be 500 characters or fewer'
  return errors
}

interface ExpenseFormProps {
  initialValues: ExpenseFormValues
  categories: Category[]
  submitLabel: string
  onSubmit: (input: ExpenseInput) => Promise<void>
  onCancel: () => void
}

/** Shared create / edit form with client-side and server-side validation feedback. */
export function ExpenseForm({ initialValues, categories, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof ExpenseFormValues>(field: K, value: ExpenseFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        amount: Math.round(Number(values.amount) * 100) / 100,
        category: values.category,
        date: values.date,
        paymentMethod: values.paymentMethod as PaymentMethod,
        notes: values.notes.trim(),
      })
    } catch (err) {
      setErrors(getFieldErrors(err) as FormErrors)
      setServerError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField
          label="Title"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? 'e.g. Weekly groceries'}
          required
          fullWidth
          autoFocus
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Amount"
              type="number"
              value={values.amount}
              onChange={(e) => set('amount', e.target.value)}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              required
              fullWidth
              slotProps={{
                htmlInput: { min: 0.01, step: '0.01', inputMode: 'decimal' },
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Date"
              type="date"
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
              error={Boolean(errors.date)}
              helperText={errors.date}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Category"
              value={values.category}
              onChange={(e) => set('category', e.target.value)}
              error={Boolean(errors.category)}
              helperText={errors.category}
              required
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Box
                    component="span"
                    sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, display: 'inline-block', mr: 1.25 }}
                  />
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Payment method"
              value={values.paymentMethod}
              onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
              error={Boolean(errors.paymentMethod)}
              helperText={errors.paymentMethod}
              required
              fullWidth
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          label="Notes (optional)"
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
          error={Boolean(errors.notes)}
          helperText={errors.notes ?? `${values.notes.length}/500`}
          multiline
          minRows={3}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
