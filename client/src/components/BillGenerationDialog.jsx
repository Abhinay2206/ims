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
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Close, Receipt, Print, ShoppingCart, Person, Payments } from '@mui/icons-material';

const BillGenerationDialog = ({ 
  billDialog, 
  selectedProduct, 
  saleQuantity, 
  setBillDialog, 
  setSelectedProduct, 
  setSaleQuantity, 
  handleGenerateBill 
}) => {
  const theme = useTheme();
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [billNumber] = useState(`BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`); 
  const [billDetails, setBillDetails] = useState(null);
  const [vendorName, setVendorName] = useState(''); 
  const [paymentType, setPaymentType] = useState('paid');
  const [discountReport, setDiscountReport] = useState(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [daysToExpiry, setDaysToExpiry] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      fetchDiscountRecommendations();
    }
  }, [selectedProduct]);

  const fetchDiscountRecommendations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/discount-recommendations');
      const data = await response.json();
      
      // Find discount suggestion for selected product
      const productDiscount = data.recommendations.find(item => item.sku === selectedProduct.sku);
      if (productDiscount) {
        setDiscountReport(productDiscount);
        setDaysToExpiry(productDiscount.days_until_expiry);
        setIsExpired(productDiscount.status === "EXPIRED - DO NOT SELL");
      }
    } catch (error) {
      console.error('Error fetching discount recommendations:', error);
    }
  };

  const handleCloseBillDialog = () => {
    setShowBillDialog(false);
    setBillDetails(null);
    setVendorName(''); 
    setPaymentType('paid');
    setApplyDiscount(false);
  };

  const handleGenerateBillClick = () => {
    if (!selectedProduct || !saleQuantity || !vendorName || isExpired) {
      return;
    }

    const quantity = parseInt(saleQuantity);
    let price = selectedProduct.price;
    if (applyDiscount && discountReport) {
      price = discountReport.discounted_price;
    }
    const total = Math.floor(price * quantity);
    setBillDetails({
      billNumber: billNumber,
      product: selectedProduct,
      quantity: quantity,
      total: total,
      vendorName,
      paymentType,
      discountApplied: applyDiscount ? discountReport.suggested_discount : 0
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
          <title>Print Invoice</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .invoice-header { text-align: center; margin-bottom: 40px; }
            .invoice-header h1 { color: #1976d2; margin: 0; }
            .invoice-header p { color: #666; margin: 5px 0; }
            .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-meta-item { flex: 1; }
            .invoice-meta-item h4 { color: #1976d2; margin: 0 0 10px 0; }
            .invoice-meta-item p { margin: 5px 0; color: #666; }
            .invoice table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .invoice th { background: #f5f5f5; padding: 15px; text-align: left; color: #1976d2; }
            .invoice td { padding: 15px; border-bottom: 1px solid #eee; }
            .invoice-total { text-align: right; margin: 20px 0; }
            .invoice-total h3 { color: #1976d2; }
            .terms { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
            .terms h3 { color: #1976d2; }
            .terms ul { padding-left: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="invoice-header">
              <h1>INVOICE</h1>
              <p>Your Trusted Shopping Partner</p>
            </div>

            <div class="invoice-meta">
              <div class="invoice-meta-item">
                <h4>Bill Details</h4>
                <p><strong>Invoice Number:</strong> ${billDetails.billNumber}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${billDetails.paymentType}</p>
              </div>
              <div class="invoice-meta-item">
                <h4>Vendor Details</h4>
                <p><strong>Name:</strong> ${billDetails.vendorName}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${billDetails.product.name}</td>
                  <td>${billDetails.product.sku}</td>
                  <td>${billDetails.quantity}</td>
                  <td>₹${Math.ceil(selectedProduct.price)}</td>
                  <td>${billDetails.discountApplied}%</td>
                  <td>₹${billDetails.total}</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-total">
              <h3>Total Amount: ₹${billDetails.total}</h3>
            </div>

            <div class="terms">
              <h3>Terms & Conditions</h3>
              <ul>
                <li>Payment is due within 30 days of invoice date</li>
                <li>All goods remain our property until paid for in full</li>
                <li>Returns accepted within 7 days with original packaging</li>
                <li>Damaged or defective items must be reported within 48 hours</li>
                <li>Late payments may incur additional charges</li>
                <li>Prices include all applicable taxes</li>
              </ul>
              <p style="text-align: center; margin-top: 30px; color: #666;">
                Thank you for your business!
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const totalAmount = selectedProduct ? 
    (applyDiscount && discountReport ? 
      discountReport.discounted_price * parseInt(saleQuantity) :
      selectedProduct.price * parseInt(saleQuantity)) : 
    0;
  const currentDate = new Date().toLocaleDateString();

  return (
    <>
      <Dialog
        open={billDialog}
        onClose={() => {
          setBillDialog(false);
          setSelectedProduct(null);
          setSaleQuantity('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight={600}>
                Generate Bill
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setBillDialog(false);
                setSelectedProduct(null);
                setSaleQuantity('');
              }}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main
                }
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {isExpired && (
              <Alert severity="error">
                This product has expired and cannot be sold.
              </Alert>
            )}

            <TextField
              label="Product"
              value={selectedProduct?.name || ''}
              disabled
              fullWidth
              InputProps={{
                startAdornment: (
                  <ShoppingCart sx={{ mr: 1, color: theme.palette.text.secondary }} />
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Available Stock"
                value={selectedProduct?.stock || ''}
                disabled
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              />

              <TextField
                label="Sale Quantity"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
                type="number"
                fullWidth
                autoFocus
                required
                disabled={isExpired}
                error={selectedProduct && parseInt(saleQuantity) > selectedProduct.stock}
                helperText={selectedProduct && parseInt(saleQuantity) > selectedProduct.stock ? 
                  "Quantity exceeds available stock" : ""}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />
            </Box>

            {daysToExpiry !== null && discountReport && !isExpired && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography color={daysToExpiry < 3 ? "error.main" : "warning.main"}>
                  Days to Expiry: {daysToExpiry}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={applyDiscount}
                      onChange={(e) => setApplyDiscount(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={`Apply ${discountReport.suggested_discount}% Discount (₹${discountReport.discounted_price} per unit)`}
                />
              </Box>
            )}

            <TextField
              label="Vendor Name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              fullWidth
              required
              disabled={isExpired}
              error={!vendorName}
              helperText={!vendorName ? "Vendor name is required" : ""}
              InputProps={{
                startAdornment: (
                  <Person sx={{ mr: 1, color: theme.palette.text.secondary }} />
                )
              }}
            />

            <TextField
              label="Payment Type"
              select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              fullWidth
              disabled={isExpired}
              InputProps={{
                startAdornment: (
                  <Payments sx={{ mr: 1, color: theme.palette.text.secondary }} />
                )
              }}
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="due">Due</MenuItem>
            </TextField>

            {saleQuantity && selectedProduct && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" align="right" color="primary.main">
                  Total: ₹{totalAmount > 0 ? totalAmount.toLocaleString() : '0'} 
                  {applyDiscount && discountReport && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      ({discountReport.suggested_discount}% off)
                    </Typography>
                  )}
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => {
              setBillDialog(false);
              setSelectedProduct(null);
              setSaleQuantity('');
            }}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateBillClick}
            variant="contained"
            disabled={!saleQuantity || !vendorName || isExpired ||
              (selectedProduct && parseInt(saleQuantity) > selectedProduct.stock)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            color: 'white',
            p: 3,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center">
            <Receipt sx={{ mr: 2 }} />
            <Typography variant="h5" fontWeight={600}>
              Sales Invoice
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Bill No: {billNumber}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {billDetails && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  Product Details
                </Typography>
                <TableContainer 
                  component={Paper} 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Discount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{billDetails.product.name}</TableCell>
                        <TableCell>{billDetails.product.sku}</TableCell>
                        <TableCell align="right">₹{Math.ceil(selectedProduct.price)}</TableCell>
                        <TableCell align="right">{billDetails.quantity}</TableCell>
                        <TableCell align="right">{billDetails.discountApplied}%</TableCell>
                        <TableCell align="right">₹{billDetails.total}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Paper
                elevation={0}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 3,
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1">
                  Date: {currentDate}
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight={600}>
                  Total Amount: ₹{parseFloat(billDetails.total).toFixed(2)}
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button 
                  variant="outlined"
                  onClick={handleCloseBillDialog}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4
                  }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Print />} 
                  onClick={handlePrint}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                  }}
                >
                  Print Invoice
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillGenerationDialog;