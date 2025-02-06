/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Stack,
  Chip,
  Fade,
  Tooltip,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdvancedReports = () => {
  const theme = useTheme();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [reportData, setReportData] = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, selectedTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5017/api/bill/');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const billsData = await response.json();

      // Filter bills based on selected date range
      const filteredBills = billsData.filter(bill => {
        const billDate = new Date(bill.Date);
        if (selectedTab === 0) { // Monthly
          return billDate.getFullYear() === selectedYear && 
                 billDate.getMonth() === selectedMonth;
        } else { // Yearly
          return billDate.getFullYear() === selectedYear;
        }
      });

      setBills(filteredBills);

      // Generate report data based on filtered bills
      const reportData = selectedTab === 0 ? 
        generateMonthlyReport(filteredBills) : 
        generateYearlyReport(filteredBills);

      setReportData(reportData);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load report data. Please try again.');
      setLoading(false);
      showSnackbar('Error loading report data', 'error');
    }
  };

  const generateMonthlyReport = (billsData) => {
    const totalRevenue = billsData.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const totalSales = billsData.length;
    const paidAmount = billsData
      .filter(bill => bill.paymentType.toLowerCase() === 'paid')
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const dueAmount = billsData
      .filter(bill => bill.paymentType.toLowerCase() === 'due')
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

    // Calculate sales by product SKU
    const productSales = billsData.reduce((acc, bill) => {
      if (!acc[bill.productSku]) {
        acc[bill.productSku] = {
          quantity: 0,
          revenue: 0,
          orders: 0
        };
      }
      acc[bill.productSku].quantity += Number(bill.quantity);
      acc[bill.productSku].revenue += Number(bill.totalAmount);
      acc[bill.productSku].orders += 1;
      return acc;
    }, {});

    // Get top products
    const topProducts = Object.entries(productSales)
      .map(([sku, data]) => ({
        sku,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily sales data for chart
    const dailySales = billsData.reduce((acc, bill) => {
      const day = new Date(bill.Date).getDate();
      if (!acc[day]) {
        acc[day] = {
          day,
          revenue: 0,
          orders: 0,
          paid: 0,
          due: 0
        };
      }
      acc[day].revenue += Number(bill.totalAmount);
      acc[day].orders += 1;
      if (bill.paymentType.toLowerCase() === 'paid') {
        acc[day].paid += Number(bill.totalAmount);
      } else {
        acc[day].due += Number(bill.totalAmount);
      }
      return acc;
    }, {});

    return {
      totalRevenue,
      totalSales,
      paidAmount,
      dueAmount,
      averageOrderValue: totalSales ? totalRevenue / totalSales : 0,
      topProducts,
      chartData: Object.values(dailySales).sort((a, b) => a.day - b.day)
    };
  };

  const generateYearlyReport = (billsData) => {
    // Initialize monthly data
    const monthlyData = months.map((month, index) => ({
      month,
      revenue: 0,
      orders: 0,
      paid: 0,
      due: 0
    }));

    // Populate monthly data
    billsData.forEach(bill => {
      const month = new Date(bill.Date).getMonth();
      monthlyData[month].revenue += Number(bill.totalAmount);
      monthlyData[month].orders += 1;
      
      if (bill.paymentType.toLowerCase() === 'paid') {
        monthlyData[month].paid += Number(bill.totalAmount);
      } else {
        monthlyData[month].due += Number(bill.totalAmount);
      }
    });

    const totalRevenue = billsData.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const totalOrders = billsData.length;
    const totalPaid = billsData
      .filter(bill => bill.paymentType.toLowerCase() === 'paid')
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const totalDue = billsData
      .filter(bill => bill.paymentType.toLowerCase() === 'due')
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

    return {
      totalRevenue,
      totalOrders,
      paidAmount: totalPaid,
      dueAmount: totalDue,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      chartData: monthlyData
    };
  };

  const handleExcelDownload = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Create summary worksheet
      const summaryData = [
        ['Summary Report', ''],
        ['Period', selectedTab === 0 ? `${months[selectedMonth]} ${selectedYear}` : selectedYear.toString()],
        ['Total Revenue', `$${reportData.totalRevenue.toFixed(2)}`],
        ['Total Orders', reportData.totalSales || reportData.totalOrders],
        ['Paid Amount', `$${reportData.paidAmount.toFixed(2)}`],
        ['Due Amount', `$${reportData.dueAmount.toFixed(2)}`],
        ['Average Order Value', `$${reportData.averageOrderValue.toFixed(2)}`]
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

      // Create trends worksheet
      const trendsData = [
        ['Date', 'Revenue', 'Paid', 'Due', 'Orders'],
        ...reportData.chartData.map(data => [
          selectedTab === 0 ? `Day ${data.day}` : data.month,
          data.revenue,
          data.paid,
          data.due,
          data.orders
        ])
      ];
      
      const trendsWS = XLSX.utils.aoa_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsWS, 'Trends');

      // If monthly report, add top products worksheet
      if (selectedTab === 0 && reportData.topProducts) {
        const productsData = [
          ['SKU', 'Orders', 'Quantity', 'Revenue'],
          ...reportData.topProducts.map(product => [
            product.sku,
            product.orders,
            product.quantity,
            product.revenue
          ])
        ];
        
        const productsWS = XLSX.utils.aoa_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsWS, 'Top Products');
      }

      // Generate Excel file
      XLSX.writeFile(workbook, `report_${selectedYear}_${selectedTab === 0 ? months[selectedMonth] : 'yearly'}.xlsx`);
      showSnackbar('Excel report downloaded successfully', 'success');
    } catch (err) {
      console.error('Error generating Excel:', err);
      showSnackbar('Failed to generate Excel report', 'error');
    }
  };

  const handlePdfDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Audit Report', 20, 20);
      
      // Add period
      doc.setFontSize(12);
      doc.text(`Period: ${selectedTab === 0 ? `${months[selectedMonth]} ${selectedYear}` : selectedYear}`, 20, 30);

      // Add summary table
      doc.autoTable({
        startY: 40,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `$${reportData.totalRevenue.toFixed(2)}`],
          ['Total Orders', reportData.totalSales || reportData.totalOrders],
          ['Paid Amount', `$${reportData.paidAmount.toFixed(2)}`],
          ['Due Amount', `$${reportData.dueAmount.toFixed(2)}`],
          ['Average Order Value', `$${reportData.averageOrderValue.toFixed(2)}`]
        ],
        theme: 'grid'
      });

      // Add trends table
      doc.addPage();
      doc.text('Revenue Trends', 20, 20);
      
      doc.autoTable({
        startY: 30,
        head: [['Date', 'Revenue', 'Paid', 'Due', 'Orders']],
        body: reportData.chartData.map(data => [
          selectedTab === 0 ? `Day ${data.day}` : data.month,
          `$${data.revenue.toFixed(2)}`,
          `$${data.paid.toFixed(2)}`,
          `$${data.due.toFixed(2)}`,
          data.orders
        ]),
        theme: 'grid'
      });

      // If monthly report, add top products
      if (selectedTab === 0 && reportData.topProducts) {
        doc.addPage();
        doc.text('Top Performing Products', 20, 20);
        
        doc.autoTable({
          startY: 30,
          head: [['SKU', 'Orders', 'Quantity', 'Revenue']],
          body: reportData.topProducts.map(product => [
            product.sku,
            product.orders,
            product.quantity,
            `$${product.revenue.toFixed(2)}`
          ]),
          theme: 'grid'
        });
      }

      // Save PDF
      doc.save(`report_${selectedYear}_${selectedTab === 0 ? months[selectedMonth] : 'yearly'}.pdf`);
      showSnackbar('PDF report downloaded successfully', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showSnackbar('Failed to generate PDF report', 'error');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.background.default, 0.8)})`,
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            mb: 4,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
                Audit Reports
              </Typography>
            </Stack>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Tabs 
            value={selectedTab} 
            onChange={(e, newValue) => setSelectedTab(newValue)} 
            sx={{ 
              mb: 4,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              label="Monthly Audit" 
              icon={<AssessmentIcon />} 
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab 
              label="Yearly Audit" 
              icon={<TrendingUpIcon />} 
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
          </Tabs>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Year"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {selectedTab === 0 && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Month"
                  >
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : error ? (
            <Alert severity="error" variant="filled" sx={{ mb: 3 }}>{error}</Alert>
          ) : reportData && (
            <Fade in={!loading}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <LocalAtmIcon color="primary" />
                            <Typography variant="subtitle1" color="primary">Total Revenue</Typography>
                          </Stack>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          ₹{reportData.totalRevenue.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <ReceiptLongIcon color="success" />
                            <Typography variant="subtitle1" color="success.main">Total Orders</Typography>
                          </Stack>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {reportData.totalSales || reportData.totalOrders}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <PaidIcon color="info" />
                            <Typography variant="subtitle1" color="info.main">Paid Amount</Typography>
                          </Stack>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          ₹{reportData.paidAmount.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <LocalAtmIcon color="warning" />
                            <Typography variant="subtitle1" color="warning.main">Due Amount</Typography>
                          </Stack>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          ₹{reportData.dueAmount.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Chart */}
                  <Card sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Revenue Trends
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData.chartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                          <XAxis 
                            dataKey={selectedTab === 0 ? "day" : "month"} 
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis stroke={theme.palette.text.secondary} />
                          <RechartsTooltip 
                            contentStyle={{
                              background: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke={theme.palette.primary.main} 
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="paid" 
                            stroke={theme.palette.success.main}
                            fillOpacity={1}
                            fill="url(#colorPaid)"
                            name="Paid"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="due" 
                            stroke={theme.palette.error.main}
                            fillOpacity={1}
                            fill="url(#colorDue)"
                            name="Due"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>

                  {/* Top Products - Only show in monthly view */}
                  {selectedTab === 0 && reportData.topProducts && (
                    <Card sx={{ mt: 4, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        Top Performing Products
                      </Typography>
                      <Grid container spacing={3}>
                        {reportData.topProducts.map((product, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                background: alpha(theme.palette.background.paper, 0.7),
                                backdropFilter: 'blur(4px)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: theme.shadows[4]
                                }
                              }}
                            >
                              <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                  <InventoryIcon color="primary" />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {product.sku}
                                  </Typography>
                                </Stack>
                                <Stack spacing={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Orders: {product.orders}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity: {product.quantity}
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                  ₹{product.revenue.toFixed(2)}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Card>
                  )}

                  <Card sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Export Report
                    </Typography>
                    <Stack direction="row" spacing={3}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExcelDownload}
                        sx={{ 
                          flex: 1,
                          py: 1.5,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                          }
                        }}
                      >
                        Download Excel Report
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handlePdfDownload}
                        sx={{ 
                          flex: 1,
                          py: 1.5,
                          background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`
                          }
                        }}
                      >
                        Download PDF Report
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdvancedReports;