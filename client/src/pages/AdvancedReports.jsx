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
  const [products, setProducts] = useState([]);
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
      
      const [productsResponse, billsResponse] = await Promise.all([
        fetch('http://localhost:5017/api/product/'),
        fetch('http://localhost:5017/api/bill/')
      ]);

      if (!productsResponse.ok || !billsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const productsData = await productsResponse.json();
      const billsData = await billsResponse.json();

      const filteredBills = billsData.filter(bill => {
        const billDate = new Date(bill.date);
        if (selectedTab === 0) {
          return billDate.getFullYear() === selectedYear && 
                 billDate.getMonth() === selectedMonth;
        } else {
          return billDate.getFullYear() === selectedYear;
        }
      });

      setProducts(productsData.data);
      setBills(filteredBills);
      
      const report = selectedTab === 0 ? generateMonthlyReport(filteredBills, productsData.data) : generateYearlyReport(filteredBills, productsData.data);
      setReportData(report);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
      showSnackbar('Failed to load report data', 'error');
    }
  };

  const generateMonthlyReport = (billsData, productsData) => {
    const totalRevenue = billsData.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalSales = billsData.reduce((sum, bill) => 
      sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    const salesByProduct = {};
    billsData.forEach(bill => {
      bill.items.forEach(item => {
        if (!salesByProduct[item.productId]) {
          salesByProduct[item.productId] = {
            quantity: 0,
            revenue: 0
          };
        }
        salesByProduct[item.productId].quantity += item.quantity;
        salesByProduct[item.productId].revenue += item.price * item.quantity;
      });
    });

    const productSalesData = Object.entries(salesByProduct).map(([productId, data]) => {
      const product = productsData.find(p => p._id === productId);
      return {
        name: product ? product.name : 'Unknown',
        quantity: data.quantity,
        revenue: data.revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalSales,
      averageOrderValue: totalRevenue / billsData.length || 0,
      topProducts: productSalesData.slice(0, 5),
      totalOrders: billsData.length
    };
  };

  const generateYearlyReport = (billsData, productsData) => {
    const monthlyData = Array(12).fill(0).map(() => ({
      revenue: 0,
      sales: 0,
      orders: 0
    }));

    billsData.forEach(bill => {
      const month = new Date(bill.date).getMonth();
      monthlyData[month].revenue += bill.totalAmount;
      monthlyData[month].orders += 1;
      monthlyData[month].sales += bill.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    return {
      totalRevenue: monthlyData.reduce((sum, data) => sum + data.revenue, 0),
      totalSales: monthlyData.reduce((sum, data) => sum + data.sales, 0),
      totalOrders: monthlyData.reduce((sum, data) => sum + data.orders, 0),
      monthlyBreakdown: monthlyData.map((data, index) => ({
        month: months[index],
        ...data
      }))
    };
  };

  const downloadExcel = () => {
    if (!reportData) return;
    const ws = XLSX.utils.json_to_sheet([reportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `report_${selectedYear}_${selectedTab === 0 ? months[selectedMonth] : 'yearly'}.xlsx`);
  };

  const downloadPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.text(`${selectedTab === 0 ? 'Monthly' : 'Yearly'} Report - ${selectedYear}`, 20, 10);
    doc.autoTable({
      head: [['Metric', 'Value']],
      body: Object.entries(reportData).map(([key, value]) => [key, JSON.stringify(value)])
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
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
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
                              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                              <Bar dataKey="sales" fill="#82ca9d" name="Sales" />
                            </BarChart>
                          </ResponsiveContainer>
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