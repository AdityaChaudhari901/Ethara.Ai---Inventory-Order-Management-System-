import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import Products from "./pages/Products";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-4xl font-bold text-ink">404</p>
      <p className="mt-2 text-ink-muted">That page doesn't exist.</p>
    </div>
  );
}
