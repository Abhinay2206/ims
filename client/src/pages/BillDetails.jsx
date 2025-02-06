import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  IconButton, 
  TextField, 
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  LinearProgress,
  Stack,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as ViewIcon, 
  Print as PrintIcon, 
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Cancel as CancelIcon,
  GetApp as ExportIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { saveAs } from 'file-saver';

const BillPage = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dueSummary, setDueSummary] = useState({
    totalVendors: 0,
    totalAmount: 0,
    vendors: []
  });
  const [filter, setFilter] = useState({
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: ''
  });
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [billsResponse, productsResponse] = await Promise.all([
          fetch('http://localhost:5017/api/bill/'),
          fetch('http://localhost:5017/api/product/')
        ]);
        
        const billsResult = await billsResponse.json();
        const productsResult = await productsResponse.json();
        
        setBills(billsResult);
        setProducts(productsResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Calculate due summary
    const dueBills = bills.filter(bill => bill.paymentType?.toLowerCase() === 'due');
    const vendorMap = new Map();

    dueBills.forEach(bill => {
      const daysOverdue = differenceInDays(new Date(), new Date(bill.createdAt));
      if (!vendorMap.has(bill.vendorName)) {
        vendorMap.set(bill.vendorName, {
          totalAmount: bill.totalAmount,
          daysOverdue,
          billCount: 1
        });
      } else {
        const vendor = vendorMap.get(bill.vendorName);
        vendorMap.set(bill.vendorName, {
          totalAmount: vendor.totalAmount + bill.totalAmount,
          daysOverdue: Math.max(vendor.daysOverdue, daysOverdue),
          billCount: vendor.billCount + 1
        });
      }
    });

    const totalAmount = dueBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    setDueSummary({
      totalVendors: vendorMap.size,
      totalAmount,
      vendors: Array.from(vendorMap.entries()).map(([name, data]) => ({
        name,
        ...data
      }))
    });
  }, [bills]);

  useEffect(() => {
    const filtered = bills.filter(bill => {
      const product = products.find(p => p.sku === bill.productSku);
      const matchesSearch = 
        (product && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bill.billNumber && bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAmountFilter = 
        (!filter.minAmount || bill.totalAmount >= parseFloat(filter.minAmount)) &&
        (!filter.maxAmount || bill.totalAmount <= parseFloat(filter.maxAmount));
      
      const matchesDateFilter = 
        (!filter.dateFrom || new Date(bill.createdAt) >= new Date(filter.dateFrom)) &&
        (!filter.dateTo || new Date(bill.createdAt) <= new Date(filter.dateTo));
      
      return matchesSearch && matchesAmountFilter && matchesDateFilter;
    });
    
    setFilteredBills(filtered);
  }, [searchTerm, bills, products, filter]);

  const handlePrint = (bill) => {
    const product = products.find(p => p.sku === bill.productSku);
    const productName = product ? product.name : 'Unknown Product';
    
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
                <p><strong>Invoice Number:</strong> ${bill.billNumber}</p>
                <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${bill.paymentType || 'N/A'}</p>
              </div>
              <div class="invoice-meta-item">
                <h4>Vendor Details</h4>
                <p><strong>Name:</strong> ${bill.vendorName || 'N/A'}</p>
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
                  <td>${productName}</td>
                  <td>${bill.quantity}</td>
                  <td>₹${(bill.totalAmount / bill.quantity).toFixed(2)}</td>
                  <td>₹${bill.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-total">
              <h3>Total Amount: ₹${bill.totalAmount.toFixed(2)}</h3>
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

  const handleDownload = (bill) => {
    const csvContent = `data:text/csv;charset=utf-8,` +
      `Bill Number,Product Name,Quantity,Total Amount,Date,Vendor Name,Payment Type\n` +
      `${bill.billNumber},${bill.productName},${bill.quantity},₹${bill.totalAmount.toFixed(2)},${new Date(bill.createdAt).toLocaleDateString()},${bill.vendorName || 'N/A'},${bill.paymentType || 'N/A'}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bill_${bill.billNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (bill) => {
    const product = products.find(p => p.sku === bill.productSku);
    setSelectedBill({ 
      ...bill, 
      productName: product ? product.name : 'Unknown Product' 
    });
  };

  const clearFilters = () => {
    setFilter({
      minAmount: '',
      maxAmount: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const csvData = filteredBills.map(bill => ({
      BillNumber: bill.billNumber,
      ProductName: products.find(p => p.sku === bill.productSku)?.name || 'Unknown Product',
      Quantity: bill.quantity,
      TotalAmount: bill.totalAmount.toFixed(2),
      Date: format(new Date(bill.createdAt), 'dd MMM yyyy'),
      VendorName: bill.vendorName || 'N/A',
      PaymentType: bill.paymentType || 'N/A'
    }));

    const csvContent = [
      ['Bill Number', 'Product Name', 'Quantity', 'Total Amount', 'Date', 'Vendor Name', 'Payment Type'],
      ...csvData.map(item => [item.BillNumber, item.ProductName, item.Quantity, item.TotalAmount, item.Date, item.VendorName, item.PaymentType])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'bills.csv');
  };

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Due Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: 'rgba(255, 72, 66, 0.08)', 
              p: 3,
              height: '75%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(255, 72, 66, 0.15)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <WarningIcon color="error" />
              <Typography variant="h6" color="error.main">Due Summary</Typography>
            </Stack>
            <Typography variant="h4" sx={{ mt: 3, mb: 1, color: 'error.main', fontWeight: 700 }}>
              {dueSummary.totalVendors}
            </Typography>
            <Typography variant="body1" color="error.main" sx={{ opacity: 0.8 }}>
              Vendors with Due Payments
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: 'rgba(255, 171, 0, 0.08)',
              p: 3,
              height: '75%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(255, 171, 0, 0.15)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              
              <Typography variant="h6" color="warning.main">Total Due Amount</Typography>
            </Stack>
            <Typography variant="h4" sx={{ mt: 3, mb: 1, color: 'warning.main', fontWeight: 700 }}>
              ₹{dueSummary.totalAmount.toFixed(2)}
            </Typography>
            <Typography variant="body1" color="warning.main" sx={{ opacity: 0.8 }}>
              Outstanding Payments
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            sx={{
              borderRadius: '16px', 
              bgcolor: 'rgba(24, 144, 255, 0.08)',
              p: 3,
              height: '75%',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(24, 144, 255, 0.15)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <PersonIcon color="info" />
              <Typography variant="h6" color="info.main">Vendor Details</Typography>
            </Stack>
            <Box sx={{ mt: 3 }}>
              <Button
                startIcon={<PersonIcon />}
                onClick={() => setVendorDialogOpen(true)}
                variant="contained"
                color="info"
                fullWidth
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                View All Vendors
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: '24px',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search bills by product name or bill number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      transform: 'translateY(-2px)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Tooltip title="Filter Bills">
                  <IconButton 
                    sx={{ 
                      bgcolor: 'primary.soft',
                      color: 'primary.main',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        bgcolor: 'primary.softHover',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
                {(filter.minAmount || filter.maxAmount || filter.dateFrom || filter.dateTo) && (
                  <Tooltip title="Clear Filters">
                    <IconButton 
                      onClick={clearFilters}
                      sx={{ 
                        bgcolor: 'error.soft',
                        color: 'error.main',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          bgcolor: 'error.softHover',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Export to CSV">
                  <IconButton 
                    onClick={exportToCSV}
                    sx={{ 
                      bgcolor: 'success.soft',
                      color: 'success.main',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        bgcolor: 'success.softHover',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {loading ? (
            <LinearProgress 
              sx={{ 
                borderRadius: '8px',
                height: '8px',
                '.MuiLinearProgress-bar': {
                  borderRadius: '8px'
                }
              }} 
            />
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{ 
                borderRadius: '20px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Bill Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.map((bill) => {
                    const product = products.find(p => p.sku === bill.productSku);
                    const isDue = bill.paymentType?.toLowerCase() === 'due';
                    return (
                      <TableRow 
                        key={bill.billNumber} 
                        hover 
                        sx={{ 
                          transition: 'all 0.3s ease',
                          backgroundColor: isDue ? 'error.soft' : 'inherit',
                          '&:hover': { 
                            backgroundColor: isDue ? 'error.softHover' : 'action.hover',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={bill.billNumber} 
                            color={isDue ? 'error' : 'primary'} 
                            variant="outlined" 
                            size="small"
                            sx={{ 
                              borderRadius: '12px',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 2 }
                            }}
                          />
                        </TableCell>
                        <TableCell>{product ? product.name : 'Unknown Product'}</TableCell>
                        <TableCell align="right">{bill.quantity}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: isDue ? 'error.main' : 'success.main',
                              fontWeight: 600,
                              bgcolor: isDue ? 'error.soft' : 'success.soft',
                              px: 2,
                              py: 1,
                              borderRadius: '12px',
                              fontSize: '0.875rem'
                            }}
                          >
                            ₹{bill.totalAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              fontWeight: 500 
                            }}
                          >
                            {format(new Date(bill.createdAt), 'dd MMM yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewDetails(bill)}
                                sx={{ 
                                  bgcolor: 'primary.soft',
                                  color: 'primary.main',
                                  borderRadius: '10px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { 
                                    bgcolor: 'primary.softHover',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Bill">
                              <IconButton 
                                size="small"
                                onClick={() => handlePrint(bill)}
                                sx={{ 
                                  bgcolor: 'secondary.soft',
                                  color: 'secondary.main',
                                  borderRadius: '10px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { 
                                    bgcolor: 'secondary.softHover',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Bill">
                              <IconButton 
                                size="small"
                                onClick={() => handleDownload(bill)}
                                sx={{ 
                                  bgcolor: 'success.soft',
                                  color: 'success.main',
                                  borderRadius: '10px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { 
                                    bgcolor: 'success.softHover',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={!!selectedBill} 
        onClose={() => setSelectedBill(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            backgroundImage: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #1976d2 30%, #2196f3 90%)',
            color: '#fff',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bill Details
          </Typography>
          <IconButton 
            onClick={() => setSelectedBill(null)}
            sx={{ 
              color: '#fff',
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.2)' 
              }
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedBill && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                  Bill Information
                </Typography>
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 3, 
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Bill Number:</strong> 
                    <Chip 
                      label={selectedBill.billNumber} 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                      sx={{ 
                        ml: 2, 
                        borderRadius: '12px',
                        borderColor: selectedBill.paymentType?.toLowerCase() === 'due' ? 'error.main' : 'primary.main'
                      }}
                    />
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong> {format(new Date(selectedBill.createdAt), 'dd MMMM yyyy, hh:mm a')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Vendor Name:</strong> {selectedBill.vendorName || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Payment Type:</strong> {selectedBill.paymentType || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                  Product Details
                </Typography>
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 3, 
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Product:</strong> {selectedBill.productName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Quantity:</strong> {selectedBill.quantity}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #1976d2 30%, #2196f3 90%)',
                  p: 3, 
                  borderRadius: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
                }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{selectedBill.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendors Dialog */}
      <Dialog
        open={vendorDialogOpen}
        onClose={() => setVendorDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            backgroundImage: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #1976d2 30%, #2196f3 90%)',
            color: '#fff',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Vendor List
          </Typography>
          <IconButton 
            onClick={() => setVendorDialogOpen(false)}
            sx={{ 
              color: '#fff',
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.2)' 
              }
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell align="right">Total Due Amount</TableCell>
                  <TableCell align="right">Days Overdue</TableCell>
                  <TableCell align="right">Bill Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dueSummary.vendors.map((vendor, index) => (
                  <TableRow key={index}>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell align="right">₹{vendor.totalAmount.toFixed(2)}</TableCell>
                    <TableCell align="right">{vendor.daysOverdue}</TableCell>
                    <TableCell align="right">{vendor.billCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BillPage;