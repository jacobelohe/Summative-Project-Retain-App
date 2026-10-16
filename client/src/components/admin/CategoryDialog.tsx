import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { getErrorMessage } from '../../api/client'
import type { Category, CategoryInput } from '../../types'

const PRESET_COLORS = ['#ef6c00', '#1e88e5', '#6d4c41', '#00897b', '#8e24aa', '#e53935', '#d81b60', '#3949ab', '#43a047', '#fdd835', '#546e7a', '#00acc1']

interface CategoryDialogProps {
  /** Category being edited, or null to create a new one. */
  category: Category | null
  onClose: () => void
  onSubmit: (input: CategoryInput) => Promise<void>
}

/** Create / edit dialog. Mount it with a `key` so it resets for each category. */
export function CategoryDialog({ category, onClose, onSubmit }: CategoryDialogProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    if (name.trim().length > 40) {
      setError('Keep the name under 40 characters')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), color })
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus fullWidth required />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Colour
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {PRESET_COLORS.map((preset) => (
                  <ButtonBase
                    key={preset}
                    onClick={() => setColor(preset)}
                    aria-label={`Use colour ${preset}`}
                    aria-pressed={color === preset}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: preset,
                      outline: color === preset ? '3px solid' : 'none',
                      outlineColor: 'text.primary',
                      outlineOffset: 2,
                    }}
                  />
                ))}
                <Box
                  component="input"
                  type="color"
                  value={color}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                  aria-label="Custom colour"
                  sx={{ width: 36, height: 30, border: 0, p: 0, bgcolor: 'transparent', cursor: 'pointer' }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : category ? 'Save changes' : 'Create category'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
