import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ProductoFormulario.css';

const ProductoFormulario = ({ setProducto }) => {
  const [codigoEAN, setCodigoEAN] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Buscar producto por Código EAN
  const buscarProducto = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/productos?codigo_ean=${codigoEAN}`);
      console.log(response.data); // Verifica la respuesta de la API
      if (response.data.length > 0) {
        const producto = response.data[0];
        if (!producto.id) {
          setError('Producto encontrado pero sin ID válido.');
        } else {
          setProducto(producto);
          setError('');
        }
      } else {
        setError('Producto no encontrado.');
      }
      setCodigoEAN(''); // Restablecer campo
    } catch (err) {
      setError('Error al buscar el producto.');
    }
  };

  // Buscar producto por nombre
  const handleBusqueda = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${apiUrl}/api/productos?nombre=${search}`);
      console.log(response.data); // Verifica la respuesta de la API
      if (response.data.length > 0) {
        const producto = response.data[0];
        if (!producto.id) {
          setError('Producto encontrado pero sin ID válido.');
        } else {
          setProducto(producto);
          setError('');
        }
      } else {
        setError('Producto no encontrado.');
      }
      setSearch(''); // Restablecer campo
    } catch (err) {
      setError('Error al buscar el producto.');
    }
  };

  return (
    <div className="producto-formulario">
      <h2>Buscar Producto</h2>

      {/* Buscar por Nombre */}
      <div className="form-group">
        <label>Buscar por Nombre:</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ingrese el nombre del producto"
        />
        <button onClick={handleBusqueda}>Buscar</button>
      </div>

      {/* Buscar por Código EAN */}
      <div className="form-group">
        <label>Código EAN:</label>
        <input
          type="text"
          value={codigoEAN}
          onChange={(e) => setCodigoEAN(e.target.value)}
          placeholder="Ingrese el código EAN"
        />
        <button className="boton" onClick={buscarProducto}>
          Buscar por EAN
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ProductoFormulario;
