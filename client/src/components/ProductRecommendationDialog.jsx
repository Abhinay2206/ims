/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  useTheme,
  Chip,
  Stack,
  Rating,
  IconButton,
  LinearProgress,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  Close, 
  Category, 
  AttachMoney, 
  TrendingUp, 
  Inventory,
  Warning,
  CheckCircle,
  Timeline,
  CompareArrows,
  LocalShipping
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ProductRecommendationDialog = ({ open, onClose, product }) => {
  const theme = useTheme();
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchDetailedData = async () => {
      if (!product) return;
      
      setLoading(true);
      try {
        // Fetch monthly predictions
        const monthlyResponse = await fetch(`http://127.0.0.1:5000/monthly-predictions/${product.sku}`);
        const monthlyData = await monthlyResponse.json();

        // Fetch yearly trend
        const yearlyResponse = await fetch(`http://127.0.0.1:5000/yearly-trend/${product.sku}`);
        const yearlyData = await yearlyResponse.json();

        // Fetch product recommendation for similar products
        const recResponse = await fetch(`http://127.0.0.1:5000/product-recommendation/${product.sku}`);
        const recData = await recResponse.json();
        setSimilarProducts(recData.similar_products || []);

        // Enhance the data for visualization
        const enhancedData = {
          ...product,
          monthly_predictions: monthlyData.map(item => ({
            ...item,
            predicted_sales: item.predicted_sales,
            profit_margin: (item.predicted_sales * product.price * 0.2).toFixed(2)
          })),
          yearly_trend: yearlyData.map(item => ({
            ...item,
            demand_index: item.demand_index
          }))
        };
        
        setDetailedData(enhancedData);
      } catch (error) {
        console.error('Error fetching detailed analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedData();
  }, [product]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch(riskLevel) {
      case 'HIGH': return theme.palette.error.main;
      case 'MEDIUM': return theme.palette.warning.main;
      case 'LOW-WATCH': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  if (!product) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '85vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 3,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Product Analysis: {product.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            SKU: {product.sku}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ width: '100%', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>Loading Analysis...</Typography>
          </Box>
        ) : (
          <>
            <Alert 
              severity={product.risk_level === 'HIGH' ? 'error' : product.risk_level === 'MEDIUM' ? 'warning' : 'info'}
              sx={{ mb: 3 }}
              icon={product.risk_level === 'HIGH' ? <Warning /> : <CheckCircle />}
            >
              Risk Level: {product.risk_level} - {product.current_stock < product.recommended_stock ? 
                'Stock levels are below recommended threshold' : 
                'Stock levels are within acceptable range'}
            </Alert>

            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Timeline />} label="Overview" />
              <Tab icon={<CompareArrows />} label="Similar Products" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Stack spacing={3}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Category & Price
                        </Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category color="primary" />
                            <Typography variant="h6">{product.category}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney color="primary" />
                            <Typography variant="h6">₹{product.price?.toFixed(2)}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Market Performance
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" gutterBottom>Market Demand Score</Typography>
                          <Rating 
                            value={product.market_demand_score / 20}
                            readOnly
                            precision={0.5}
                            size="large"
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {product.market_demand_score}/100
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Inventory Status
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                          <Chip 
                            icon={<Inventory />}
                            label={`Current Stock: ${product.current_stock}`}
                            color="primary"
                            variant="outlined"
                            sx={{ justifyContent: 'flex-start' }}
                          />
                          <Chip 
                            icon={<TrendingUp />}
                            label={`Target Stock: ${product.recommended_stock}`}
                            color="secondary"
                            variant="outlined"
                            sx={{ justifyContent: 'flex-start' }}
                          />
                          <Chip 
                            icon={<LocalShipping />}
                            label={`Reorder Quantity: ${product.recommended_stock - product.current_stock}`}
                            color={product.current_stock < product.recommended_stock ? "error" : "success"}
                            variant="outlined"
                            sx={{ justifyContent: 'flex-start' }}
                          />
                          <LinearProgress 
                            variant="determinate"
                            value={(product.current_stock / product.recommended_stock) * 100}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack spacing={4}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Monthly Sales Prediction</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={detailedData?.monthly_predictions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              yAxisId="left"
                              dataKey="predicted_sales" 
                              fill={theme.palette.primary.main}
                              name="Predicted Sales"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="profit_margin"
                              stroke={theme.palette.success.main}
                              name="Profit Margin (₹)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Yearly Demand Trend</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={detailedData?.yearly_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="demand_index" 
                              stroke={theme.palette.success.main}
                              name="Demand Index"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                {similarProducts.map((similar) => (
                  <Grid item xs={12} md={4} key={similar.sku}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{similar.name}</Typography>
                        <Stack spacing={2}>
                          <Typography variant="body2">SKU: {similar.sku}</Typography>
                          <Typography variant="body2">Price: ₹{similar.price}</Typography>
                          <Typography variant="body2">Category: {similar.category}</Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={() => {
                              onClose();
                              // Add logic to open this product's details
                            }}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductRecommendationDialog;
