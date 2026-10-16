import dayjs from 'dayjs'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatMoney(value: number | null | undefined): string {
  return currency.format(value ?? 0)
}

/**
 * Expense dates are stored as UTC midnight, so we read the calendar day
 * straight from the ISO string to avoid time-zone shifts.
 */
export function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

export function formatDate(iso: string): string {
  return dayjs(toDateInput(iso)).format('MMM D, YYYY')
}

export function formatDateTime(iso: string): string {
  return dayjs(iso).format('MMM D, YYYY h:mm A')
}

export function todayInput(): string {
  return dayjs().format('YYYY-MM-DD')
}

/** Current month as `YYYY-MM`. */
export function currentMonth(): string {
  return dayjs().format('YYYY-MM')
}

export function formatMonth(month: string): string {
  return dayjs(`${month}-01`).format('MMMM YYYY')
}

export function shiftMonth(month: string, delta: number): string {
  return dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM')
}
