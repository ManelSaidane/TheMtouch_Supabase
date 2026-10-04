import { BrowserRouter, Routes, Route } from "react-router-dom";
import TrackOrder from "./pages/TrackOrder";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TestSupabase from "./pages/TestSupabase";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import ProductDetails from "./pages/ProductDetails";
import AdminCollections from "./pages/AdminCollections";
import OrderStatus from "./pages/OrderStatus";
import AdminCategories from "./pages/AdminCategories";
import AdminRoute from "./components/AdminRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/test-supabase" element={<TestSupabase />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/track-order" element={<TrackOrder />} />
        {/* ========================= PRIVATE ADMIN AREA ========================== */}{" "}
        {/* Secret login URL */}{" "}
        <Route path="/mt-control-7x9k" element={<AdminLogin />} />{" "}
        {/* Protected admin routes */}{" "}
        <Route element={<AdminRoute />}>
          {" "}
          <Route
            path="/mt-control-7x9k/dashboard"
            element={<AdminDashboard />}
          />{" "}
          <Route path="/mt-control-7x9k/orders" element={<AdminOrders />} />{" "}
          <Route path="/mt-control-7x9k/products" element={<AdminProducts />} />{" "}
          <Route
            path="/mt-control-7x9k/collections"
            element={<AdminCollections />}
          />{" "}
          <Route
            path="/mt-control-7x9k/categories"
            element={<AdminCategories />}
          />{" "}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
