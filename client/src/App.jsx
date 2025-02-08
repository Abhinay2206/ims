import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import Inventory from "./pages/Inventory"
import ChartsPage from "./pages/ChartsPage";
import BillDetails from "./pages/BillDetails"
import LandingPage from "./pages/LandingPage"
import RequestPage from "./pages/RequestPage"
import UserManagement from "./pages/UserManagement"
import AdvancedReports from "./pages/AdvancedReports"
import Recommendation from "./pages/Recommendation"
import CustomerAnalysis from "./pages/CustomerAnalysis"
import SupplierAnalysis from "./pages/SupplierAnalysis"
import ProtectedRoute from './utils/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request" element={<RequestPage />} />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="bill-details" element={<BillDetails />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="advanced-reports" element={<AdvancedReports />} />
          <Route path="recommendation" element={<Recommendation />} />
          <Route path="customer-analysis" element={<CustomerAnalysis />} />
          <Route path="supplier-analysis" element={<SupplierAnalysis />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="bill-details" element={<BillDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;