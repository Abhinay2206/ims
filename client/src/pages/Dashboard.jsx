/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Fab, 
  useTheme, 
  alpha 
} from '@mui/material';
import { Warning, SmartToy } from '@mui/icons-material';

// Import all components
import DashboardStatsCards from '../components/DashboardStatsCard';
import InventorySearchFilter from '../components/InventorySearchFilter';
import InventoryTable from '../components/InventoryTable';
import StockUpdateDialog from '../components/StockUpdateDialog';
import BillGenerationDialog from '../components/BillGenerationDialog';
import LowStockAlertsDialog from '../components/LowStockAlerts';
import ExpiryDialog from '../components/ExpiryDialog';
import ChatbotDialog from '../components/ChatBotDialog';
import MultipleBillDialog from '../components/MultipleBillDialog';

const Dashboard = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [stockTrend, setStockTrend] = useState(5.2);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [tablePage, setTablePage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState(false);
  const [newStockValue, setNewStockValue] = useState('');
  const [billDialog, setBillDialog] = useState(false);
  const [multipleBillDialog, setMultipleBillDialog] = useState(false);
  const [saleQuantity, setSaleQuantity] = useState('');
  const [vendorName, setVendorName] = useState(''); 
  const [paymentType, setPaymentType] = useState('paid');
  const [alertsDialog, setAlertsDialog] = useState(false);
  const [expiryDialog, setExpiryDialog] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [billNumber, setBillNumber] = useState(`BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

  const itemsPerPage = 5;

  // Fetch Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5017/api/product/');
        const result = await response.json();
        
        if (result.success) {
          const products = result.data.map(product => ({
            id: product._id,
            name: product.name,
            sku: product.sku, 
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            price: product.price,
            category: product.category
          }));
          
          setInventory(products);
          setFilteredInventory(products);
          setLowStockItems(products.filter(item => item.stock < item.lowStockThreshold));
          setTotalValue(products.reduce((acc, item) => acc + (item.stock * item.price), 0));
        } else {
          console.error('Error fetching inventory:', result.message);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter Inventory
  useEffect(() => {
    const filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    });
    setFilteredInventory(filtered);
    setTablePage(0);
  }, [searchTerm, category, inventory]);

  // Utility Functions
  const getStockPercentage = (stock, threshold) => (stock / threshold) * 100;

  const handleTableNextPage = () => {
    const totalTablePages = Math.ceil(filteredInventory.length / itemsPerPage);
    if (tablePage < totalTablePages - 1) {
      setTablePage(tablePage + 1);
    }
  };

  const handleTablePrevPage = () => {
    if (tablePage > 0) {
      setTablePage(tablePage - 1);
    }
  };

  // Stock Update Handler
  const handleUpdateStock = async () => {
    if (!selectedProduct || !newStockValue) return;

    try {
      const response = await fetch(`http://localhost:5017/api/product/update/${selectedProduct.sku}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: parseInt(newStockValue)
        })
      });

      if (response.ok) {
        const updatedInventory = inventory.map(item => 
          item.sku === selectedProduct.sku ? {...item, stock: parseInt(newStockValue)} : item
        );
        setInventory(updatedInventory);
        setStockUpdateDialog(false);
        setSelectedProduct(null);
        setNewStockValue('');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  // Bill Generation Handler
  const handleGenerateBill = async () => {
    if (!selectedProduct || !saleQuantity || !vendorName || !paymentType) return;

    try {
      const billResponse = await fetch('http://localhost:5017/api/bill/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billNumber: `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productSku: selectedProduct.sku,
          quantity: parseInt(saleQuantity),
          totalAmount: selectedProduct.price * parseInt(saleQuantity),
          vendorName: vendorName,
          paymentType: paymentType
        })
      });

      if (!billResponse.ok) {
        throw new Error('Failed to generate bill');
      }

      const newStock = selectedProduct.stock - parseInt(saleQuantity);
      const stockResponse = await fetch(`http://localhost:5017/api/product/update/${selectedProduct.sku}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: newStock
        })
      });

      if (stockResponse.ok) {
        const updatedInventory = inventory.map(item => 
          item.sku === selectedProduct.sku ? {...item, stock: newStock} : item
        );
        setInventory(updatedInventory);
        setBillDialog(false);
        setSelectedProduct(null);
        setSaleQuantity('');
        setVendorName('');
        setPaymentType('paid');
      }
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  // Paginated Inventory
  const paginatedInventory = filteredInventory.slice(
    tablePage * itemsPerPage,
    (tablePage + 1) * itemsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Inventory Dashboard
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="soft"
              color="warning"
              startIcon={<Warning />}
              onClick={() => setExpiryDialog(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.dark,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.2)
                }
              }}
            >
              Expiry Status
            </Button>
            <Button
              variant="soft"
              color="warning"
              startIcon={<Warning />}
              onClick={() => setAlertsDialog(true)}
              disabled={lowStockItems.length === 0}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.dark,
                '&:hover': {
                  bgcolor: alpha(theme.palette.warning.main, 0.2)
                }
              }}
            >
              Low Stock ({lowStockItems.length})
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <DashboardStatsCards 
          inventory={inventory} 
          lowStockItems={lowStockItems}
          totalValue={totalValue}
          stockTrend={stockTrend}
        />

        {/* Search and Filter Section */}
        <InventorySearchFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          setMultipleBillDialog={setMultipleBillDialog}
        />

        {/* Inventory Table */}
        <InventoryTable 
          paginatedInventory={paginatedInventory}
          tablePage={tablePage}
          totalTablePages={Math.ceil(filteredInventory.length / itemsPerPage)}
          handleTablePrevPage={handleTablePrevPage}
          handleTableNextPage={handleTableNextPage}
          setSelectedProduct={setSelectedProduct}
          setStockUpdateDialog={setStockUpdateDialog}
          setBillDialog={setBillDialog}
          setBillNumber={setBillNumber}
          getStockPercentage={getStockPercentage}
        />

        {/* Dialogs */}
        <StockUpdateDialog 
          stockUpdateDialog={stockUpdateDialog}
          selectedProduct={selectedProduct}
          newStockValue={newStockValue}
          setStockUpdateDialog={setStockUpdateDialog}
          setSelectedProduct={setSelectedProduct}
          setNewStockValue={setNewStockValue}
          handleUpdateStock={handleUpdateStock}
        />

        <BillGenerationDialog 
          billDialog={billDialog}
          selectedProduct={selectedProduct}
          saleQuantity={saleQuantity}
          vendorName={vendorName} 
          setVendorName={setVendorName}
          paymentType={paymentType} 
          setPaymentType={setPaymentType} 
          setBillDialog={setBillDialog}
          setSelectedProduct={setSelectedProduct}
          setSaleQuantity={setSaleQuantity}
          handleGenerateBill={handleGenerateBill}
        />

        <MultipleBillDialog
          billDialog={multipleBillDialog}
          setBillDialog={setMultipleBillDialog}
          handleGenerateBill={handleGenerateBill}
        />

        <LowStockAlertsDialog 
          alertsDialog={alertsDialog}
          lowStockItems={lowStockItems}
          setAlertsDialog={setAlertsDialog}
          setSelectedProduct={setSelectedProduct}
          setStockUpdateDialog={setStockUpdateDialog}
        />

        <ExpiryDialog
          open={expiryDialog}
          onClose={() => setExpiryDialog(false)}
        />

        <ChatbotDialog 
          open={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
        />

        {/* Chatbot FAB */}
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setChatbotOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20
          }}
        >
          <SmartToy />
        </Fab>
      </Stack>
    </Container>
  );
};

export default Dashboard;