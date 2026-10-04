
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    closeMenu();

    navigate("/mt-control-7x9k", {
      replace: true,
    });
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-container">

        <Link
          to="/mt-control-7x9k/dashboard"
          className="admin-navbar-logo"
          onClick={closeMenu}
        >
          <span>THE M TOUCH</span>
          <small>ADMIN</small>
        </Link>

        <nav
          className={`admin-nav-links ${menuOpen ? "open" : ""}`}
        >
          <Link
            to="/mt-control-7x9k/dashboard"
            className={
              isActive("/mt-control-7x9k/dashboard")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Dashboard
          </Link>

          <Link
            to="/mt-control-7x9k/orders"
            className={
              isActive("/mt-control-7x9k/orders")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Orders
          </Link>

          <Link
            to="/mt-control-7x9k/products"
            className={
              isActive("/mt-control-7x9k/products")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Products
          </Link>

          <Link
            to="/mt-control-7x9k/collections"
            className={
              isActive("/mt-control-7x9k/collections")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Collections
          </Link>

          <Link
            to="/mt-control-7x9k/categories"
            className={
              isActive("/mt-control-7x9k/categories")
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Categories
          </Link>

          <button
            className="admin-mobile-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>

        <div className="admin-navbar-actions">

          <button
            className="admin-navbar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>

          <button
            className="admin-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
          >
            {menuOpen ? (
              <X size={21} strokeWidth={1.5} />
            ) : (
              <Menu size={21} strokeWidth={1.5} />
            )}
          </button>

        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
