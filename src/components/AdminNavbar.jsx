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

    navigate("/admin/login", {
      replace: true
    });
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-container">
        <Link to="/admin" className="admin-navbar-logo" onClick={closeMenu}>
          <span>THE M TOUCH</span>
          <small>ADMIN</small>
        </Link>

        <nav className={`admin-nav-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/admin"
            className={isActive("/admin") ? "active" : ""}
            onClick={closeMenu}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/orders"
            className={isActive("/admin/orders") ? "active" : ""}
            onClick={closeMenu}
          >
            Orders
          </Link>

          <Link
            to="/admin/products"
            className={isActive("/admin/products") ? "active" : ""}
            onClick={closeMenu}
          >
            Products
          </Link>
          <Link
            to="/admin/collections"
            className={isActive("/admin/collections") ? "active" : ""}
            onClick={closeMenu}
          >
            Collections
          </Link>
          <Link
            to="/admin/categories"
            className={isActive("/admin/categories") ? "active" : ""}
            onClick={closeMenu}
          >
            Categories
          </Link>
          <button className="admin-mobile-logout" onClick={handleLogout}>
            Log out
          </button>
        </nav>

        <div className="admin-navbar-actions">
          <button className="admin-navbar-logout" onClick={handleLogout}>
            Log out
          </button>

          <button
            className="admin-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
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
