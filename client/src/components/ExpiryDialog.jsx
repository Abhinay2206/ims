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
import { Close, Warning } from '@mui/icons-material';

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

  const renderProductTable = (products, title, chipColor) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning sx={{ color: chipColor }} />
        {title}
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{new Date(product.expiry_date).toLocaleDateString()}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <Chip 
                    label={title} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(chipColor, 0.1),
                      color: chipColor,
                      fontWeight: 600
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
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            Product Expiry Status
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {renderProductTable(expiredProducts, 'Expired', theme.palette.error.main)}
        {renderProductTable(expiringProducts, 'Expiring Soon', theme.palette.warning.main)}
      </DialogContent>
    </Dialog>
  );
};

export default ExpiryDialog;
