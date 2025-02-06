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
  Tooltip
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
  Refresh
} from '@mui/icons-material';
import ProductRecommendationDialog from '../components/ProductRecommendationDialog';

const Recommendation = () => {
  const theme = useTheme();
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
      <Box sx={{ width: '100%', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Loading Recommendations...</Typography>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Inventory Insights & Recommendations
        </Typography>
        <Tooltip title="Refresh Recommendations">
          <IconButton onClick={fetchRecommendations} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, category or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Level"
                onChange={(e) => setRiskFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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

      <Grid container spacing={3}>
        {filteredRecommendations.map((rec, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Fade in={true} timeout={300 + index * 100}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'visible',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => handleCardClick(rec)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{rec.name}</Typography>
                    <Chip 
                      icon={getRiskIcon(rec.risk_level)}
                      label={rec.risk_level}
                      color={getRiskColor(rec.risk_level)}
                      size="small"
                      sx={{ borderRadius: 1.5, fontWeight: 500 }}
                    />
                  </Box>
                  
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Category fontSize="small" color="primary" />
                      <Typography variant="body1">
                        {rec.category}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AttachMoney fontSize="small" color="primary" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ₹{rec.price?.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Market Demand
                      </Typography>
                      <Rating 
                        value={rec.market_demand_score / 20} 
                        readOnly 
                        precision={0.5}
                        size="large"
                        sx={{ 
                          '& .MuiRating-iconFilled': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </Box>

                    <Divider />

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Current Stock</Typography>
                        <Chip 
                          label={rec.current_stock}
                          color="primary"
                          size="small"
                          icon={<Inventory sx={{ fontSize: 16 }} />}
                          sx={{ borderRadius: 1.5 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Target Stock</Typography>
                        <Chip 
                          label={rec.recommended_stock}
                          color="secondary"
                          size="small"
                          icon={<TrendingUp sx={{ fontSize: 16 }} />}
                          sx={{ borderRadius: 1.5 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Predicted Demand</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
    </Box>
  );
};

export default Recommendation;
