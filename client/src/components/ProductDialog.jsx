/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Fade,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ProductDialog = ({ open, onClose, product, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: '',
    lowStockThreshold: '', 
    price: '',
    category: '',
    manufacturing_date: '',
    expiry_date: '' // Changed from expire_date to expiry_date to match server model
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        stock: product.stock || '',
        lowStockThreshold: product.lowStockThreshold || '',
        price: product.price || '',
        category: product.category || '',
        manufacturing_date: product.manufacturing_date || '',
        expiry_date: product.expiry_date || '' // Changed from expire_date to expiry_date
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!product) {
      try {
        const response = await fetch('http://localhost:5017/api/product/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            expiry_date: formData.expiry_date // Ensure expiry_date is sent correctly
          })
        });

        if (response.ok) {
          const data = await response.json();
          onSave(data.product);
          setShowSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          console.error('Failed to add product');
        }
      } catch (error) {
        console.error('Error adding product:', error);
      }
    } else {
      onSave(formData);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            background: theme.palette.background.default,
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h5" fontWeight={600} color="primary">
            {product ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4 }}>
          <Box 
            component="form" 
            sx={{ 
              display: 'grid', 
              gap: 3,
              '& .MuiTextField-root': {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '2px'
                  }
                }
              }
            }}
          >
            <TextField
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              placeholder="Enter product name"
            />

            <TextField
              name="sku"
              label="SKU"
              value={formData.sku}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              placeholder="Enter SKU"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextField
                name="stock"
                label="Current Stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="0"
              />

              <TextField
                name="lowStockThreshold"
                label="Low Stock Alert"
                type="number"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="0"
              />
            </Box>

            <TextField
              name="price"
              label="Price"
              type="number"
              value={Math.floor(formData.price)}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: theme.palette.text.secondary }}>
                    ₹
                  </Typography>
                )
              }}
            />

            <TextField
              name="manufacturing_date"
              label="Manufacturing Date"
              type="date"
              value={formData.manufacturing_date}
              onChange={handleChange}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              name="expiry_date"
              label="Expiry Date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl 
              fullWidth 
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Meat">Meat</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Beverages">Beverages</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Groceries">Groceries</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 3, 
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 2
          }}
        >
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.sku || !formData.stock || !formData.price || !formData.category || !formData.expiry_date}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {product ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={1500} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Product added successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductDialog;
