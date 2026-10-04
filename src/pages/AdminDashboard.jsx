import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    products: 0,
    outOfStock: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      setUserEmail(user.email || "");

      await loadStats();
    } catch (error) {
      console.error(
        "Admin access error:",
        error
      );

      navigate("/admin/login", {
        replace: true,
      });
    } finally {
      setCheckingAccess(false);
    }
  }

  async function loadStats() {
    setLoadingStats(true);

    try {
      const [
        ordersResult,
        pendingResult,
        productsResult,
        outOfStockResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("orders")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending"),

        supabase
          .from("products")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("products")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("stock_quantity", 0),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (pendingResult.error) {
        throw pendingResult.error;
      }

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (outOfStockResult.error) {
        throw outOfStockResult.error;
      }

      setStats({
        totalOrders: ordersResult.count || 0,
        pendingOrders: pendingResult.count || 0,
        products: productsResult.count || 0,
        outOfStock: outOfStockResult.count || 0,
      });
    } catch (error) {
      console.error(
        "Unable to load dashboard stats:",
        error
      );
    } finally {
      setLoadingStats(false);
    }
  }

  if (checkingAccess) {
    return (
      <>
        <AdminNavbar />

        <main className="admin-page">
          <div className="admin-loading">
            Checking access...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-page">

        <section className="admin-header">

          <div>
            <p className="section-eyebrow">
              THE M TOUCH · ADMIN
            </p>

            <h1>Dashboard</h1>

            <p>
              Welcome back
              {userEmail
                ? `, ${userEmail}`
                : "."}
            </p>
          </div>

          <Link
            to="/"
            className="admin-store-link"
          >
            View store →
          </Link>

        </section>

        <section className="admin-stats">

          <div className="admin-stat-card">
            <span>Total orders</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.totalOrders}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Pending orders</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.pendingOrders}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Products</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.products}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Out of stock</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.outOfStock}
            </strong>
          </div>

        </section>

        <section className="admin-actions">

          <p className="admin-section-label">
            MANAGEMENT
          </p>

          <div className="admin-action-grid">

            <Link
              to="/admin/orders"
              className="admin-action-card"
            >
              <span>ORDERS</span>

              <strong>
                View and manage orders
              </strong>

              <span className="admin-action-arrow">
                →
              </span>
            </Link>

            <Link
              to="/admin/products"
              className="admin-action-card"
            >
              <span>PRODUCTS</span>

              <strong>
                Manage your products
              </strong>

              <span className="admin-action-arrow">
                →
              </span>
            </Link>

          </div>

        </section>

      </main>
    </>
  );
}

export default AdminDashboard;