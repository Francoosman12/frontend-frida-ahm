// src/pages/MovimientosPage.jsx
import MovimientosInventario from "../components/MovimientosInventario";

const apiUrl = import.meta.env.VITE_API_URL;

const MovimientosPage = () => {
  return (
    <div className="container w-100">
      <h1 className="text-2xl font-bold text-center mb-6">
        Hotel Casa Frida - Gestión de Movimientos de Inventario
      </h1>
      <MovimientosInventario apiUrl={`${apiUrl}/api`} />
    </div>
  );
};

export default MovimientosPage;
