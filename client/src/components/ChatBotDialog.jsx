/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  TextField, 
  Paper, 
  Typography, 
  Button, 
  Chip, 
  CircularProgress,
  Zoom,
  Fade,
  Avatar,
  Badge,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    maxWidth: 700,
    height: '85vh', 
    maxHeight: 800,
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.background.default,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)'
  }
}));

const MessageContainer = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent'
  }
});

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  borderRadius: '16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(33,150,243,0.2)'
  }
}));

const MessagePaper = styled(Paper)(({ isBot }) => ({
  padding: 16,
  marginBottom: 16,
  maxWidth: '80%',
  marginLeft: isBot ? 0 : 'auto',
  marginRight: isBot ? 'auto' : 0,
  backgroundColor: isBot ? '#ffffff' : '#e3f2fd',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  }
}));

const ChatBotDialog = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your advanced inventory assistant. I can help you with:\n• Inventory analysis\n• Stock alerts\n• Sales trends\n• Product insights\n• Bill management\n• Product search\n• Bill search\nHow can I assist you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const suggestedQueries = [
    { text: "Show expiring products", category: "alerts" },
    { text: "Show stock trends", category: "analysis" },
    { text: "Show payment status", category: "bills" },
    { text: "Show category breakdown", category: "insights" },
    { text: "Top selling products", category: "sales" },
    { text: "Critical stock alerts", category: "alerts" },
    { text: "Search product by name", category: "search" },
    { text: "Search bill by number", category: "search" }
  ];

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [billsResponse, productsResponse] = await Promise.all([
        fetch('http://localhost:5017/api/bill/', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5017/api/product/', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      if (!billsResponse.ok || !productsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const billsData = await billsResponse.json();
      const productsData = await productsResponse.json();
      
      setBills(billsData);
      setProducts(productsData.data || productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Connection error. Using offline data for demo.');
      setProducts([
        { name: "Demo Product", stock: 5, lowStockThreshold: 10, price: 100 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateStockTrendChart = () => {
    const stockData = products.map(product => ({
      name: product.name,
      stock: product.stock,
      threshold: product.lowStockThreshold
    })).slice(0, 10);

    return (
      <Fade in timeout={800}>
        <div style={{ height: 300, width: '100%', marginTop: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 12 }}>
          <ResponsiveContainer>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#666' }} />
              <YAxis tick={{ fill: '#666' }} />
              <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="stock" stroke="#2196F3" strokeWidth={2} dot={{ strokeWidth: 2 }} name="Current Stock" />
              <Line type="monotone" dataKey="threshold" stroke="#FF4842" strokeWidth={2} dot={{ strokeWidth: 2 }} name="Threshold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Fade>
    );
  };

  const processQuery = (query) => {
    const queryLower = query.toLowerCase();
    let response = '';
    let includeChart = false;

    if (queryLower.includes('trend') || queryLower.includes('chart')) {
      response = "Here's the stock trend analysis for your top products:";
      includeChart = true;
    }
    else if (queryLower.includes('expir')) {
      const expiringProducts = products.filter(product => {
        const expiryDate = new Date(product.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });
      
      response = expiringProducts.length > 0 
        ? `⚠️ Found ${expiringProducts.length} products expiring soon:\n${expiringProducts.map(p => 
            `• ${p.name} - Expires in ${Math.floor((new Date(p.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days`
          ).join('\n')}`
        : "✅ No products are expiring within the next 30 days.";
    }
    else if (queryLower.includes('payment') || queryLower.includes('status')) {
      const paidBills = bills.filter(b => b.paymentType.toLowerCase() === 'paid').length;
      const dueBills = bills.filter(b => b.paymentType.toLowerCase() === 'due').length;
      const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      
      response = `📊 Payment Status Overview:\n• Paid Bills: ${paidBills}\n• Due Bills: ${dueBills}\n• Total Amount: ₹${totalAmount.toFixed(2)}`;
    }
    else if (queryLower.includes('category')) {
      const categories = {};
      products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      
      response = `📦 Category Breakdown:\n${Object.entries(categories).map(([category, count]) => 
        `• ${category}: ${count} products`
      ).join('\n')}`;
    }
    else if (queryLower.includes('critical') || queryLower.includes('alert')) {
      const criticalProducts = products.filter(p => p.stock <= p.lowStockThreshold);
      response = criticalProducts.length > 0
        ? `🚨 Critical Stock Alerts:\n${criticalProducts.map(p => 
            `• ${p.name} - Stock: ${p.stock} (Threshold: ${p.lowStockThreshold})`
          ).join('\n')}`
        : "✅ No critical stock alerts at this time.";
    }
    else if (queryLower.includes('search product')) {
      response = "Please provide the product name you want to search for. For example: 'find product Apple'";
    }
    else if (queryLower.includes('search bill')) {
      response = "Please provide the bill number you want to search for. For example: 'find bill 12345'";
    }
    else if (queryLower.startsWith('find product ')) {
      const searchTerm = query.substring(13).toLowerCase();
      const foundProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));
      
      response = foundProducts.length > 0
        ? `📦 Found ${foundProducts.length} matching products:\n${foundProducts.map(p => 
            `• ${p.name}\n  - Stock: ${p.stock}\n  - Price: ₹${p.price}\n  - Category: ${p.category}\n  - Threshold: ${p.lowStockThreshold}`
          ).join('\n')}`
        : "❌ No products found matching your search term.";
    }
    else if (queryLower.startsWith('find bill ')) {
      const billNumber = query.substring(10);
      const foundBill = bills.find(b => b.billNumber.toString() === billNumber);
      
      response = foundBill
        ? `🧾 Bill Details:\n• Bill Number: ${foundBill.billNumber}\n• Date: ${new Date(foundBill.date).toLocaleDateString()}\n• Total Amount: $${foundBill.totalAmount}\n• Payment Status: ${foundBill.paymentType}\n• Customer: ${foundBill.customerName}`
        : "❌ No bill found with that number.";
    }
    else {
      response = "I can help you with:\n• Stock trends and analysis\n• Expiring product alerts\n• Payment status reports\n• Category breakdowns\n• Critical stock alerts\n• Product search (try 'find product [name]')\n• Bill search (try 'find bill [number]')\n\nPlease ask about any of these topics!";
    }

    setMessages(prev => [...prev, 
      { text: query, isBot: false },
      { text: response, isBot: true, includeChart }
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processQuery(input);
    setInput('');
  };

  return (
    <StyledDialog open={open} onClose={onClose} TransitionComponent={Zoom}>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar sx={{ bgcolor: 'white' }}>
            <SmartToyIcon sx={{ color: '#1976D2' }} />
          </Avatar>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Inventory Assistant</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>Always here to help</Typography>
          </div>
        </div>
        <IconButton 
          color="inherit" 
          onClick={onClose} 
          size="small"
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress size={40} thickness={4} />
          </div>
        )}
        
        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Suggested Queries:</Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggestedQueries.map((query, index) => (
              <StyledChip
                key={index}
                label={query.text}
                onClick={() => processQuery(query.text)}
                variant="outlined"
                color="primary"
                size="small"
              />
            ))}
          </div>
        </Paper>

        <MessageContainer>
          {messages.map((message, index) => (
            <Fade in timeout={500} key={index}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                {message.isBot ? (
                  <Avatar sx={{ bgcolor: '#1976D2' }}>
                    <SmartToyIcon />
                  </Avatar>
                ) : (
                  <Avatar sx={{ bgcolor: '#4CAF50' }}>
                    <PersonIcon />
                  </Avatar>
                )}
                <MessagePaper isBot={message.isBot}>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>{message.text}</Typography>
                  {message.includeChart && generateStockTrendChart()}
                </MessagePaper>
              </div>
            </Fade>
          ))}
          <div ref={messagesEndRef} />
        </MessageContainer>

        {showScrollButton && (
          <Zoom in>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 100,
                right: 24,
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={scrollToBottom}
            >
              <KeyboardArrowUpIcon />
            </IconButton>
          </Zoom>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: 3,
            backgroundColor: 'white',
            display: 'flex', 
            gap: 1,
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about products, bills, or inventory..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 28,
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#f0f0f0'
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff'
                }
              }
            }}
          />
          <IconButton 
            onClick={handleSend}
            disabled={loading}
            sx={{
              backgroundColor: '#2196F3',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: '#1976D2',
                transform: 'scale(1.05)'
              },
              '&.Mui-disabled': {
                backgroundColor: '#bdbdbd'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Paper>
      </DialogContent>
    </StyledDialog>
  );
};

export default ChatBotDialog;