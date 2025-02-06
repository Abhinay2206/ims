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
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const InventorySearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  category, 
  setCategory 
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`
      }}
    >
      <Stack direction="row" spacing={2}>
        <TextField
          size="medium"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            }
          }}
        />
        
        <FormControl size="medium" sx={{ width: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            sx={{ borderRadius: 3 }}
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
      </Stack>
    </Card>
  );
};

export default InventorySearchFilter;