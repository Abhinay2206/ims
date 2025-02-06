/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Box,
  Stack,
  Paper,
  useTheme,
  Chip,
  alpha
} from '@mui/material';
import { Close, Warning, ErrorOutline, AccessTime } from '@mui/icons-material';

const ExpiryDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5017/api/product/');
      const result = await response.json();
      
      if (result.success) {
        const currentDate = new Date();
        const products = result.data;

        // Filter expired and expiring soon products
        const expired = products.filter(product => new Date(product.expiry_date) < currentDate);
        const expiringSoon = products.filter(product => {
          const expiry_date = new Date(product.expiry_date);
          const daysUntilExpiry = Math.ceil((expiry_date - currentDate) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });

        setExpiredProducts(expired);
        setExpiringProducts(expiringSoon);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const renderProductTable = (products, title, chipColor, icon) => (
    <Box sx={{ 
      mt: 3,
      backgroundColor: alpha(chipColor, 0.03),
      borderRadius: 3,
      p: 3
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: chipColor,
          fontWeight: 600
        }}
      >
        {icon}
        {title}
        <Chip
          label={products.length}
          size="small"
          sx={{
            ml: 1,
            bgcolor: alpha(chipColor, 0.1),
            color: chipColor,
            fontWeight: 600
          }}
        />
      </Typography>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 300,
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.common.white, 0.9) }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.common.white, 0.9) }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.common.white, 0.9) }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.common.white, 0.9) }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.common.white, 0.9) }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product._id}
                sx={{ '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.5) } }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{new Date(product.expiry_date).toLocaleDateString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Chip 
                    label={title} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(chipColor, 0.1),
                      color: chipColor,
                      fontWeight: 600,
                      borderRadius: '6px'
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
        }
      }}
    >
      <DialogTitle sx={{ px: 4, py: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700}>
            Product Expiry Status
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        {renderProductTable(expiredProducts, 'Expired', theme.palette.error.main, <ErrorOutline />)}
        {renderProductTable(expiringProducts, 'Expiring Soon', theme.palette.warning.main, <AccessTime />)}
      </DialogContent>
    </Dialog>
  );
};

export default ExpiryDialog;
