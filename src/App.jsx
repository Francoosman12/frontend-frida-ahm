// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import MovimientosPage from "./pages/MovimientosPage";
import BoutiquePage from "./pages/BoutiquePage";

import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Agregar el Navbar */}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<AdminPage />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
          <Route path="/boutique" element={<BoutiquePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
