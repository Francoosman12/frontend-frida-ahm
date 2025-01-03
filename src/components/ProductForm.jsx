import { useState, useEffect } from "react";
import "../styles/ProductForm.css";
import 'bootstrap/dist/css/bootstrap.min.css'; 
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
    fecha_ingreso: new Date().toISOString().split("T")[0], // Fecha actual
    fecha_ultima_actualizacion: new Date().toISOString().split("T")[0], // Fecha actual
    observaciones: "",
    estado: "activo", // Valor por defecto
    imagen_producto: null, // Almacenar archivo de imagen
    qr_code: "", // Aquí ya está bien inicializado
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL; 
  // Datos de las categorías y subcategorías
  const rubrosData = {
    hotel: {
      categorias: [
        { value: "mantenimiento_reparaciones", label: "Mantenimiento y Reparaciones" },
        { value: "limpieza_higiene", label: "Limpieza e Higiene" },
        { value: "habitaciones", label: "Habitaciones" },
        { value: "cocina_alimentos", label: "Cocina y Alimentos" },
        { value: "areas_comunes", label: "Áreas Comunes" },
        { value: "oficina_administracion", label: "Oficina y Administración" },
        { value: "seguridad_emergencias", label: "Seguridad y Emergencias" },
        { value: "areas_recreacion", label: "Áreas de Recreación" },
        { value: "tecnologia_comunicacion", label: "Tecnología y Comunicación" },
        { value: "otros", label: "Otros" },
      ],
      subcategorias: {
        mantenimiento_reparaciones: [
          { value: "electricidad", label: "Electricidad: Focos, interruptores, cables, enchufes" },
          { value: "plomeria", label: "Plomería: Llaves de agua, mangueras, tubos PVC, silicón" },
          { value: "herramientas", label: "Herramientas: Martillos, destornilladores, taladros, llaves inglesas" },
          { value: "pintura_acabados", label: "Pintura y Acabados: Pinturas, brochas, rodillos, selladores" },
        ],
        limpieza_higiene: [
          { value: "productos_limpieza", label: "Productos de Limpieza: Jabones, desinfectantes, detergentes, cloro" },
          { value: "accesorios_limpieza", label: "Accesorios de Limpieza: Trapeadores, escobas, mopas, cubetas" },
          { value: "suministros_higiene", label: "Suministros de Higiene: Papel higiénico, toallas de mano, dispensadores de jabón" },
          { value: "equipo_limpieza", label: "Equipo de Limpieza: Aspiradoras, máquinas de vapor, hidrolavadoras" },
        ],
        habitaciones: [
          { value: "ropa_cama", label: "Ropa de Cama: Sábanas, fundas, cobertores, almohadas" },
          { value: "decoracion", label: "Decoración: Cortinas, cuadros, alfombras, lámparas" },
          { value: "electrodomesticos", label: "Electrodomésticos: Minibares, secadoras de cabello, planchas" },
          { value: "complementos_hospedaje", label: "Complementos de Hospedaje: Pantuflas, kits de aseo, bolsas de lavandería" },
        ],
        cocina_alimentos: [
          { value: "utensilios_cocina", label: "Utensilios de Cocina: Sartenes, cuchillos, tablas de cortar, cucharones" },
          { value: "electrodomesticos", label: "Electrodomésticos: Refrigeradores, hornos, microondas, licuadoras" },
          { value: "menaje", label: "Menaje: Platos, vasos, cubiertos, tazas" },
          { value: "consumibles", label: "Consumibles: Bolsas de basura, servilletas, papel aluminio, bolsas plásticas" },
        ],
        areas_comunes: [
          { value: "mobiliario", label: "Mobiliario: Sillas, mesas, sillones, sombrillas" },
          { value: "decoracion", label: "Decoración: Plantas, macetas, cuadros, centros de mesa" },
          { value: "equipos_electronicos", label: "Equipos Electrónicos: Televisores, proyectores, equipos de sonido" },
          { value: "seguridad", label: "Seguridad: Cámaras, detectores de humo, extintores, señalética" },
        ],
        oficina_administracion: [
          { value: "papeleria", label: "Papelería: Hojas, bolígrafos, carpetas, libretas" },
          { value: "tecnologia", label: "Tecnología: Computadoras, impresoras, routers" },
          { value: "consumibles_oficina", label: "Consumibles de Oficina: Cartuchos de tinta, sobres, etiquetas" },
          { value: "mobiliario_oficina", label: "Mobiliario de Oficina: Escritorios, sillas, archiveros" },
        ],
        seguridad_emergencias: [
          { value: "equipo_seguridad", label: "Equipo de Seguridad: Botiquines, chalecos reflectantes, linternas" },
          { value: "emergencias", label: "Emergencias: Alarmas, baterías, generadores eléctricos" },
          { value: "senalizacion", label: "Señalización: Letreros de salida, cintas de precaución, conos" },
        ],
        areas_recreacion: [
          { value: "piscinas_jardines", label: "Piscinas y Jardines" },
          { value: "gimnasio", label: "Gimnasio" },
          { value: "zona_infantil", label: "Zona Infantil" },
        ],
        tecnologia_comunicacion: [
          { value: "equipos_red", label: "Equipos de Red: Módems, routers, switches, cables Ethernet" },
          { value: "dispositivos_electronicos", label: "Dispositivos Electrónicos: Tablets, controles remotos, teléfonos" },
          { value: "accesorios", label: "Accesorios: Baterías, cargadores, adaptadores" },
        ],
        otros: [
          { value: "proyectos_especiales", label: "Proyectos Especiales: Material para renovaciones o remodelaciones" },
          { value: "suministros_generales", label: "Suministros Generales: Pilas, etiquetas, empaques" },
          { value: "almacen_temporal", label: "Almacén Temporal: Inventario de temporada, regalos promocionales" },
        ],
      },
    },
    
    boutique: {
      categorias: [
        { value: "ropa", label: "Ropa" },
        { value: "accesorios", label: "Accesorios" },
        { value: "calzado", label: "Calzado" },
        { value: "bolsos", label: "Bolsos" },
        { value: "joyeria", label: "Joyería" },
        { value: "perfumes", label: "Perfumes" },
        { value: "articulos_viaje", label: "Artículos de Viaje" },
        { value: "tecnologia", label: "Tecnología" },
        { value: "productos_exclusivos", label: "Productos Exclusivos" },
      ],
      subcategorias: {
        ropa: [
          { value: "camisetas", label: "Camisetas" },
          { value: "pantalones", label: "Pantalones" },
          { value: "blusas", label: "Blusas" },
          { value: "chaquetas", label: "Chaquetas" },
          { value: "shorts", label: "Shorts" },
        ],
        accesorios: [
          { value: "gafas", label: "Gafas" },
          { value: "relojes", label: "Relojes" },
          { value: "cinturones", label: "Cinturones" },
          { value: "bufandas", label: "Bufandas" },
        ],
        calzado: [
          { value: "zapatos_formales", label: "Zapatos Formales" },
          { value: "zapatos_deportivos", label: "Zapatos Deportivos" },
          { value: "sandalias", label: "Sandalias" },
          { value: "botas", label: "Botas" },
        ],
        bolsos: [
          { value: "bolsos_handbag", label: "Bolsos Handbag" },
          { value: "mochilas", label: "Mochilas" },
          { value: "carteras", label: "Carteras" },
          { value: "billeteras", label: "Billeteras" },
        ],
        joyeria: [
          { value: "collares", label: "Collares" },
          { value: "pulseras", label: "Pulseras" },
          { value: "anillos", label: "Anillos" },
          { value: "aretes", label: "Aretes" },
        ],
        perfumes: [
          { value: "perfumes_mujer", label: "Perfumes para Mujer" },
          { value: "perfumes_hombre", label: "Perfumes para Hombre" },
        ],
        articulos_viaje: [
          { value: "maletas", label: "Maletas" },
          { value: "mochilas_viaje", label: "Mochilas de Viaje" },
          { value: "etiquetas_viaje", label: "Etiquetas de Viaje" },
        ],
        tecnologia: [
          { value: "auriculares", label: "Auriculares" },
          { value: "altavoces_bluetooth", label: "Altavoces Bluetooth" },
          { value: "smartwatches", label: "Smartwatches" },
        ],
        productos_exclusivos: [
          { value: "ediciones_limitadas", label: "Ediciones Limitadas" },
          { value: "colecciones_especiales", label: "Colecciones Especiales" },
        ],
      },
    },
    
    cafeteria: {
      categorias: [
        { value: "bebidas", label: "Bebidas" },
        { value: "alimentos", label: "Alimentos" },
      ],
      subcategorias: {
        bebidas: [
          { value: "cafes", label: "Cafés" },
          { value: "jugos", label: "Jugos" },
        ],
        alimentos: [
          { value: "sandwiches", label: "Sándwiches" },
          { value: "pasteles", label: "Pasteles" },
        ],
      },
    },
    rentas: {
      categorias: [
        { value: "bicicleta", label: "Bicicleta" },
        { value: "moto", label: "Moto" },
        { value: "cuatriciclo", label: "Cuatriciclo" },
      ],
      subcategorias: {
        bicicleta: [
          { value: "urbana", label: "Urbana" },
          { value: "montaña", label: "Montaña" },
        ],
        moto: [
          { value: "deportiva", label: "Deportiva" },
          { value: "chopper", label: "Chopper" },
        ],
        cuatriciclo: [
          { value: "cuatriciclo_rural", label: "Rural" },
          { value: "cuatriciclo_playa", label: "Playa" },
        ],
      },
    },
  };

  // Manejar cambios en los campos de texto/select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
