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
  CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 600,
    height: '80vh',
    maxHeight: 700,
    display: 'flex',
    flexDirection: 'column'
  }
}));

const MessageContainer = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '20px',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#bdbdbd',
    borderRadius: '4px',
  }
});

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
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
      <div style={{ height: 300, width: '100%', marginTop: 16 }}>
        <ResponsiveContainer>
          <LineChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="stock" stroke="#2196F3" name="Current Stock" />
            <Line type="monotone" dataKey="threshold" stroke="#FF4842" name="Threshold" />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
      
      response = `📊 Payment Status Overview:\n• Paid Bills: ${paidBills}\n• Due Bills: ${dueBills}\n• Total Amount: $${totalAmount.toFixed(2)}`;
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
            `• ${p.name}\n  - Stock: ${p.stock}\n  - Price: $${p.price}\n  - Category: ${p.category}\n  - Threshold: ${p.lowStockThreshold}`
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
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Advanced Inventory Assistant</span>
          {error && <WarningIcon color="error" />}
        </div>
        <IconButton color="inherit" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        )}
        
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

        <MessageContainer>
          {messages.map((message, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                maxWidth: '80%',
                ml: message.isBot ? 0 : 'auto',
                mr: message.isBot ? 'auto' : 0,
                backgroundColor: message.isBot ? '#f8f9fa' : '#e3f2fd',
                borderRadius: 2,
                whiteSpace: 'pre-line',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Typography>{message.text}</Typography>
              {message.includeChart && generateStockTrendChart()}
            </Paper>
          ))}
          <div ref={messagesEndRef} />
        </MessageContainer>

        {showScrollButton && (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 100,
              right: 24,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            onClick={scrollToBottom}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        )}

        <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
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
              }
            }}
          />
          <IconButton 
            onClick={handleSend}
            disabled={loading}
            sx={{
              backgroundColor: '#2196F3',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1976D2',
              },
              '&.Mui-disabled': {
                backgroundColor: '#bdbdbd',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </div>
      </DialogContent>
    </StyledDialog>
  );
};

export default ChatBotDialog;