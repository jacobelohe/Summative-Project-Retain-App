import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  resetFilters,
  selectActiveFilterCount,
  selectFilterErrors,
  selectFilters,
  selectHasActiveFilters,
  setAmountRange,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from '../../store/filtersSlice'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type Category, type PaymentMethod, type SortField, type SortOrder } from '../../types'

const SORT_OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest amount' },
  { value: 'amount:asc', label: 'Lowest amount' },
]

const SEARCH_DELAY_MS = 350

interface ExpenseFiltersProps {
  categories: Category[]
}

/**
 * Search, filter and sort controls. Every control reads from and writes to
 * the Redux filters slice; the expense list re-fetches when that state changes.
 */
export function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const activeCount = useAppSelector(selectActiveFilterCount)
  const hasActive = useAppSelector(selectHasActiveFilters)
  const errors = useAppSelector(selectFilterErrors)

  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [panelOpen, setPanelOpen] = useState(false)

  // The search box keeps its own text so typing feels instant; Redux is
  // updated once the user pauses typing.
  const [searchText, setSearchText] = useState(filters.search)
  const [syncedSearch, setSyncedSearch] = useState(filters.search)
  const searchTimer = useRef<number | undefined>(undefined)

  if (filters.search !== syncedSearch) {
    // Redux changed from elsewhere (e.g. "Clear filters") — mirror it locally.
    setSyncedSearch(filters.search)
    setSearchText(filters.search)
  }

  useEffect(() => () => window.clearTimeout(searchTimer.current), [])

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => dispatch(setSearch(value)), SEARCH_DELAY_MS)
  }

  const clearSearch = () => {
    window.clearTimeout(searchTimer.current)
    setSearchText('')
    dispatch(setSearch(''))
  }

  const handleReset = () => {
    window.clearTimeout(searchTimer.current)
    dispatch(resetFilters())
  }

  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split(':') as [SortField, SortOrder]
    dispatch(setSort({ sortBy, order }))
  }

  const showPanel = isDesktop || panelOpen

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <TextField
          placeholder="Search by title or notes…"
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
          slotProps={{
            htmlInput: { 'aria-label': 'Search expenses' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch} aria-label="Clear search">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Sort by"
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(e) => handleSortChange(e.target.value)}
          sx={{ flex: { xs: '1 1 auto', sm: '0 0 180px' } }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        {!isDesktop && (
          <IconButton
            onClick={() => setPanelOpen((open) => !open)}
            aria-label="Toggle filters"
            aria-expanded={panelOpen}
            color={panelOpen ? 'primary' : 'default'}
          >
            <Badge badgeContent={activeCount} color="primary">
              <FilterAltOutlinedIcon />
            </Badge>
          </IconButton>
        )}
      </Box>

      <Collapse in={showPanel} timeout="auto">
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              size="small"
              label="Category"
              value={filters.category}
              onChange={(e) => dispatch(setCategory(e.target.value))}
              fullWidth
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              size="small"
              label="Payment method"
              value={filters.paymentMethod}
              onChange={(e) => dispatch(setPaymentMethod(e.target.value as PaymentMethod | ''))}
              fullWidth
            >
              <MenuItem value="">All methods</MenuItem>
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              type="date"
              size="small"
              label="From"
              value={filters.startDate}
              onChange={(e) => dispatch(setDateRange({ startDate: e.target.value }))}
              error={Boolean(errors.dates)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              type="date"
              size="small"
              label="To"
              value={filters.endDate}
              onChange={(e) => dispatch(setDateRange({ endDate: e.target.value }))}
              error={Boolean(errors.dates)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              type="number"
              size="small"
              label="Min $"
              value={filters.minAmount}
              onChange={(e) => dispatch(setAmountRange({ minAmount: e.target.value }))}
              error={Boolean(errors.amounts)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <TextField
              type="number"
              size="small"
              label="Max $"
              value={filters.maxAmount}
              onChange={(e) => dispatch(setAmountRange({ maxAmount: e.target.value }))}
              error={Boolean(errors.amounts)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>
        </Grid>
        {(errors.dates || errors.amounts) && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            {[errors.dates, errors.amounts].filter(Boolean).join(' · ')}
          </Typography>
        )}
        {hasActive && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <Button size="small" startIcon={<FilterAltOffOutlinedIcon />} onClick={handleReset}>
              Clear filters
            </Button>
          </Box>
        )}
      </Collapse>
    </Paper>
  )
}
