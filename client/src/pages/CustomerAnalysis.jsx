/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, alpha, Chip, Button, IconButton, Tooltip as MuiTooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Area, AreaChart, LineChart, Line } from 'recharts';
import { Groups as GroupsIcon, Timeline as TimelineIcon, TrendingUp, TrendingDown, AttachMoney, Download, Refresh, Info, Star, StarBorder, StarHalf, Close } from '@mui/icons-material';

const CustomerAnalysis = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [segments, setSegments] = useState({segments: {}, profiles: {}});
  const [rfmAnalysis, setRfmAnalysis] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [customerTiers, setCustomerTiers] = useState({
    premium: { count: 0, percentage: 0, avgValue: 0, description: "Premium customers are our most valuable segment with highest RFM scores. They make frequent purchases with high monetary value.", criteria: "RFM Score >= 12", benefits: ["Priority Support", "Early Access to Deals", "Special Discounts"] },
    standard: { count: 0, percentage: 0, avgValue: 0, description: "Standard customers show moderate engagement with regular purchase patterns.", criteria: "RFM Score 8-11", benefits: ["Regular Promotions", "Standard Support", "Loyalty Rewards"] },
    basic: { count: 0, percentage: 0, avgValue: 0, description: "Basic customers are less engaged with lower purchase frequency and value.", criteria: "RFM Score < 8", benefits: ["Basic Support", "General Promotions", "Standard Features"] }
  });

  // Custom theme colors
  const THEME_COLORS = {
    primary: '#1976d2',
    secondary: '#000000',
    background: '#ffffff',
    text: '#000000',
    lightBlue: alpha('#1976d2', 0.1),
    hover: alpha('#1976d2', 0.05)
  };

  const handleOpenTierDetails = (tier) => {
    setSelectedTier(tier);
  };

  const handleCloseTierDetails = () => {
    setSelectedTier(null);
  };

  const TierDetailsDialog = ({ tier, open, onClose }) => {
    if (!tier) return null;

    const getTierIcon = (tierName) => {
      switch(tierName) {
        case 'premium':
          return <Star sx={{ color: '#FFD700', fontSize: 40 }} />;
        case 'standard':
          return <StarHalf sx={{ color: '#C0C0C0', fontSize: 40 }} />;
        case 'basic':
          return <StarBorder sx={{ color: '#CD7F32', fontSize: 40 }} />;
        default:
          return null;
      }
    };

    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: THEME_COLORS.background
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: alpha(THEME_COLORS.primary, 0.05),
          borderBottom: `1px solid ${alpha(THEME_COLORS.primary, 0.1)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getTierIcon(tier)}
            <Typography variant="h5" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {tier} Tier Details
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: alpha(THEME_COLORS.primary, 0.02), p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color={THEME_COLORS.primary}>Overview</Typography>
                <Typography>{customerTiers[tier].description}</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom color={THEME_COLORS.primary}>Statistics</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Customer Count</Typography>
                  <Typography variant="h6">{customerTiers[tier].count}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Percentage</Typography>
                  <Typography variant="h6">{customerTiers[tier].percentage.toFixed(1)}%</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Average Value</Typography>
                  <Typography variant="h6">₹{customerTiers[tier].avgValue.toFixed(2)}</Typography>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom color={THEME_COLORS.primary}>Criteria</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={customerTiers[tier].criteria}
                    sx={{ 
                      bgcolor: alpha(THEME_COLORS.primary, 0.1),
                      color: THEME_COLORS.primary,
                      fontWeight: 'medium'
                    }}
                  />
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom color={THEME_COLORS.primary}>Benefits</Typography>
                <Box sx={{ mt: 2 }}>
                  {customerTiers[tier].benefits.map((benefit, index) => (
                    <Chip 
                      key={index}
                      label={benefit}
                      sx={{ 
                        m: 0.5,
                        bgcolor: alpha(THEME_COLORS.primary, 0.1),
                        color: THEME_COLORS.primary
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(THEME_COLORS.primary, 0.1)}` }}>
          <Button 
            onClick={onClose}
            variant="contained"
            sx={{ 
              bgcolor: THEME_COLORS.primary,
              '&:hover': {
                bgcolor: alpha(THEME_COLORS.primary, 0.9)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [segmentsRes, rfmRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/customer-segments'),
        fetch('http://127.0.0.1:5000/rfm-analysis')
      ]);

      if (!segmentsRes.ok || !rfmRes.ok) {
        throw new Error('One or more API calls failed');
      }

      const [segmentsData, rfmData] = await Promise.all([
        segmentsRes.json(),
        rfmRes.json()
      ]);

      setSegments(segmentsData);
      setRfmAnalysis(rfmData);

      // Calculate customer tiers based on RFM scores
      const totalCustomers = Object.keys(rfmData.rfm_score || {}).length;
      const tierData = Object.entries(rfmData.rfm_score || {}).reduce((acc, [vendor, score]) => {
        const totalScore = score.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        const monetary = rfmData.monetary[vendor] || 0;
        
        if (totalScore >= 12) {
          acc.premium.count++;
          acc.premium.avgValue += monetary;
        } else if (totalScore >= 8) {
          acc.standard.count++;
          acc.standard.avgValue += monetary;
        } else {
          acc.basic.count++;
          acc.basic.avgValue += monetary;
        }
        return acc;
      }, {
        premium: { ...customerTiers.premium, count: 0, avgValue: 0 },
        standard: { ...customerTiers.standard, count: 0, avgValue: 0 },
        basic: { ...customerTiers.basic, count: 0, avgValue: 0 }
      });

      // Calculate percentages and average values
      Object.keys(tierData).forEach(tier => {
        tierData[tier].percentage = (tierData[tier].count / totalCustomers) * 100;
        tierData[tier].avgValue = tierData[tier].count > 0 ? 
          tierData[tier].avgValue / tierData[tier].count : 0;
      });

      setCustomerTiers(tierData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportData = () => {
    const data = tabValue === 0 ? rfmAnalysis : segments;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tabValue === 0 ? 'rfm-analysis' : 'customer-segments'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: THEME_COLORS.primary }} />
      </Box>
    );
  }

  const getRFMScoreColor = (score) => {
    const totalScore = score.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    if (totalScore <= 5) return THEME_COLORS.primary;
    if (totalScore <= 9) return alpha(THEME_COLORS.primary, 0.7);
    return alpha(THEME_COLORS.primary, 0.4);
  };

  const RFMSection = () => {
    const rfmBarData = Object.entries(rfmAnalysis.monetary || {}).map(([vendor, value]) => ({
      name: vendor,
      monetary: value,
      frequency: rfmAnalysis.frequency[vendor],
      recency: rfmAnalysis.recency[vendor]
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: THEME_COLORS.background,
            border: `1px solid ${alpha(THEME_COLORS.primary, 0.1)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TimelineIcon sx={{ fontSize: 32, color: THEME_COLORS.primary }} />
                  <Typography variant="h5" fontWeight="bold" color={THEME_COLORS.text}>RFM Analysis</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MuiTooltip title="Refresh Data">
                    <IconButton onClick={fetchData} disabled={refreshing}>
                      <Refresh sx={{ color: THEME_COLORS.primary }} />
                    </IconButton>
                  </MuiTooltip>
                  <MuiTooltip title="Export Data">
                    <IconButton onClick={handleExportData}>
                      <Download sx={{ color: THEME_COLORS.primary }} />
                    </IconButton>
                  </MuiTooltip>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: THEME_COLORS.lightBlue }}>
                      <TableCell sx={{ fontWeight: 'bold', color: THEME_COLORS.text }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: THEME_COLORS.text }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingDown /> Recency (Days)
                          <MuiTooltip title="Days since last purchase">
                            <Info fontSize="small" />
                          </MuiTooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: THEME_COLORS.text }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp /> Frequency
                          <MuiTooltip title="Number of purchases">
                            <Info fontSize="small" />
                          </MuiTooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: THEME_COLORS.text }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney /> Monetary
                          <MuiTooltip title="Total spend amount">
                            <Info fontSize="small" />
                          </MuiTooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: THEME_COLORS.text }}>RFM Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(rfmAnalysis.rfm_score || {}).map(([vendor, score]) => (
                      <TableRow key={vendor} sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: alpha(THEME_COLORS.primary, 0.02) },
                        '&:hover': { bgcolor: THEME_COLORS.hover },
                        transition: 'background-color 0.2s'
                      }}>
                        <TableCell>{vendor}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${rfmAnalysis.recency[vendor]} days`}
                            size="small"
                            sx={{ 
                              bgcolor: THEME_COLORS.lightBlue,
                              color: THEME_COLORS.primary,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={rfmAnalysis.frequency[vendor]}
                            size="small"
                            sx={{ 
                              bgcolor: THEME_COLORS.lightBlue,
                              color: THEME_COLORS.primary,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: THEME_COLORS.primary, fontWeight: 500 }}>
                            ₹{rfmAnalysis.monetary[vendor]?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={score}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(getRFMScoreColor(score), 0.1),
                              color: getRFMScoreColor(score),
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: 400, p: 2, bgcolor: alpha(THEME_COLORS.primary, 0.02), borderRadius: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rfmBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(THEME_COLORS.primary, 0.1)} />
                        <XAxis dataKey="name" stroke={THEME_COLORS.text} />
                        <YAxis stroke={THEME_COLORS.text} />
                        <Tooltip contentStyle={{ backgroundColor: THEME_COLORS.background, borderColor: THEME_COLORS.primary }} />
                        <Legend />
                        <Bar dataKey="monetary" fill={THEME_COLORS.primary} name="Monetary Value" />
                        <Bar dataKey="frequency" fill={alpha(THEME_COLORS.primary, 0.6)} name="Purchase Frequency" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 400, p: 2, bgcolor: alpha(THEME_COLORS.primary, 0.02), borderRadius: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rfmBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(THEME_COLORS.primary, 0.1)} />
                        <XAxis dataKey="name" stroke={THEME_COLORS.text} />
                        <YAxis stroke={THEME_COLORS.text} />
                        <Tooltip contentStyle={{ backgroundColor: THEME_COLORS.background, borderColor: THEME_COLORS.primary }} />
                        <Legend />
                        <Line type="monotone" dataKey="recency" stroke={THEME_COLORS.primary} name="Recency Trend" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const SegmentationSection = () => {
    const segmentData = Object.entries(segments?.segments?.Cluster || {}).map(([vendor, cluster]) => ({
      name: vendor,
      cluster: `Cluster ${cluster}`,
      transactions: segments.segments.billNumber_count[vendor],
      avgAmount: segments.segments.totalAmount_mean[vendor].toFixed(2),
      totalAmount: segments.segments.totalAmount_sum[vendor].toFixed(2)
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: THEME_COLORS.background,
            border: `1px solid ${alpha(THEME_COLORS.primary, 0.1)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GroupsIcon sx={{ fontSize: 32, color: THEME_COLORS.primary }} />
                  <Typography variant="h5" fontWeight="bold" color={THEME_COLORS.text}>Customer Segments</Typography>
                </Box>
                <MuiTooltip title="Export Data">
                  <IconButton onClick={handleExportData}>
                    <Download sx={{ color: THEME_COLORS.primary }} />
                  </IconButton>
                </MuiTooltip>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    innerRadius={80}
                    fill={THEME_COLORS.primary}
                    dataKey="transactions"
                    nameKey="cluster"
                    label
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={alpha(THEME_COLORS.primary, 1 - (index * 0.2))} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: THEME_COLORS.background, borderColor: THEME_COLORS.primary }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: THEME_COLORS.background,
            border: `1px solid ${alpha(THEME_COLORS.primary, 0.1)}`
          }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom color={THEME_COLORS.text}>Customer Tiers</Typography>
              <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME_COLORS.lightBlue, color: THEME_COLORS.text }}>Tier</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME_COLORS.lightBlue, color: THEME_COLORS.text }}>Percentage</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME_COLORS.lightBlue, color: THEME_COLORS.text }}>Avg Value</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: THEME_COLORS.lightBlue, color: THEME_COLORS.text }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ color: '#FFD700' }} />
                          Premium
                        </Box>
                      </TableCell>
                      <TableCell>{customerTiers.premium.percentage.toFixed(1)}%</TableCell>
                      <TableCell>₹{customerTiers.premium.avgValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenTierDetails('premium')}
                          sx={{ 
                            borderColor: THEME_COLORS.primary,
                            color: THEME_COLORS.primary,
                            '&:hover': {
                              borderColor: THEME_COLORS.primary,
                              bgcolor: alpha(THEME_COLORS.primary, 0.1)
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarHalf sx={{ color: '#C0C0C0' }} />
                          Standard
                        </Box>
                      </TableCell>
                      <TableCell>{customerTiers.standard.percentage.toFixed(1)}%</TableCell>
                      <TableCell>₹{customerTiers.standard.avgValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenTierDetails('standard')}
                          sx={{ 
                            borderColor: THEME_COLORS.primary,
                            color: THEME_COLORS.primary,
                            '&:hover': {
                              borderColor: THEME_COLORS.primary,
                              bgcolor: alpha(THEME_COLORS.primary, 0.1)
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarBorder sx={{ color: '#CD7F32' }} />
                          Basic
                        </Box>
                      </TableCell>
                      <TableCell>{customerTiers.basic.percentage.toFixed(1)}%</TableCell>
                      <TableCell>₹{customerTiers.basic.avgValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenTierDetails('basic')}
                          sx={{ 
                            borderColor: THEME_COLORS.primary,
                            color: THEME_COLORS.primary,
                            '&:hover': {
                              borderColor: THEME_COLORS.primary,
                              bgcolor: alpha(THEME_COLORS.primary, 0.1)
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 4, bgcolor: THEME_COLORS.background }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: THEME_COLORS.primary }}>
        Customer Analysis Dashboard
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4,
          '& .MuiTab-root': {
            fontSize: '1rem',
            textTransform: 'none',
            fontWeight: 'medium',
            minHeight: 48,
            color: THEME_COLORS.text,
            '&.Mui-selected': {
              color: THEME_COLORS.primary
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: THEME_COLORS.primary
          }
        }}
      >
        <Tab label="RFM Analysis" icon={<TimelineIcon />} iconPosition="start" />
        <Tab label="Customer Segmentation" icon={<GroupsIcon />} iconPosition="start" />
      </Tabs>

      {tabValue === 0 && <RFMSection />}
      {tabValue === 1 && <SegmentationSection />}
      
      <TierDetailsDialog 
        tier={selectedTier}
        open={Boolean(selectedTier)}
        onClose={handleCloseTierDetails}
      />
    </Box>
  );
};

export default CustomerAnalysis;