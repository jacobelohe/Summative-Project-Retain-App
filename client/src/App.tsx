import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, Typography } from '@mui/material'

function Placeholder({ title }: { title: string }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">{title}</Typography>
    </Box>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
