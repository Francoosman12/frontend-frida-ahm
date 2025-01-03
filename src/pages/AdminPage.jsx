// src/pages/AdminPage.jsx
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

const AdminPage = () => {
  return (
    <div className="container w-100 ">
      <h1 className="text-2xl font-bold text-center mb-6">
        Panel de Administración
      </h1>
      <ProductForm onAddProduct={() => window.location.reload()} />
      <hr className="mt-5 mb-5"/>
      <ProductTable />
    </div>
  );
};

export default AdminPage;
