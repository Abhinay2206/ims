import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  LinearProgress,
  Chip,
  Stack,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Paper,
  Fade,
  Divider,
  IconButton,
  Tooltip,
  Container,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import { 
  Warning, 
  CheckCircle, 
  Info, 
  Category, 
  AttachMoney, 
  Search,
  TrendingUp,
  Inventory,
  Refresh,
  Analytics
} from '@mui/icons-material';
import ProductRecommendationDialog from '../components/ProductRecommendationDialog';

const Recommendation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inventoryRecommendations, setInventoryRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [demandFilter, setDemandFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/inventory-recommendations');
      const data = await response.json();
      setInventoryRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return <Warning sx={{ color: theme.palette.error.main }} />;
      case 'low-watch':
        return <Info sx={{ color: theme.palette.info.main }} />;
      case 'medium':
        return <Info sx={{ color: theme.palette.warning.main }} />;
      case 'low':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      default:
        return null;
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'low-watch':
        return 'info';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredRecommendations = inventoryRecommendations.filter(rec => {
    const matchesRisk = riskFilter === 'all' || rec.risk_level?.toLowerCase() === riskFilter;
    const matchesDemand = demandFilter === 'all' || 
      (demandFilter === 'high' && rec.market_demand_score >= 80) ||
      (demandFilter === 'medium' && rec.market_demand_score >= 50 && rec.market_demand_score < 80) ||
      (demandFilter === 'low' && rec.market_demand_score < 50);
    const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRisk && matchesDemand && matchesSearch;
  });

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ width: '100%', mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
            Analyzing Inventory Data
            <LinearProgress sx={{ mt: 2, borderRadius: 2, height: 6 }} />
          </Typography>
          <Grid container spacing={4}>
            {[1,2,3,4,5,6].map((n) => (
              <Grid item xs={12} md={6} lg={4} key={n}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 6,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
          }}>
            Inventory Insights
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered recommendations for optimal stock management
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            icon={<Analytics />}
            label={`${filteredRecommendations.length} Items`}
            color="primary"
            variant="outlined"
          />
          <Tooltip title="Refresh Analysis">
            <IconButton 
              onClick={fetchRecommendations} 
              sx={{ 
                bgcolor: theme.palette.primary.main + '10',
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '20',
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          mb: 6, 
          p: 4, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    '& > fieldset': { borderColor: theme.palette.primary.main }
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Level"
                onChange={(e) => setRiskFilter(e.target.value)}
                sx={{ 
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    '& > fieldset': { borderColor: theme.palette.primary.main }
                  }
                }}
              >
                <MenuItem value="all">All Risks</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
                <MenuItem value="medium">Medium Risk</MenuItem>
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="low-watch">Watch List</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Demand Level</InputLabel>
              <Select
                value={demandFilter}
                label="Demand Level"
                onChange={(e) => setDemandFilter(e.target.value)}
                sx={{ 
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    '& > fieldset': { borderColor: theme.palette.primary.main }
                  }
                }}
              >
                <MenuItem value="all">All Demand</MenuItem>
                <MenuItem value="high">High Demand</MenuItem>
                <MenuItem value="medium">Medium Demand</MenuItem>
                <MenuItem value="low">Low Demand</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {filteredRecommendations.map((rec, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Fade in={true} timeout={300 + index * 100}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'visible',
                  cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
                    border: `1px solid ${theme.palette.primary.main}30`
                  }
                }}
                onClick={() => handleCardClick(rec)}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{rec.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{rec.sku}</Typography>
                    </Box>
                    <Chip 
                      icon={getRiskIcon(rec.risk_level)}
                      label={rec.risk_level}
                      color={getRiskColor(rec.risk_level)}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 1,
                        '& .MuiChip-icon': { fontSize: 18 }
                      }}
                    />
                  </Box>
                  
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Category sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {rec.category}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AttachMoney sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        ₹{rec.price?.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                        Market Demand
                      </Typography>
                      <Rating 
                        value={rec.market_demand_score / 20} 
                        readOnly 
                        precision={0.5}
                        sx={{ 
                          '& .MuiRating-iconFilled': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                        <Chip 
                          label={rec.current_stock}
                          color="primary"
                          size="small"
                          icon={<Inventory sx={{ fontSize: 16 }} />}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Target Stock</Typography>
                        <Chip 
                          label={rec.recommended_stock}
                          color="secondary"
                          size="small"
                          icon={<TrendingUp sx={{ fontSize: 16 }} />}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Predicted Demand</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {rec.predicted_demand?.toFixed(1)}x
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <ProductRecommendationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={selectedProduct}
      />
    </Container>
  );
};

export default Recommendation;
