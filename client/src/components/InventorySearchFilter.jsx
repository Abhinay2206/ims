/* eslint-disable react/prop-types */
import { 
  Card, 
  Stack, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  alpha,
  useTheme,
  Button,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const InventorySearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  category, 
  setCategory,
  setMultipleBillDialog
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2.5}
        alignItems="center"
      >
        <TextField
          size="medium"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.grey[500], 0.04),
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[500], 0.08),
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }
          }}
        />
        
        <FormControl size="medium" sx={{ width: { xs: '100%', sm: 200 } }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            sx={{ 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.grey[500], 0.04),
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[500], 0.08),
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Fruits">Fruits</MenuItem>
            <MenuItem value="Vegetables">Vegetables</MenuItem>
            <MenuItem value="Meat">Meat</MenuItem>
            <MenuItem value="Dairy">Dairy</MenuItem>
            <MenuItem value="Beverages">Beverages</MenuItem>
            <MenuItem value="Grains">Grains</MenuItem>
            <MenuItem value="Groceries">Groceries</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => setMultipleBillDialog(true)}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            borderRadius: 3,
            bgcolor: 'success.main',
            textTransform: 'none',
            fontSize: '0.95rem',
            py: 1.2,
            px: 3,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'success.dark',
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          Create Multiple Bill
        </Button>
      </Stack>
    </Card>
  );
};

export default InventorySearchFilter;