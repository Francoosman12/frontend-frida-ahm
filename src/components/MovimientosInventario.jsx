import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MovimientosInventario.css";

const MovimientosInventario = ({ apiUrl }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [formData, setFormData] = useState({
    categoria: "",
    subcategoria: "",
    producto: "",
    cantidad: 0,
    tipo: "entrada",
    observaciones: "",
  });
  const [error, setError] = useState(null);
  const [view, setView] = useState("movimientos"); // Para controlar la vista entre movimientos y productos

 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosResponse = await axios.get(`${apiUrl}/productos`);
        
        // Filtrar productos del rubro "hotel"
        const productosHotel = productosResponse.data.filter(
          (producto) => producto.rubro === "hotel"
        );
        setProductos(productosHotel); // Usar solo los productos de hotel
  
        const movimientosResponse = await axios.get(`${apiUrl}/movimientos`);
        setMovimientos(movimientosResponse.data);
  
        // Extraer categorías únicas solo de los productos filtrados
        const categoriasUnicas = [
          ...new Set(productosHotel.map((producto) => producto.categoria)),
        ];
        setCategorias(categoriasUnicas);
      } catch (err) {
        setError("Error al cargar los datos.");
        console.error(err);
      }
    };
    fetchData();
  }, [apiUrl]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "categoria") {
      const subcategoriasFiltradas = productos
        .filter((producto) => producto.categoria === value)
        .map((producto) => producto.subcategoria);
      setSubcategorias([...new Set(subcategoriasFiltradas)]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const movementData = {
      productoId: formData.producto,
      tipo: formData.tipo,
      cantidad: formData.cantidad,
      comentario: formData.observaciones,
      usuarioId: "64a45bcbfcd88200123abc45", // Ajusta este valor con el id real del usuario
    };
    try {
      const response = await axios.post(`${apiUrl}/movimientos`, movementData);
      setMovimientos([response.data.movimiento, ...movimientos]);
      setFormData({
        categoria: "",
        subcategoria: "",
        producto: "",
        cantidad: 0,
        tipo: "entrada",
        observaciones: "",
      });
    } catch (err) {
      setError("Error al registrar el movimiento.");
      console.error(err);
    }
  };

  const productosFiltrados = productos.filter(
    (producto) =>
      (formData.categoria ? producto.categoria === formData.categoria : true) &&
      (formData.subcategoria ? producto.subcategoria === formData.subcategoria : true)
  );

  const productosHotel = productos.filter((producto) => producto.rubro === "hotel"); // Filtrar solo productos de "hotel"

  return (
    <div className="container">
      <h2>Gestión de Movimientos</h2>

      {/* Botones de pestaña */}
      <div className="tabs">
        <button onClick={() => setView("movimientos")}>Movimientos</button>
        <button onClick={() => setView("productos")}>Productos</button>
      </div>

      {/* Formulario para registrar movimiento */}
      {view === "movimientos" && (
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Categoría:</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Subcategoría:</label>
            <select
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una subcategoría</option>
              {subcategorias.map((subcategoria, index) => (
                <option key={index} value={subcategoria}>
                  {subcategoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Producto:</label>
            <select
              name="producto"
              value={formData.producto}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un producto</option>
              {productosFiltrados.map((producto) => (
                <option key={producto._id} value={producto._id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Cantidad:</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          <div>
            <label>Tipo de Movimiento:</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
            >
              <option value="entrada">Ingreso</option>
              <option value="salida">Egreso</option>
            </select>
          </div>
          <div>
            <label>Observaciones:</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <button type="submit">Registrar Movimiento</button>
        </form>
      )}

      {/* Mostrar tabla de productos solo si estamos en la vista de productos */}
      {view === "productos" && (
        <div className="table-responsive">
          <h3>Productos del Rubro Hotel</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Subcategoría</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productosHotel.map((producto) => (
                <tr key={producto._id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.subcategoria}</td>
                  <td>{producto.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mostrar los movimientos */}
      {view === "movimientos" && (
        <>
          <h3>Movimientos Recientes</h3>
          {error && <p className="error">{error}</p>}

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Tipo</th>
                  <th>Observaciones</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov._id}>
                    <td>{mov.productoId ? mov.productoId.nombre : "Desconocido"}</td>
                    <td>{mov.cantidad}</td>
                    <td>{mov.tipo === "entrada" ? "Ingreso" : "Egreso"}</td>
                    <td>{mov.comentario}</td>
                    <td>{new Date(mov.fecha).toLocaleString()}</td>
                    <td>{mov.usuario ? mov.usuario.nombre : "Desconocido"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MovimientosInventario;
