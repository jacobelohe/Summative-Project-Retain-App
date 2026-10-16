import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../hooks/useAuth'
import { useSignOut } from '../../hooks/useSignOut'
import { BrandMark } from './BrandMark'

const DRAWER_WIDTH = 248

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

const USER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
  { to: '/expenses', label: 'Expenses', icon: <ReceiptLongOutlinedIcon />, end: true },
  { to: '/expenses/new', label: 'Add expense', icon: <AddCircleOutlineIcon /> },
  { to: '/budget', label: 'Budget', icon: <SavingsOutlinedIcon /> },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Platform insights', icon: <InsightsOutlinedIcon />, end: true },
  { to: '/admin/categories', label: 'Categories', icon: <CategoryOutlinedIcon /> },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Main signed-in shell: permanent sidebar on desktop, slide-out drawer on mobile. */
export function AppLayout() {
  const { user, isAdmin } = useAuth()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [lastPath, setLastPath] = useState(location.pathname)

  // Close the mobile drawer after navigating.
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMobileOpen(false)
  }

  const handleSignOut = () => {
    setMenuAnchor(null)
    signOut()
    navigate('/login', { replace: true })
  }

  const renderItems = (items: NavItem[]) =>
    items.map((item) => (
      <ListItemButton
        key={item.to}
        component={NavLink}
        to={item.to}
        end={item.end}
        sx={{
          mx: 1.5,
          mb: 0.5,
          borderRadius: 2,
          color: 'text.secondary',
          '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText' },
          '&.active .MuiListItemIcon-root': { color: 'primary.contrastText' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    ))

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <BrandMark />
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1.5 }} subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>My money</ListSubheader>}>
        {renderItems(USER_NAV)}
      </List>
      {isAdmin && (
        <List subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>Administration</ListSubheader>}>
          {renderItems(ADMIN_NAV)}
        </List>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton onClick={handleSignOut} sx={{ mx: 1.5, borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </ListItemButton>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <BrandMark />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {isAdmin && <Chip label="Admin" color="secondary" size="small" sx={{ mr: 1.5 }} />}
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
              {user ? initials(user.name) : '?'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1280, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
