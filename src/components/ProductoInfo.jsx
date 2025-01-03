import React from 'react';
import '../styles/ProductoInfo.css';

const ProductoInfo = ({ producto, agregarAlCarrito }) => {
  const manejarAgregar = () => {
    agregarAlCarrito(producto);
  };

  return (
    <div className="producto-info">
      {producto.imagen_producto && (
        <img src={producto.imagen_producto} alt={producto.nombre} />
      )}
      <h2>{producto.nombre}</h2>
      <p className="precio">Precio de Venta: ${producto.precio_venta}</p>
      <p>Observaciones: {producto.observaciones || 'No hay observaciones.'}</p>
      <button className="boton-carrito" onClick={manejarAgregar}>
        Agregar al Carrito
      </button>
    </div>
  );
};

export default ProductoInfo;
