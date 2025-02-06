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
  CardContent,
  Fade,
  Zoom,
  Paper,
  Divider,
  alpha,
  Tooltip,
  Avatar
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
  LocalShipping,
  Analytics,
  ShowChart,
  ArrowUpward,
  ArrowDownward,
  TrendingFlat,
  ShoppingCart,
  Assessment,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

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
        const monthlyResponse = await fetch(`http://127.0.0.1:5000/monthly-predictions/${product.sku}`);
        const monthlyData = await monthlyResponse.json();

        const yearlyResponse = await fetch(`http://127.0.0.1:5000/yearly-trend/${product.sku}`);
        const yearlyData = await yearlyResponse.json();

        const recResponse = await fetch(`http://127.0.0.1:5000/product-recommendation/${product.sku}`);
        const recData = await recResponse.json();
        setSimilarProducts(recData.similar_products || []);

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

  const getRiskIcon = (riskLevel) => {
    switch(riskLevel) {
      case 'HIGH': return <ArrowUpward color="error" />;
      case 'MEDIUM': return <TrendingFlat color="warning" />;
      case 'LOW-WATCH': return <ArrowDownward color="info" />;
      default: return <CheckCircle color="success" />;
    }
  };

  if (!product) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 4,
          minHeight: '90vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)}, ${alpha(theme.palette.background.default, 0.98)})`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 4,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <Assessment fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {product.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                mt: 0.5,
                color: alpha(theme.palette.text.secondary, 0.8)
              }}>
                SKU: {product.sku}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            width: 48,
            height: 48,
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
            backdropFilter: 'blur(4px)',
            '&:hover': { 
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.light, 0.2)})`,
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ 
            width: '100%', 
            height: '60vh',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CircularProgress 
              size={80} 
              thickness={4} 
              sx={{
                color: theme.palette.primary.main,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }}
            />
            <Typography variant="h5" sx={{ 
              mt: 3, 
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Analyzing Product Data...
            </Typography>
          </Box>
        ) : (
          <Zoom in={!loading} timeout={500}>
            <Box>
              <Paper 
                elevation={0}
                sx={{ 
                  mb: 4,
                  p: 3,
                  borderRadius: 4,
                  background: `linear-gradient(45deg, ${alpha(getRiskLevelColor(product.risk_level), 0.1)}, ${alpha(getRiskLevelColor(product.risk_level), 0.05)})`,
                  border: `1px solid ${alpha(getRiskLevelColor(product.risk_level), 0.2)}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar sx={{ 
                    width: 64, 
                    height: 64,
                    bgcolor: alpha(getRiskLevelColor(product.risk_level), 0.2),
                    color: getRiskLevelColor(product.risk_level)
                  }}>
                    {getRiskIcon(product.risk_level)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      color: getRiskLevelColor(product.risk_level),
                      fontWeight: 600,
                      mb: 1
                    }}>
                      Risk Level: {product.risk_level}
                    </Typography>
                    <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                      {product.current_stock < product.recommended_stock ? 
                        'Stock levels are critically below recommended threshold. Immediate action required.' : 
                        'Stock levels are within acceptable range. Continue monitoring.'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  mb: 4,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: alpha(theme.palette.text.primary, 0.7),
                    '&.Mui-selected': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5
                  }
                }}
              >
                <Tab 
                  icon={<Speed sx={{ mb: 0.5 }} />} 
                  label="Performance Analytics" 
                  iconPosition="start"
                  sx={{ textTransform: 'none' }}
                />
                <Tab 
                  icon={<CompareArrows sx={{ mb: 0.5 }} />} 
                  label="Similar Products" 
                  iconPosition="start"
                  sx={{ textTransform: 'none' }}
                />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                      <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 3
                        }}>
                          Product Details
                        </Typography>
                        <Stack spacing={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}>
                              <Category />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Category</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>{product.category}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}>
                              <AttachMoney />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Price</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>₹{product.price?.toFixed(2)}</Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Paper>

                      <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 3
                        }}>
                          Market Performance
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" gutterBottom>Market Demand Score</Typography>
                          <Box sx={{ 
                            position: 'relative',
                            display: 'inline-flex',
                            width: '100%',
                            justifyContent: 'center',
                            mb: 2
                          }}>
                            <CircularProgress
                              variant="determinate"
                              value={product.market_demand_score}
                              size={120}
                              thickness={8}
                              sx={{
                                color: theme.palette.primary.main,
                                '& .MuiCircularProgress-circle': {
                                  strokeLinecap: 'round'
                                }
                              }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center'
                            }}>
                              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {product.market_demand_score}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                /100
                              </Typography>
                            </Box>
                          </Box>
                          <Rating 
                            value={product.market_demand_score / 20}
                            readOnly
                            precision={0.5}
                            size="large"
                            sx={{ 
                              width: '100%',
                              justifyContent: 'center',
                              '& .MuiRating-iconFilled': {
                                color: theme.palette.primary.main
                              }
                            }}
                          />
                        </Box>
                      </Paper>

                      <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 3
                        }}>
                          Inventory Status
                        </Typography>
                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Current Stock
                            </Typography>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 700,
                              color: product.current_stock < product.recommended_stock ? 
                                theme.palette.error.main : theme.palette.success.main
                            }}>
                              {product.current_stock}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Target Stock
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {product.recommended_stock}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Stock Level
                            </Typography>
                            <Box sx={{ mt: 1, position: 'relative' }}>
                              <LinearProgress 
                                variant="determinate"
                                value={(product.current_stock / product.recommended_stock) * 100}
                                sx={{ 
                                  height: 16, 
                                  borderRadius: 8,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 8,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                                  }
                                }}
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  textShadow: '0 0 4px rgba(0,0,0,0.5)'
                                }}
                              >
                                {((product.current_stock / product.recommended_stock) * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Stack spacing={4}>
                      <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 3
                        }}>
                          Monthly Sales Forecast
                        </Typography>
                        <Box sx={{ mt: 2, height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={detailedData?.monthly_predictions}>
                              <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                              <XAxis 
                                dataKey="month" 
                                stroke={theme.palette.text.secondary}
                                tick={{ fill: theme.palette.text.secondary }}
                              />
                              <YAxis 
                                yAxisId="left" 
                                stroke={theme.palette.text.secondary}
                                tick={{ fill: theme.palette.text.secondary }}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke={theme.palette.success.main}
                                tick={{ fill: theme.palette.success.main }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  backdropFilter: 'blur(4px)'
                                }}
                              />
                              <Legend />
                              <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="predicted_sales"
                                stroke={theme.palette.primary.main}
                                fillOpacity={1}
                                fill="url(#salesGradient)"
                                name="Predicted Sales"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="profit_margin"
                                stroke={theme.palette.success.main}
                                strokeWidth={2}
                                name="Profit Margin (₹)"
                                dot={{ fill: theme.palette.success.main, r: 4 }}
                                activeDot={{ r: 6, stroke: theme.palette.success.light }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>

                      <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 3
                        }}>
                          Long-term Demand Trend
                        </Typography>
                        <Box sx={{ mt: 2, height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={detailedData?.yearly_trend}>
                              <defs>
                                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                              <XAxis 
                                dataKey="year" 
                                stroke={theme.palette.text.secondary}
                                tick={{ fill: theme.palette.text.secondary }}
                              />
                              <YAxis 
                                stroke={theme.palette.text.secondary}
                                tick={{ fill: theme.palette.text.secondary }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  backdropFilter: 'blur(4px)'
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="demand_index"
                                stroke={theme.palette.primary.main}
                                fillOpacity={1}
                                fill="url(#demandGradient)"
                                name="Demand Index"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  {similarProducts.map((similar) => (
                    <Grid item xs={12} md={4} key={similar.sku}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          borderRadius: 4,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderColor: alpha(theme.palette.primary.main, 0.2)
                          }
                        }}
                      >
                        <Stack spacing={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}>
                              <ShoppingCart />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {similar.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                SKU: {similar.sku}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Category sx={{ color: theme.palette.primary.main }} />
                              <Typography variant="body1">{similar.category}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachMoney sx={{ color: theme.palette.primary.main }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                ₹{similar.price}
                              </Typography>
                            </Box>
                          </Stack>

                          <Button 
                            variant="contained"
                            fullWidth
                            sx={{ 
                              mt: 2,
                              py: 1.5,
                              borderRadius: 3,
                              textTransform: 'none',
                              fontWeight: 600,
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                              }
                            }}
                            onClick={() => {
                              onClose();
                              // Add logic to open this product's details
                            }}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Zoom>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductRecommendationDialog;
