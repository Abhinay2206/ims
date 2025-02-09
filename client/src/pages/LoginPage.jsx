import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeIcon from '@mui/icons-material/Home';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !loginType) {
      setError('Please fill in all fields');
      setShowError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setShowError(true);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setShowError(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5017/api/auth/login', {
        email: email.toLowerCase().trim(),
        password,
        role: loginType,
      });

      const { token, email: userEmail } = response.data;

      Cookies.set('jwtToken', token, { 
        secure: true, 
        sameSite: 'strict',
        expires: 10/24
      });
      
      Cookies.set('email', userEmail, { 
        secure: true, 
        sameSite: 'strict',
        expires: 10/24
      });
      
      Cookies.set('userRole', loginType, { 
        secure: true, 
        sameSite: 'strict',
        expires: 10/24
      });

      if (loginType === 'admin') {
        navigate('/manager/dashboard');
      } else {
        navigate('/user/dashboard');
      }

    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid input. Please check your credentials.';
            break;
          case 401:
            errorMessage = 'Invalid email or password.';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this role.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.error || errorMessage;
        }
      }
      
      setError(errorMessage);
      setShowError(true);
      console.error('Login error:', error);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <IconButton 
        onClick={() => navigate('/')}
        sx={{ 
          position: 'absolute',
          top: 20,
          left: 20,
          color: theme.palette.primary.main
        }}
      >
        <HomeIcon sx={{ fontSize: 32 }} />
      </IconButton>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          borderRadius: '24px',
          overflow: 'hidden',
          minHeight: '600px',
          width: '100%',
          background: theme.palette.background.paper,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Left Side - Product Info */}
        <Box
          sx={{
            flex: '1 1 50%',
            p: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <InventoryIcon sx={{ fontSize: 48, mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              IMS Pro
            </Typography>
          </Box>
          
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Welcome to the Future of Inventory Management
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Transform your business with our cutting-edge inventory system
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              ✓ Real-time stock tracking
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              ✓ Advanced analytics and reporting
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: '1 1 50%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="login-type-label">Select Role</InputLabel>
              <Select
                labelId="login-type-label"
                value={loginType}
                label="Select Role"
                onChange={(e) => setLoginType(e.target.value)}
                required
              >
                <MenuItem value="user">Inventory Staff</MenuItem>
                <MenuItem value="admin">Inventory Manager</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              inputProps={{
                maxLength: 50,
                pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{ mb: 4 }}
              inputProps={{
                minLength: 8,
                maxLength: 50
              }}
            />

            <Stack spacing={2}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!loginType || !email || !password}
                sx={{
                  py: 1.8,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                  }
                }}
              >
                Sign In to Dashboard
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/request')}
                sx={{
                  py: 1.8,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '10'
                  }
                }}
              >
                Request New Manager Access
              </Button>
            </Stack>

          </Box>
        </Box>
      </Paper>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default LoginPage;
