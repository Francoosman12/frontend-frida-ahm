import { useState, useEffect } from "react";
import "../styles/ProductForm.css";
import "bootstrap/dist/css/bootstrap.min.css";
import QRCode from "qrcode";

const ProductForm = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    subcategoria: "",
    rubro: "hotel",
    sucursal: "",
    stock: 0,
    stock_minimo: 0,
    unidad_medida: "",
    precio_compra: 0,
    precio_venta: 0,
    fecha_ingreso: new Date().toISOString().split("T")[0],
    fecha_ultima_actualizacion: new Date().toISOString().split("T")[0],
    observaciones: "",
    estado: "activo",
    imagen_producto: null,
    qr_code: ""
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [rubrosData, setRubrosData] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  // Cargar datos de rubros desde el JSON
  useEffect(() => {
    fetch("/rubros.json")
      .then((response) => response.json())
      .then((data) => setRubrosData(data))
      .catch((error) => console.error("Error al cargar rubros:", error));
  }, []);

  useEffect(() => {
    const rubro = rubrosData[formData.rubro];
    setCategorias(rubro ? rubro.categorias : []);
    setSubcategorias(rubro && rubro.subcategorias[formData.categoria] ? rubro.subcategorias[formData.categoria] : []);
  }, [formData.rubro, formData.categoria, rubrosData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Manejar cambios en el archivo de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      imagen_producto: file,
    }));
  };

  const generateQRCode = async (nombre) => {
    try {
      return await QRCode.toDataURL(`qr_${nombre}_${Date.now()}`);
    } catch (error) {
      console.error("Error generando QR:", error);
      return "";
    }
  };

  // Cambiar las categorías y subcategorías al seleccionar un rubro
  useEffect(() => {
    const rubro = rubrosData[formData.rubro];
    setCategorias(rubro ? rubro.categorias : []);
    setSubcategorias(rubro && rubro.subcategorias[formData.categoria] ? rubro.subcategorias[formData.categoria] : []);
  }, [formData.rubro, formData.categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imagenBase64 = null;
    if (formData.imagen_producto) {
      imagenBase64 = await toBase64(formData.imagen_producto);
    }
  
    // Generar el QR code antes de enviar el formulario
    const qrCode = await generateQRCode(formData.nombre);
  
    const dataToSend = {
      ...formData,
      qr_code: qrCode,
      imagen_producto: imagenBase64,
    };
  
    try {
      const response = await fetch(`${apiUrl}/api/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (response.ok) {
        onAddProduct();
        setFormData({
          ...formData,
          // Restablece todos los campos
        });
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  // Función para convertir la imagen a base64
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-md mx-100 w-100 mt-6 product-form-container">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Agregar Producto</h2>
        <div className="space-y-3">
          {/* Campo de Rubro */}
          <div>
            <label htmlFor="rubro" className="block font-medium text-gray-700">Rubro</label>
            <select
              id="rubro"
              name="rubro"
              value={formData.rubro}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="hotel">Hotel</option>
              <option value="boutique">Boutique</option>
              <option value="cafeteria">Cafetería</option>
              <option value="rentas">Rentas</option>
            </select>
          </div>

          {/* Campo de Categoría */}
          <div>
            <label htmlFor="categoria" className="block font-medium text-gray-700">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una Categoría</option>
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Campo de Subcategoría */}
          <div>
            <label htmlFor="subcategoria" className="block font-medium text-gray-700">Subcategoría</label>
            <select
              id="subcategoria"
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una Subcategoría</option>
              {subcategorias.map((sub) => (
                <option key={sub.value} value={sub.value}>{sub.label}</option>
              ))}
            </select>
          </div>

          {/* Campo de Sucursal */}
          <div>
            <label htmlFor="sucursal" className="block font-medium text-gray-700">Sucursal</label>
            <select
              id="sucursal"
              name="sucursal"
              value={formData.sucursal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una Sucursal</option>
              <option value="sucursal1">Frida</option>
              <option value="sucursal2">Atenea</option>
              <option value="sucursal2">Distrito</option>
              <option value="sucursal2">Tierra Santa</option>
            </select>
          </div>

          {/* Campo de Nombre del Producto */}
          <div>
            <label htmlFor="nombre" className="block font-medium text-gray-700">Nombre del Producto</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ejemplo: Camiseta Roja"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Stock */}
          <div>
            <label htmlFor="stock" className="block font-medium text-gray-700">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Ejemplo: 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Stock Mínimo */}
          <div>
            <label htmlFor="stock_minimo" className="block font-medium text-gray-700">Stock mínimo</label>
            <input
              type="number"
              id="stock_minimo"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              placeholder="Ejemplo: 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Unidad de Medida */}
          <div>
            <label htmlFor="unidad_medida" className="block font-medium text-gray-700">Unidad de medida</label>
            <input
              type="text"
              id="unidad_medida"
              name="unidad_medida"
              value={formData.unidad_medida}
              onChange={handleChange}
              placeholder="Ejemplo: Unidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Precio de Compra */}
          <div>
            <label htmlFor="precio_compra" className="block font-medium text-gray-700">Precio de compra</label>
            <input
              type="number"
              id="precio_compra"
              name="precio_compra"
              value={formData.precio_compra}
              onChange={handleChange}
              placeholder="Ejemplo: 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Precio de Venta */}
          <div>
            <label htmlFor="precio_venta" className="block font-medium text-gray-700">Precio de venta</label>
            <input
              type="number"
              id="precio_venta"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={handleChange}
              placeholder="Ejemplo: 150"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Estado */}
          <div>
            <label htmlFor="estado" className="block font-medium text-gray-700">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          {/* Campo de Fecha de Ingreso */}
          <div>
            <label htmlFor="fecha_ingreso" className="block font-medium text-gray-700">Fecha de Ingreso</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block font-medium text-gray-700">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones adicionales"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Campo de Imagen del Producto */}
          <div>
            <label htmlFor="imagen_producto" className="block font-medium text-gray-700">Imagen del Producto</label>
            <input
              type="file"
              id="imagen_producto"
              name="imagen_producto"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md"
          >
            Agregar Producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
