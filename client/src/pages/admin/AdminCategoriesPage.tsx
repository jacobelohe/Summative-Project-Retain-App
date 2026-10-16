import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import { categoriesApi } from '../../api/categories'
import { getErrorMessage } from '../../api/client'
import { useCategories } from '../../hooks/useCategories'
import { useNotify } from '../../hooks/useNotify'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { CategoryDialog } from '../../components/admin/CategoryDialog'
import type { Category, CategoryInput } from '../../types'

/** Dialog state: closed, creating a new category, or editing an existing one. */
type EditorState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; category: Category }

export default function AdminCategoriesPage() {
  const notify = useNotify()
  const { categories, loading, error, reload } = useCategories()
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const defaultCategory = categories.find((c) => c.isDefault)

  const handleSave = async (input: CategoryInput) => {
    if (editor.mode === 'edit') {
      await categoriesApi.update(editor.category.id, input)
      notify(`Updated "${input.name}"`)
    } else {
      await categoriesApi.create(input)
      notify(`Created "${input.name}"`)
    }
    setEditor({ mode: 'closed' })
    reload()
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      const result = await categoriesApi.remove(toDelete.id)
      notify(result.message)
      setToDelete(null)
      reload()
    } catch (err) {
      notify(getErrorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Expense categories"
        subtitle="Categories are shared by every user. Deleting one moves its expenses to the default category."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditor({ mode: 'create' })}>
            New category
          </Button>
        }
      />

      {error && <ErrorAlert message={error} onRetry={reload} />}

      <Paper variant="outlined">
        {loading && categories.length === 0 ? (
          <LoadingState label="Loading categories…" />
        ) : categories.length === 0 ? (
          <EmptyState icon={<CategoryOutlinedIcon />} title="No categories yet" />
        ) : (
          <TableContainer>
            <Table aria-label="Categories">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Expenses</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {c.name}
                        </Typography>
                        {c.isDefault && <Chip label="Default" size="small" variant="outlined" />}
                      </Box>
                    </TableCell>
                    <TableCell align="right" className="num">
                      {c.expenseCount}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => setEditor({ mode: 'edit', category: c })} aria-label={`Edit ${c.name}`}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={c.isDefault ? 'The default category cannot be deleted' : 'Delete'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={c.isDefault}
                            onClick={() => setToDelete(c)}
                            aria-label={`Delete ${c.name}`}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {editor.mode !== 'closed' && (
        <CategoryDialog
          key={editor.mode === 'edit' ? editor.category.id : 'new'}
          category={editor.mode === 'edit' ? editor.category : null}
          onClose={() => setEditor({ mode: 'closed' })}
          onSubmit={handleSave}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete "${toDelete?.name}"?`}
        message={
          toDelete && toDelete.expenseCount > 0 ? (
            <>
              <strong>{toDelete.expenseCount}</strong> expense{toDelete.expenseCount === 1 ? '' : 's'} currently use this
              category. {toDelete.expenseCount === 1 ? 'It' : 'They'} will be moved to “{defaultCategory?.name ?? 'Uncategorized'}”.
            </>
          ) : (
            'No expenses use this category, so nothing else will change.'
          )
        }
        confirmLabel="Delete category"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
