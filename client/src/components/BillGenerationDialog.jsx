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
  Alert,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Fade,
  Container,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { Close, Receipt, Print, ShoppingCart, Person, Payments, LocalOffer, CalendarToday, Info } from '@mui/icons-material';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      fetchDiscountRecommendations();
    }
  }, [selectedProduct]);

  const fetchDiscountRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/discount-recommendations');
      const data = await response.json();
      
      const productDiscount = data.recommendations.find(item => item.sku === selectedProduct.sku);
      if (productDiscount) {
        setDiscountReport(productDiscount);
        setDaysToExpiry(productDiscount.days_until_expiry);
        setIsExpired(productDiscount.status === "EXPIRED - DO NOT SELL");
      }
    } catch (error) {
      console.error('Error fetching discount recommendations:', error);
    } finally {
      setLoading(false);
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
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${billDetails.product.name}</td>
                  <td>${billDetails.quantity}</td>
                  <td>₹${(billDetails.total / billDetails.quantity).toFixed(2)}</td>
                  <td>₹${billDetails.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-total">
              <h3>Total Amount: ₹${billDetails.total.toFixed(2)}</h3>
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
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShoppingCart sx={{ 
                color: theme.palette.primary.main,
                fontSize: '2rem'
              }} />
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
                  color: theme.palette.error.main,
                  transform: 'rotate(90deg)',
                  transition: 'transform 0.3s'
                }
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider sx={{ 
          '&::before, &::after': {
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }
        }}/>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {isExpired && (
              <Alert 
                severity="error"
                variant="filled"
                sx={{ borderRadius: 2 }}
              >
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
                  <ShoppingCart sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
                sx: {
                  borderRadius: 2,
                  '&.Mui-disabled': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Available Stock"
                value={selectedProduct?.stock || ''}
                disabled
                fullWidth
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
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
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>

            {daysToExpiry !== null && discountReport && !isExpired && (
              <Card 
                elevation={0}
                sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  borderRadius: 3,
                  p: 2
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color={daysToExpiry < 3 ? "error" : "warning"} />
                    <Typography color={daysToExpiry < 3 ? "error.main" : "warning.main"}>
                      Days to Expiry: {daysToExpiry}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={applyDiscount}
                        onChange={(e) => setApplyDiscount(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>Apply Discount:</Typography>
                        <Chip 
                          label={`${discountReport.suggested_discount}% OFF`}
                          color="success"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          (₹{discountReport.discounted_price} per unit)
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Card>
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
                  <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
                sx: { borderRadius: 2 }
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
                  <Payments sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
                sx: { borderRadius: 2 }
              }}
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="due">Due</MenuItem>
            </TextField>

            {saleQuantity && selectedProduct && (
              <Card 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)'
                }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Box>
                    <Typography variant="h5" color="primary.main" fontWeight={600}>
                      ₹{totalAmount > 0 ? totalAmount.toLocaleString() : '0'}
                    </Typography>
                    {applyDiscount && discountReport && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', textAlign: 'right' }}>
                        {discountReport.suggested_discount}% discount applied
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
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
              px: 4,
              py: 1,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
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
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 4px 20px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
              }
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
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            p: 3,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Receipt sx={{ fontSize: '2rem' }} />
            <Typography variant="h5" fontWeight={600}>
              Sales Invoice
            </Typography>
          </Box>
          <Chip
            label={`Bill No: ${billNumber}`}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '& .MuiChip-label': {
                px: 2
              }
            }}
          />
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
                  elevation={0}
                  sx={{ 
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    overflow: 'hidden'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
                      }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Product Name</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>SKU</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Price</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Discount</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                        <TableCell>{billDetails.product.name}</TableCell>
                        <TableCell>{billDetails.product.sku}</TableCell>
                        <TableCell align="right">₹{Math.ceil(selectedProduct.price)}</TableCell>
                        <TableCell align="right">{billDetails.quantity}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${billDetails.discountApplied}%`}
                            color={billDetails.discountApplied > 0 ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                          ₹{billDetails.total}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Card
                elevation={0}
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday />
                    <Typography>
                      Date: {currentDate}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    Total Amount: ₹{parseFloat(billDetails.total).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button 
                  variant="outlined"
                  onClick={handleCloseBillDialog}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2
                    }
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
                    py: 1.5,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                    }
                  }}
                >
                  Print Invoice
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default BillGenerationDialog;