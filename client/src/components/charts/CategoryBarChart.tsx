import { Box } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../../utils/format'
import type { CategoryInsight } from '../../types'

const ROW_HEIGHT = 34

/** Horizontal bar chart of total spending per category. */
export function CategoryBarChart({ data }: { data: CategoryInsight[] }) {
  return (
    <Box sx={{ width: '100%', height: Math.max(160, data.length * ROW_HEIGHT + 40) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} fontSize={12} />
          <YAxis type="category" dataKey="name" width={110} fontSize={12} tickLine={false} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} cursor={{ fillOpacity: 0.06 }} />
          <Bar dataKey="total" name="Total spent" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((c) => (
              <Cell key={c.id} fill={c.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
