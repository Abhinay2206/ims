/* eslint-disable no-unused-vars */
import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Stack, 
  Box, 
  Typography, 
  Button,
  Fab,
  useTheme, 
  alpha,
  Skeleton,
  CircularProgress 
} from '@mui/material';
import { Warning, SmartToy } from '@mui/icons-material';

// Lazy load components
const DashboardStatsCards = lazy(() => import('../components/DashboardStatsCard'));
const InventorySearchFilter = lazy(() => import('../components/InventorySearchFilter'));
const InventoryTable = lazy(() => import('../components/InventoryTable'));
const StockUpdateDialog = lazy(() => import('../components/StockUpdateDialog'));
const BillGenerationDialog = lazy(() => import('../components/BillGenerationDialog')); 
const LowStockAlertsDialog = lazy(() => import('../components/LowStockAlerts'));
const ExpiryDialog = lazy(() => import('../components/ExpiryDialog'));
const ChatbotDialog = lazy(() => import('../components/ChatBotDialog'));
const MultipleBillDialog = lazy(() => import('../components/MultipleBillDialog'));

const Dashboard = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const itemsPerPage = 5;

  // Memoized derived states with debouncing
  const lowStockItems = useMemo(() => 
    inventory.filter(item => item.stock < item.lowStockThreshold),
    [inventory]
  );

  const totalValue = useMemo(() => 
    inventory.reduce((acc, item) => acc + (item.stock * item.price), 0),
    [inventory]
  );

  const filteredInventory = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return inventory.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      return !searchTerm || 
             item.name.toLowerCase().includes(searchTermLower) ||
             item.sku.toLowerCase().includes(searchTermLower);
    });
  }, [inventory, searchTerm, category]);

  const paginatedInventory = useMemo(() => 
    filteredInventory.slice(
      tablePage * itemsPerPage,
      (tablePage + 1) * itemsPerPage
    ),
    [filteredInventory, tablePage]
  );

  // Fetch Inventory with caching
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const cachedData = sessionStorage.getItem('inventoryData');
        if (cachedData) {
          setInventory(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5017/api/product/');
        const result = await response.json();
        
        if (result.success) {
          const products = result.data.map(({ _id, name, sku, stock, lowStockThreshold, price, category }) => ({
            id: _id,
            name,
            sku, 
            stock,
            lowStockThreshold,
            price,
            category
          }));
          
          setInventory(products);
          sessionStorage.setItem('inventoryData', JSON.stringify(products));
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleTableNextPage = () => {
    if (tablePage < Math.ceil(filteredInventory.length / itemsPerPage) - 1) {
      setTablePage(p => p + 1);
    }
  };

  const handleTablePrevPage = () => {
    if (tablePage > 0) {
      setTablePage(p => p - 1);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct?.sku || !newStockValue) return;

    try {
      const response = await fetch(`http://localhost:5017/api/product/update/${selectedProduct.sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: +newStockValue })
      });

      if (response.ok) {
        setInventory(prev => prev.map(item => 
          item.sku === selectedProduct.sku ? {...item, stock: +newStockValue} : item
        ));
        setStockUpdateDialog(false);
        setSelectedProduct(null);
        setNewStockValue('');
        sessionStorage.removeItem('inventoryData');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedProduct?.sku || !saleQuantity || !vendorName || !paymentType) return;

    try {
      const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const [billResponse, stockResponse] = await Promise.all([
        fetch('http://localhost:5017/api/bill/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billNumber,
            productSku: selectedProduct.sku,
            quantity: +saleQuantity,
            totalAmount: selectedProduct.price * +saleQuantity,
            vendorName,
            paymentType
          })
        }),
        fetch(`http://localhost:5017/api/product/update/${selectedProduct.sku}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock: selectedProduct.stock - +saleQuantity
          })
        })
      ]);

      if (billResponse.ok && stockResponse.ok) {
        setInventory(prev => prev.map(item => 
          item.sku === selectedProduct.sku 
            ? {...item, stock: item.stock - +saleQuantity} 
            : item
        ));
        setBillDialog(false);
        setSelectedProduct(null);
        setSaleQuantity('');
        setVendorName('');
        setPaymentType('paid');
        sessionStorage.removeItem('inventoryData');
      }
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '48px'
        }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary"
            sx={{
              fontSize: '2rem',
              lineHeight: 1.2
            }}
          >
            {loading ? <Skeleton width={300} height={40} /> : 'Inventory Dashboard'}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            {loading ? (
              <Skeleton variant="rectangular" width={200} height={48} />
            ) : (
              <>
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
                  disabled={!lowStockItems.length}
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
              </>
            )}
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        ) : (
          <Suspense fallback={<CircularProgress />}>
            <DashboardStatsCards 
              inventory={inventory}
              lowStockItems={lowStockItems}
              totalValue={totalValue}
              stockTrend={5.2}
            />

            <InventorySearchFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              category={category}
              setCategory={setCategory}
              setMultipleBillDialog={setMultipleBillDialog}
            />

            <InventoryTable 
              paginatedInventory={paginatedInventory}
              tablePage={tablePage}
              totalTablePages={Math.ceil(filteredInventory.length / itemsPerPage)}
              handleTablePrevPage={handleTablePrevPage}
              handleTableNextPage={handleTableNextPage}
              setSelectedProduct={setSelectedProduct}
              setStockUpdateDialog={setStockUpdateDialog}
              setBillDialog={setBillDialog}
              getStockPercentage={(stock, threshold) => (stock / threshold) * 100}
            />
          </Suspense>
        )}

        <Suspense fallback={null}>
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
        </Suspense>

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