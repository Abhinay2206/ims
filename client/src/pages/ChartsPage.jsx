/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  Legend,
  Line,
  ComposedChart,
  Cell
} from 'recharts';
import { Fullscreen } from '@mui/icons-material';

const ChartsPage = () => {
  const theme = useTheme();
  const [productData, setProductData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenChart, setFullscreenChart] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, billResponse] = await Promise.all([
          fetch('http://localhost:5017/api/product/'),
          fetch('http://localhost:5017/api/bill/')
        ]);

        const productResult = await productResponse.json();
        const billResult = await billResponse.json();

        if (productResult.success) {
          // Combine product and sales data
          const salesByProduct = billResult.reduce((acc, bill) => {
            if (!acc[bill.productSku]) {
              acc[bill.productSku] = 0;
            }
            acc[bill.productSku] += bill.quantity;
            return acc;
          }, {});

          const chartData = productResult.data.map(product => ({
            name: product.name,
            stock: product.stock,
            price: Math.floor(product.price),
            salesVolume: salesByProduct[product.sku] || 0,
            stockValue: product.stock * product.price
          }));
          setProductData(chartData);
        }

        if (billResult) {
          const salesData = billResult.map(bill => ({
            name: `Bill #${bill.billNumber}`,
            totalAmount: bill.totalAmount,
            quantity: bill.quantity
          }));
          setBillData(salesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderFullscreenChart = () => {
    switch(fullscreenChart) {
      case 'bar':
        return (
          <BarChart width={800} height={600} data={productData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <ChartTooltip />
            <Bar dataKey="stock" name="Stock Level">
              {productData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.stock < 10 ? theme.palette.error.main : 
                        entry.stock < 30 ? theme.palette.warning.main : 
                        theme.palette.success.main}
                />
              ))}
            </Bar>
          </BarChart>
        );
      case 'composed':
        return (
          <ComposedChart width={800} height={600} data={productData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <ChartTooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="salesVolume" fill={theme.palette.primary.main} name="Sales Volume" />
            <Line yAxisId="right" type="monotone" dataKey="price" stroke={theme.palette.secondary.main} name="Price" />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
      {loading ? (
        <LinearProgress sx={{ mb: 4 }} />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ 
              boxShadow: theme.shadows[3], 
              borderRadius: 4,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[6],
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                    Stock Level Heatmap
                  </Typography>
                  <IconButton onClick={() => setFullscreenChart('bar')}>
                    <Fullscreen />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <ChartTooltip />
                    <Bar dataKey="stock" name="Stock Level">
                      {productData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.stock < 10 ? theme.palette.error.main : 
                                entry.stock < 30 ? theme.palette.warning.main : 
                                theme.palette.success.main}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ 
              boxShadow: theme.shadows[3], 
              borderRadius: 4,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[6],
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    Sales Volume vs Price Trend
                  </Typography>
                  <IconButton onClick={() => setFullscreenChart('composed')}>
                    <Fullscreen />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={productData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="salesVolume" fill={theme.palette.primary.main} name="Sales Volume" />
                    <Line yAxisId="right" type="monotone" dataKey="price" stroke={theme.palette.secondary.main} name="Price" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog 
        open={!!fullscreenChart} 
        onClose={() => setFullscreenChart(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {fullscreenChart === 'bar' && 'Stock Level Heatmap'}
          {fullscreenChart === 'composed' && 'Sales Volume vs Price Trend'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', height: 600 }}>
            {renderFullscreenChart()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullscreenChart(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChartsPage;