import { useState, useEffect } from "react";
import "../styles/ProductTable.css";
import "bootstrap/dist/css/bootstrap.min.css";

const apiUrl = import.meta.env.VITE_API_URL;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal d-block bg-opacity-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Producto</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    categoria: "",
    rubro: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
    searchTerm: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    nombre: "",
    categoria: "",
    stock: 0,
    estado: "activo",
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/productos`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const { categoria, rubro, estado, fechaInicio, fechaFin, searchTerm } = filters;

    const filtered = products.filter((product) => {
      const fechaActualizacion = new Date(product.fecha_ultima_actualizacion);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;
      const searchMatch =
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.rubro.toLowerCase().includes(searchTerm.toLowerCase());

      return (
        (categoria === "" || product.categoria.includes(categoria)) &&
        (rubro === "" || product.rubro.includes(rubro)) &&
        (estado === "" || product.estado === estado) &&
        (!inicio || fechaActualizacion >= inicio) &&
        (!fin || fechaActualizacion <= fin) &&
        searchMatch
      );
    });

    setFilteredProducts(filtered);
  }, [filters, products]);

  const handleDelete = async (codigo_ean) => {
    try {
      const response = await fetch(`${apiUrl}/api/productos/${codigo_ean}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setUpdatedProduct({
      nombre: product.nombre,
      categoria: product.categoria,
      stock: product.stock,
      estado: product.estado,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    // Verificar si el código EAN existe y los datos son válidos
    if (!editingProduct || !editingProduct.codigo_ean) {
      console.error("Falta el código EAN del producto.");
      return;
    }

    console.log("Datos enviados:", updatedProduct);
    console.log("URL:", `${apiUrl}/api/productos/${editingProduct.codigo_ean}`);

    try {
      const response = await fetch(
        `${apiUrl}/api/productos/${editingProduct.codigo_ean}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct),
        }
      );
      if (response.ok) {
        fetchProducts();
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div>
      <h1 className="text-center">Tabla de productos</h1>
      <div className="filters mt-4">
        <label>Buscar:</label>
        <input
          type="text"
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          placeholder="Buscar por nombre, categoría o rubro"
          className="form-control d-inline-block w-auto mx-2"
        />

        <label>Fecha de Inicio:</label>
        <input
          type="date"
          onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
          className="form-control d-inline-block w-auto mx-2"
        />
        <label>Fecha de Fin:</label>
        <input
          type="date"
          onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
          className="form-control d-inline-block w-auto mx-2"
        />
      </div>

      <div className="table-responsive mt-4">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>
                Categoría
                <select
                  className="form-select"
                  onChange={(e) => handleFilterChange("categoria", e.target.value)}
                >
                  <option value="">Categoría</option>
                  {Array.from(new Set(products.map((p) => p.categoria))).map(
                    (categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    )
                  )}
                </select>
              </th>
              <th>Rubro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.codigo_ean}>
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td>{product.rubro}</td>
                  <td>
                    <select
                      value={product.estado}
                      onChange={(e) =>
                        handleEdit({ ...product, estado: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(product.codigo_ean)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No hay productos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)}>
        <form onSubmit={handleUpdateProduct}>
          <div className="mb-3">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              value={updatedProduct.nombre}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, nombre: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="categoria">Categoría</label>
            <input
              type="text"
              id="categoria"
              value={updatedProduct.categoria}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, categoria: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              value={updatedProduct.stock}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, stock: Number(e.target.value) })
              }
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={updatedProduct.estado}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, estado: e.target.value })
              }
              className="form-select"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductTable;
