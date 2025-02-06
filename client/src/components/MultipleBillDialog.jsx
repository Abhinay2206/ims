/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Stack, 
  Typography, 
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Divider,
  MenuItem,
  Alert,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Card,
  FormControl,
  InputLabel,
  Select,
  Fade,
  Chip
} from '@mui/material';
import { 
  Close, 
  Receipt, 
  Print, 
  ShoppingCart, 
  Person, 
  Payments, 
  Add, 
  Delete, 
  Search as SearchIcon,
  LocalOffer,
  ShoppingBasket,
  CreditCard,
  MoneyOff
} from '@mui/icons-material';

const MultipleBillDialog = ({ 
  billDialog, 
  setBillDialog,
  handleGenerateBill 
}) => {
  const theme = useTheme();
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [billNumber] = useState(`BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const [billDetails, setBillDetails] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [paymentType, setPaymentType] = useState('paid');
  const [items, setItems] = useState([{
    product: null,
    quantity: '',
    price: 0,
    total: 0,
    discountReport: null,
    applyDiscount: false
  }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5017/api/product/');
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
          setFilteredProducts(result.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === category
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, category, products]);

  const handleAddItem = () => {
    setItems([...items, {
      product: null,
      quantity: '',
      price: 0,
      total: 0,
      discountReport: null,
      applyDiscount: false
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const fetchDiscountRecommendations = async (product, index) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/discount-recommendations');
      const data = await response.json();
      
      const productDiscount = data.recommendations.find(item => item.sku === product.sku);
      if (productDiscount) {
        const newItems = [...items];
        newItems[index].discountReport = productDiscount;
        setItems(newItems);
      }
    } catch (error) {
      console.error('Error fetching discount recommendations:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product') {
      fetchDiscountRecommendations(value, index);
      if (value) {
        newItems[index].price = value.price;
      }
    }
    
    if (field === 'quantity' || field === 'price' || field === 'applyDiscount') {
      const price = newItems[index].applyDiscount && newItems[index].discountReport ? 
        newItems[index].discountReport.discounted_price : 
        newItems[index].price;
      newItems[index].total = newItems[index].quantity * price;
    }
    
    setItems(newItems);
  };

  const handleCloseBillDialog = () => {
    setShowBillDialog(false);
    setBillDetails(null);
    setVendorName('');
    setPaymentType('paid');
    setItems([{
      product: null,
      quantity: '',
      price: 0,
      total: 0,
      discountReport: null,
      applyDiscount: false
    }]);
  };

  const handleGenerateBillClick = () => {
    if (!vendorName || items.some(item => !item.product || !item.quantity)) {
      return;
    }

    const total = items.reduce((sum, item) => sum + item.total, 0);
    
    setBillDetails({
      billNumber,
      items,
      total,
      vendorName,
      paymentType,
      date: new Date().toLocaleDateString()
    });
    
    handleGenerateBill();
    setShowBillDialog(true);
  };

  const handlePrint = () => {
    if (!billDetails) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Multiple Items Invoice</title>
          <style>
            body { 
              font-family: 'Segoe UI', Roboto, sans-serif; 
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #eee;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 25px 0;
              font-size: 0.9em;
            }
            th, td { 
              padding: 12px 15px; 
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
            th { 
              background-color: #f8f9fa;
              font-weight: 600;
            }
            .total {
              margin-top: 30px;
              text-align: right;
              font-size: 1.2em;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Invoice</h1>
              <p>Bill Number: ${billDetails.billNumber}</p>
            </div>
            <div style="text-align: right">
              <p>Date: ${billDetails.date}</p>
              <p>Vendor: ${billDetails.vendorName}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${billDetails.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>${item.applyDiscount ? `${item.discountReport.suggested_discount}%` : '0%'}</td>
                  <td>₹${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <h3>Total Amount: ₹${billDetails.total}</h3>
          </div>

          <div class="footer">
            <p>Payment Status: ${billDetails.paymentType}</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <Dialog
        open={billDialog}
        onClose={() => setBillDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart />
              <Typography variant="h6">New Multiple Items Bill</Typography>
            </Box>
            <IconButton onClick={() => setBillDialog(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Person sx={{ color: theme.palette.primary.main }} />
                <TextField
                  label="Vendor Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  fullWidth
                  required
                  error={!vendorName}
                  helperText={!vendorName ? "Vendor name is required" : ""}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>
            </Card>

            <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  Search Products
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="medium"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="Fruits">Fruits</MenuItem>
                      <MenuItem value="Vegetables">Vegetables</MenuItem>
                      <MenuItem value="Meat">Meat</MenuItem>
                      <MenuItem value="Dairy">Dairy</MenuItem>
                      <MenuItem value="Beverages">Beverages</MenuItem>
                      <MenuItem value="Grains">Grains</MenuItem>
                      <MenuItem value="Groceries">Groceries</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Card>

            <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={3}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  Items
                </Typography>
                
                {items.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        <FormControl fullWidth>
                          <InputLabel>Product</InputLabel>
                          <Select
                            value={item.product || ''}
                            label="Product"
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            required
                            sx={{ borderRadius: 2 }}
                          >
                            {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                              <MenuItem key={product._id} value={product}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <ShoppingBasket sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                                  <Typography>{product.name}</Typography>
                                  <Chip 
                                    label={`₹${product.price}`} 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                  />
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <TextField
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          type="number"
                          sx={{ width: '150px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          required
                        />
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            minWidth: 100,
                            color: theme.palette.success.main,
                            fontWeight: 600
                          }}
                        >
                          ₹{item.total}
                        </Typography>

                        {items.length > 1 && (
                          <IconButton 
                            onClick={() => handleRemoveItem(index)}
                            color="error"
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.error.main, 0.1)
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>

                      {item.discountReport && (
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={item.applyDiscount}
                              onChange={(e) => handleItemChange(index, 'applyDiscount', e.target.checked)}
                              color="primary"
                              icon={<LocalOffer />}
                              checkedIcon={<LocalOffer />}
                            />
                          }
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography>Apply Discount:</Typography>
                              <Chip 
                                label={`${item.discountReport.suggested_discount}% OFF`}
                                color="error"
                                size="small"
                              />
                              <Typography>
                                (₹{item.discountReport.discounted_price} per unit)
                              </Typography>
                            </Stack>
                          }
                        />
                      )}
                    </Stack>
                  </Box>
                ))}

                <Button
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  variant="outlined"
                  sx={{ 
                    alignSelf: 'flex-start',
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Add Item
                </Button>
              </Stack>
            </Card>

            <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  Payment Details
                </Typography>
                
                <TextField
                  label="Payment Type"
                  select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: paymentType === 'paid' ? 
                      <CreditCard sx={{ color: theme.palette.success.main, mr: 1 }} /> :
                      <MoneyOff sx={{ color: theme.palette.warning.main, mr: 1 }} />
                  }}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="due">Due</MenuItem>
                </TextField>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                      ₹{totalAmount}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Card>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBillDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateBillClick}
            variant="contained"
            disabled={!vendorName || items.some(item => !item.product || !item.quantity)}
            startIcon={<Receipt />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Generate Bill
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={showBillDialog} 
        onClose={handleCloseBillDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Bill Preview</Typography>
            <Typography>Bill No: {billNumber}</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {billDetails && (
            <Stack spacing={3}>
              <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Vendor</Typography>
                    <Typography variant="h6">{billDetails.vendorName}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="h6">{billDetails.date}</Typography>
                  </Box>
                </Stack>
              </Card>

              <TableContainer component={Card} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billDetails.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.price}</TableCell>
                        <TableCell align="right">
                          {item.applyDiscount ? (
                            <Chip 
                              label={`${item.discountReport.suggested_discount}%`}
                              color="error"
                              size="small"
                            />
                          ) : '0%'}
                        </TableCell>
                        <TableCell align="right">₹{item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Card 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                    <Chip 
                      label={billDetails.paymentType.toUpperCase()}
                      color={billDetails.paymentType === 'paid' ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600, mt: 1 }}>
                      ₹{billDetails.total}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseBillDialog} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Print Bill
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MultipleBillDialog;
