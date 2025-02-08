import { useState, useMemo } from 'react';
import { 
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Inventory2,
  Logout,
  Menu as MenuIcon,
  BarChart,
  Group,
  Warehouse,
  Lightbulb,
  Analytics
} from '@mui/icons-material';

// Memoize static values
const drawerWidth = 280;

// Memoize styles
const getDrawerItemStyles = (theme) => ({
  borderRadius: 2, 
  mb: 1,
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    }
  }
});

const HomePage = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Memoize handlers
  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/${userRole === 'admin' ? 'manager' : 'user'}/${page}`);
  };

  // Memoize drawer content
  const drawer = useMemo(() => (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', boxShadow: 1 }}>
      <Box sx={{ 
        p: 1.2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
        color: 'white',
        mb: 2
      }}>
        <Avatar sx={{ 
          bgcolor: 'white', 
          color: 'primary.main',
          width: 45, 
          height: 45,
          boxShadow: 2
        }}>IS</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Inventory System</Typography>
      </Box>

      <List sx={{ px: 2 }}>
        <ListItem 
          button 
          selected={currentPage === 'dashboard'} 
          onClick={() => handlePageChange('dashboard')}
          sx={getDrawerItemStyles(theme)}
        >
          <ListItemIcon><DashboardIcon color={currentPage === 'dashboard' ? 'primary' : 'inherit'} /></ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: currentPage === 'dashboard' ? 600 : 500 }} />
        </ListItem>
        
        {userRole === 'admin' ? (
          <>
            <ListItem 
              button 
              selected={currentPage === 'inventory'} 
              onClick={() => handlePageChange('inventory')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Warehouse color={currentPage === 'inventory' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Inventory" primaryTypographyProps={{ fontWeight: currentPage === 'inventory' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button 
              selected={currentPage === 'user-management'} 
              onClick={() => handlePageChange('user-management')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Group color={currentPage === 'user-management' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="User Management" primaryTypographyProps={{ fontWeight: currentPage === 'user-management' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button 
              selected={currentPage === 'bill-details'}
              onClick={() => handlePageChange('bill-details')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><BarChart color={currentPage === 'bill-details' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Bill Details" primaryTypographyProps={{ fontWeight: currentPage === 'bill-details' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button
              selected={currentPage === 'advanced-reports'}
              onClick={() => handlePageChange('advanced-reports')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><BarChart color={currentPage === 'advanced-reports' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Advanced Reports" primaryTypographyProps={{ fontWeight: currentPage === 'advanced-reports' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button
              selected={currentPage === 'recommendation'}
              onClick={() => handlePageChange('recommendation')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Lightbulb color={currentPage === 'recommendation' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Product Analysis" primaryTypographyProps={{ fontWeight: currentPage === 'recommendation' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button
              selected={currentPage === 'customer-analysis'}
              onClick={() => handlePageChange('customer-analysis')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Analytics color={currentPage === 'customer-analysis' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Customer Analysis" primaryTypographyProps={{ fontWeight: currentPage === 'customer-analysis' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button
              selected={currentPage === 'supplier-analysis'}
              onClick={() => handlePageChange('supplier-analysis')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Analytics color={currentPage === 'supplier-analysis' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Supplier Analysis" primaryTypographyProps={{ fontWeight: currentPage === 'supplier-analysis' ? 600 : 500 }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              selected={currentPage === 'inventory'} 
              onClick={() => handlePageChange('inventory')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><Inventory2 color={currentPage === 'inventory' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Inventory" primaryTypographyProps={{ fontWeight: currentPage === 'inventory' ? 600 : 500 }} />
            </ListItem>

            <ListItem 
              button 
              selected={currentPage === 'bill-details'}
              onClick={() => handlePageChange('bill-details')}
              sx={getDrawerItemStyles(theme)}
            >
              <ListItemIcon><BarChart color={currentPage === 'bill-details' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Bill Details" primaryTypographyProps={{ fontWeight: currentPage === 'bill-details' ? 600 : 500 }} />
            </ListItem>
          </>
        )}

        <ListItem 
          button 
          selected={currentPage === 'charts'} 
          onClick={() => handlePageChange('charts')}
          sx={getDrawerItemStyles(theme)}
        >
          <ListItemIcon><BarChart color={currentPage === 'charts' ? 'primary' : 'inherit'} /></ListItemIcon>
          <ListItemText primary="Charts" primaryTypographyProps={{ fontWeight: currentPage === 'charts' ? 600 : 500 }} />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />
      
      <List sx={{ px: 2 }}>
        <ListItem 
          button 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: 2, 
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <ListItemIcon><Logout color="error" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
      </List>
    </Box>
  ), [currentPage, theme, userRole]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed"
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(8px)'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="primary"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main,
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}>
            {userRole === 'admin' ? 'M' : 'E'}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 3
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 3
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          minHeight: '100vh',
          p: 3
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default HomePage;