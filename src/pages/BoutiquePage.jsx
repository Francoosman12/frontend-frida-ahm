import React, { useState, useEffect } from 'react';
import ProductoFormulario from '../components/ProductoFormulario';
import ProductoInfo from '../components/ProductoInfo';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import '../styles/BoutiquePage.css';

const BoutiquePage = () => {
  const [producto, setProducto] = useState(null); // Producto seleccionado
  const [productos, setProductos] = useState([]); // Lista de productos agregados
  const [mostrarPago, setMostrarPago] = useState(false); // Mostrar sección de pago
  const [modalidadPago, setModalidadPago] = useState(''); // Modalidad de pago seleccionada
  const [montoEfectivo, setMontoEfectivo] = useState(0); // Monto pagado en efectivo
  const [montoTarjeta, setMontoTarjeta] = useState(0); // Monto pagado con tarjeta
  const [ventaRegistrada, setVentaRegistrada] = useState(false); // Indica si la venta fue registrada
  const [ventas, setVentas] = useState([]); // Ventas realizadas
  const [view, setView] = useState('venta'); // Control de vista para pestañas

  const apiUrl = import.meta.env.VITE_API_URL;

  // Función para calcular el total de la compra
  const calcularTotal = () => {
    return productos
      .reduce((total, producto) => total + producto.cantidad * (parseFloat(producto.precio_venta) || 0), 0)
      .toFixed(2);
  };

  // Función para cargar las ventas realizadas
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/ventas`);
        setVentas(response.data);
      } catch (error) {
        console.error('Error al obtener las ventas:', error);
      }
    };
    fetchVentas();
  }, [apiUrl]);

  // Generar el ticket en PDF con la fecha en el nombre
  const generarPDF = (productos) => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleString();
    doc.text('Ticket de Compra', 20, 20);
    doc.text(`Fecha: ${fechaActual}`, 20, 30);

    let y = 40;
    productos.forEach((producto, index) => {
      doc.text(
        `${index + 1}. ${producto.nombre} - ${producto.cantidad} x $${producto.precio_venta}`,
        20,
        y
      );
      y += 10;
    });

    doc.text(`Total: $${calcularTotal()}`, 20, y + 10);
    const pdfUrl = `/tickets/ticket_compra_${fechaActual}.pdf`;
    doc.save(pdfUrl);

    return pdfUrl;
  };

  // Función para agregar el producto al carrito
  const agregarProductoAlCarrito = (nuevoProducto) => {
    if (!nuevoProducto.id) {
      alert('Este producto no tiene ID válido.');
      return;
    }

    setProductos((prevCarrito) => {
      const productoExistente = prevCarrito.find((p) => p.id === nuevoProducto.id);
      if (productoExistente) {
        return prevCarrito.map((p) =>
          p.id === nuevoProducto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prevCarrito, { ...nuevoProducto, cantidad: 1 }];
    });
    setProducto(null); // Restablecer producto seleccionado
  };

  // Función para registrar la venta
  const registrarVenta = async () => {
    if (!modalidadPago) {
      alert('Por favor, seleccione una modalidad de pago.');
      return;
    }

    // Validación específica para modalidad "doble" (mixto)
    if (modalidadPago === 'doble') {
      if (isNaN(montoEfectivo) || montoEfectivo <= 0 || isNaN(montoTarjeta) || montoTarjeta <= 0) {
        alert('Por favor, ingrese montos válidos para ambos métodos de pago.');
        return;
      }
    }

    const nuevaVenta = {
      productos: productos.map((producto) => ({
        productoId: producto.id,
        cantidad: producto.cantidad,
        precio: parseFloat(producto.precio_venta) || 0,
        subtotal: parseFloat(producto.precio_venta) * producto.cantidad || 0,
      })),
      modalidad_pago: modalidadPago, // 'efectivo', 'tarjeta' o 'doble'
      monto_efectivo: modalidadPago === 'efectivo' ? parseFloat(calcularTotal()) : montoEfectivo,
      monto_tarjeta: modalidadPago === 'tarjeta' ? parseFloat(calcularTotal()) : montoTarjeta,
      total: parseFloat(calcularTotal()), // Asegurarse de que total sea un número
      sucursal: 'sucursal1',
      ticket_url: generarPDF(productos), // Guardar URL del ticket generado
    };

    try {
      const response = await axios.post(`${apiUrl}/api/ventas`, nuevaVenta);
      setVentaRegistrada(true);
      alert('Venta registrada con éxito.');

      // Restablecer todos los estados a su valor inicial
      setProductos([]);
      setProducto(null);
      setMostrarPago(false);
      setModalidadPago('');
      setMontoEfectivo(0);
      setMontoTarjeta(0);
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Ocurrió un error al registrar la venta.');
    }
  };

// Generar el ticket en PDF con los datos de la venta
const generarPDFDesdeVenta = (venta) => {
  const doc = new jsPDF();
  const fechaActual = new Date().toLocaleString();
  doc.text('Ticket de Compra', 20, 20);
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 20, 30);  // Formatear la fecha correctamente
  doc.text(`Modalidad de Pago: ${venta.modalidad_pago}`, 20, 40);

  let y = 50;
  venta.productos.forEach((producto, index) => {
    // Asegurarse de acceder correctamente a productoId.nombre y productoId.precio_venta
    const nombreProducto = producto.productoId?.nombre || "Producto desconocido";  // Usar nombre de producto
    const precioProducto = producto.precio || producto.productoId?.precio_venta || 0;  // Usar precio de producto si existe, o de productoId

    doc.text(
      `${index + 1}. ${nombreProducto} - ${producto.cantidad} x $${precioProducto}`,
      20,
      y
    );
    y += 10;
  });

  doc.text(`Total: $${venta.total}`, 20, y + 10);
  const pdfUrl = `/tickets/ticket_compra_${fechaActual}.pdf`;
  doc.save(pdfUrl);

  return pdfUrl;
};




  return (
    <div className="boutique-container">
      <div className="tabs">
        <button onClick={() => setView('venta')}>Venta</button>
        <button onClick={() => setView('ventas')}>Ventas Realizadas</button>
      </div>

      {view === 'venta' && (
        <>
          <div className="formulario-container">
            <ProductoFormulario setProducto={setProducto} />
          </div>

          <div className="producto-info-container">
            {producto ? (
              <ProductoInfo producto={producto} agregarAlCarrito={agregarProductoAlCarrito} />
            ) : (
              <p>Seleccione un producto</p>
            )}
          </div>

          {/* Tabla de productos */}
          {productos.length > 0 ? (
            <div className="tabla-productos">
              <h3>Productos Agregados</h3>
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.nombre}</td>
                      <td>${producto.precio_venta || '0.00'}</td>
                      <td>{producto.cantidad}</td>
                      <td>${(producto.cantidad * (parseFloat(producto.precio_venta) || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="total-compra">Total: ${calcularTotal()}</p>
              <button className="continuar-btn" onClick={() => setMostrarPago(true)}>
                Iniciar Pago
              </button>
            </div>
          ) : (
            <p>No hay productos en el carrito.</p>
          )}

          {/* Modal de pago */}
          {mostrarPago && (
            <div className="modal-pago">
              <h3>Registrar Pago</h3>
              <label>Modalidad de Pago:</label>
              <select
                value={modalidadPago}
                onChange={(e) => setModalidadPago(e.target.value)}
              >
                <option value="">Seleccione</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="doble">Mixto</option>
              </select>

              {modalidadPago === 'doble' && (
                <>
                  <div>
                    <label>Monto en Efectivo:</label>
                    <input
                      type="number"
                      value={montoEfectivo}
                      onChange={(e) => setMontoEfectivo(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label>Monto con Tarjeta:</label>
                    <input
                      type="number"
                      value={montoTarjeta}
                      onChange={(e) => setMontoTarjeta(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}

              <button className="registrar-btn" onClick={registrarVenta}>
                Registrar Venta
              </button>

              {ventaRegistrada && (
                <button className="ticket-btn" onClick={generarPDF}>
                  Generar Ticket
                </button>
              )}
            </div>
          )}
        </>
      )}

      {view === 'ventas' && (
        <>
          <h3>Ventas Realizadas</h3>
          <div className="ventas-table">
            <table>
              <thead>
                <tr>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Modalidad de Pago</th>
                  <th>Ticket</th>
                </tr>
              </thead>
              <tbody>
  {ventas.map((venta) => (
    <tr key={venta._id}>
      <td>
        {venta.productos.map((producto) => (
          <span key={producto._id}>{producto.productoId.nombre} ({producto.cantidad})</span>
        ))}
      </td>
      <td>{venta.total}</td>
      <td>{new Date(venta.fecha).toLocaleString()}</td> {/* Convertir la fecha a un formato legible */}
      <td>{venta.modalidad_pago}</td>
      <td>
        <button onClick={() => generarPDF(venta.productos)}>Ver Ticket</button>
      </td>
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

export default BoutiquePage;
