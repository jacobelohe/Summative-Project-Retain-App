import { Box, Stack, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '../../utils/format'

export interface CategorySlice {
  name: string
  color: string
  total: number
  count?: number
}

/** Donut chart with a legend that lists each category's total and share. */
export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const grandTotal = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
      <Box sx={{ width: { xs: '100%', sm: 200 }, height: 200, flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius="58%" outerRadius="95%" paddingAngle={1.5} stroke="none">
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
        {data.map((slice) => (
          <Box key={slice.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
              {slice.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="num" sx={{ whiteSpace: 'nowrap' }}>
              {grandTotal ? `${((slice.total / grandTotal) * 100).toFixed(0)}%` : '—'}
            </Typography>
            <Typography variant="body2" className="num" sx={{ fontWeight: 600, minWidth: 84, textAlign: 'right' }}>
              {formatMoney(slice.total)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
