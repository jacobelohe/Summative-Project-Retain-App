import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { useNotify } from '../hooks/useNotify'
import { getErrorMessage, getFieldErrors } from '../api/client'
import type { RegisterInput } from '../types'

type FormErrors = Partial<Record<keyof RegisterInput | 'confirm', string>>

function validate(values: RegisterInput, confirm: string): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required'
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address'
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (confirm !== values.password) errors.confirm = 'Passwords do not match'
  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const notify = useNotify()
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterInput>({ name: '', email: '', password: '' })
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof RegisterInput) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(values, confirm)
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      const user = await register({ ...values, name: values.name.trim(), email: values.email.trim() })
      notify(`Welcome to Retain, ${user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors(getFieldErrors(err))
      setServerError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your spending in under a minute.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Full name"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            error={Boolean(errors.email)}
            helperText={errors.email}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update('password')}
            error={Boolean(errors.password)}
            helperText={errors.password ?? 'At least 8 characters'}
            required
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={Boolean(errors.confirm)}
            helperText={errors.confirm}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  )
}
