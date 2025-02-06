import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Inventory from "./pages/Inventory"
import ChartsPage from "./pages/ChartsPage";
import BillDetails from "./pages/BillDetails"
import LandingPage from "./pages/LandingPage"
import RequestPage from "./pages/RequestPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/request" element={<RequestPage/>}/>
        <Route path="/dashboard" element={<HomePage/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/charts" element={<ChartsPage/>}/>
        <Route path="/bills" element={<BillDetails/>}/>
      </Routes>
    </Router>
  );
}

export default App;
