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
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
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

      // Fetch bills
      const billsRes = await fetch('http://localhost:5017/api/bill/');
      const billsData = await billsRes.json();

      if (!billsRes.ok) {
        throw new Error('Failed to fetch data');
      }

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

      // Generate report data
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
    // Calculate total revenue and sales
    const totalRevenue = billsData.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const totalSales = billsData.length;

    // Calculate sales by product SKU
    const productSales = {};
    billsData.forEach(bill => {
      if (!productSales[bill.productSku]) {
        productSales[bill.productSku] = {
          quantity: 0,
          revenue: 0
        };
      }
      productSales[bill.productSku].quantity += Number(bill.quantity) || 0;
      productSales[bill.productSku].revenue += Number(bill.totalAmount) || 0;
    });

    // Get top selling products
    const topProducts = Object.entries(productSales)
      .map(([sku, data]) => ({
        sku,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate sales by payment type
    const salesByPaymentType = billsData.reduce((acc, bill) => {
      const paymentType = bill.paymentType.toLowerCase();
      if (!acc[paymentType]) acc[paymentType] = 0;
      acc[paymentType] += Number(bill.totalAmount);
      return acc;
    }, {});

    return {
      totalRevenue,
      totalSales,
      averageOrderValue: totalSales ? totalRevenue / totalSales : 0,
      topProducts,
      salesByPaymentType,
      salesByDay: billsData.reduce((acc, bill) => {
        const day = new Date(bill.Date).getDate();
        if (!acc[day]) acc[day] = 0;
        acc[day] += Number(bill.totalAmount) || 0;
        return acc;
      }, {})
    };
  };

  const generateYearlyReport = (billsData) => {
    // Initialize monthly data
    const monthlyData = Array(12).fill(0).map(() => ({
      revenue: 0,
      orders: 0,
      paidAmount: 0,
      dueAmount: 0
    }));

    // Populate monthly data
    billsData.forEach(bill => {
      const month = new Date(bill.Date).getMonth();
      monthlyData[month].revenue += Number(bill.totalAmount);
      monthlyData[month].orders += 1;
      
      if (bill.paymentType.toLowerCase() === 'paid') {
        monthlyData[month].paidAmount += Number(bill.totalAmount);
      } else {
        monthlyData[month].dueAmount += Number(bill.totalAmount);
      }
    });

    // Add month names
    const monthlyBreakdown = monthlyData.map((data, index) => ({
      month: months[index],
      ...data
    }));

    // Calculate totals
    const totalRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0);
    const totalOrders = monthlyData.reduce((sum, data) => sum + data.orders, 0);
    const totalPaidAmount = monthlyData.reduce((sum, data) => sum + data.paidAmount, 0);
    const totalDueAmount = monthlyData.reduce((sum, data) => sum + data.dueAmount, 0);

    return {
      totalRevenue,
      totalOrders,
      totalPaidAmount,
      totalDueAmount,
      monthlyBreakdown,
      averageMonthlyRevenue: totalRevenue / 12
    };
  };

  const downloadExcel = () => {
    if (!reportData) return;
    
    const worksheet = XLSX.utils.json_to_sheet([{
      ...reportData,
      topProducts: JSON.stringify(reportData.topProducts || []),
      monthlyBreakdown: JSON.stringify(reportData.monthlyBreakdown || []),
      salesByPaymentType: JSON.stringify(reportData.salesByPaymentType || {})
    }]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `report_${selectedYear}_${selectedTab === 0 ? months[selectedMonth] : 'yearly'}.xlsx`);
  };

  const downloadPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    doc.text(`${selectedTab === 0 ? 'Monthly' : 'Yearly'} Report - ${selectedYear}`, 20, 10);
    
    const reportRows = Object.entries(reportData)
      .filter(([key]) => !['topProducts', 'monthlyBreakdown', 'salesByPaymentType'].includes(key))
      .map(([key, value]) => [
        key.replace(/([A-Z])/g, ' $1').toLowerCase(),
        typeof value === 'number' ? value.toFixed(2) : value
      ]);
    
    doc.autoTable({
      head: [['Metric', 'Value']],
      body: reportRows,
      startY: 20
    });
    
    doc.save(`report_${selectedYear}_${selectedTab === 0 ? months[selectedMonth] : 'yearly'}.pdf`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: alpha(theme.palette.primary.main, 0.03),
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }} color="primary">
            Audit Reports
          </Typography>

          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 4 }}>
            <Tab label="Monthly Audit" icon={<AssessmentIcon />} />
            <Tab label="Yearly Audit" icon={<TrendingUpIcon />} />
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : reportData && (
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedTab === 0 ? 'Monthly Report Summary' : 'Yearly Report Summary'}
                    </Typography>
                    {selectedTab === 0 ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Total Revenue</Typography>
                          <Typography variant="h6">${reportData.totalRevenue.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Total Sales</Typography>
                          <Typography variant="h6">{reportData.totalSales}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Average Order Value</Typography>
                          <Typography variant="h6">${reportData.averageOrderValue.toFixed(2)}</Typography>
                        </Grid>
                        {reportData.topProducts && reportData.topProducts.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Top Selling Products</Typography>
                            <Grid container spacing={2}>
                              {reportData.topProducts.map((product, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="subtitle2">SKU: {product.sku}</Typography>
                                      <Typography>Quantity: {product.quantity}</Typography>
                                      <Typography>Revenue: ${product.revenue.toFixed(2)}</Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData.monthlyBreakdown}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="revenue" fill={theme.palette.primary.main} name="Revenue" />
                              <Bar dataKey="orders" fill={theme.palette.secondary.main} name="Orders" />
                              <Bar dataKey="paidAmount" fill={theme.palette.success.main} name="Paid Amount" />
                              <Bar dataKey="dueAmount" fill={theme.palette.error.main} name="Due Amount" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2">Total Revenue</Typography>
                          <Typography variant="h6">${reportData.totalRevenue.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2">Total Orders</Typography>
                          <Typography variant="h6">{reportData.totalOrders}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2">Total Paid Amount</Typography>
                          <Typography variant="h6">${reportData.totalPaidAmount.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2">Total Due Amount</Typography>
                          <Typography variant="h6">${reportData.totalDueAmount.toFixed(2)}</Typography>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Download Report
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={downloadExcel}
                        >
                          Excel Report
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={downloadPDF}
                        >
                          PDF Report
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
            sx={{ borderRadius: 2, boxShadow: theme.shadows[10] }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdvancedReports;