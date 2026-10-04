
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { cartCount } = useCart();

  const navigate = useNavigate();

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
    setResults([]);
  };

  /* =========================================================
     OPEN SEARCH
     ========================================================= */

  function handleOpenSearch() {
    setSearchOpen(true);
    setMenuOpen(false);
  }

  /* =========================================================
     SEARCH PRODUCTS
     ========================================================= */

  useEffect(() => {
    const searchProducts = async () => {
      const query = searchValue.trim();

      if (!query) {
        setResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      const searchTerm = `%${query}%`;

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, image_url, stock"
        )
        .or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm}`
        )
        .limit(6);

      if (error) {
        console.error("Product search error:", error);
        setResults([]);
      } else {
        setResults(data || []);
      }

      setSearchLoading(false);
    };

    const timeout = setTimeout(() => {
      searchProducts();
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  /* =========================================================
     FOCUS INPUT
     ========================================================= */

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  /* =========================================================
     CLOSE SEARCH WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        closeSearch();
      }
    }

    if (searchOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [searchOpen]);

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================================
     OPEN PRODUCT
     ========================================================= */

  function handleProductClick(slug) {
    closeSearch();
    navigate(`/product/${slug}`);
  }

  /* =========================================================
     FULL SEARCH
     ========================================================= */

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    closeSearch();

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <header className="navbar">

        <div className="navbar-container">

          {/* LOGO */}
          <Link
            to="/"
            className="logo"
            onClick={() => {
              closeMenu();
              closeSearch();
            }}
          >
            THE M TOUCH
          </Link>


          {/* DESKTOP NAVIGATION */}
          <nav
            className={`nav-links ${
              menuOpen ? "open" : ""
            }`}
          >
            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeMenu}
            >
              Shop
            </Link>

            <Link
              to="/collections"
              onClick={closeMenu}
            >
              Collections
            </Link>

            <Link
              to="/Track-order"
              onClick={closeMenu}
            >
              Track Order
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
            >
              Contact
            </Link>

          
          </nav>


          {/* ACTIONS */}
          <div className="nav-actions">
            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/themtouch.tn/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="instagram-link"
            >
              IG
            </a>


            {/* CART */}
            <Link
              to="/cart"
              className="nav-cart"
              aria-label={`Cart (${cartCount})`}
            >
              <ShoppingBag
                size={19}
                strokeWidth={1.5}
              />

              {cartCount > 0 && (
                <span className="nav-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>


            {/* MOBILE MENU */}
            <button
              type="button"
              className="mobile-menu"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
            >
              {menuOpen ? (
                <X
                  size={21}
                  strokeWidth={1.5}
                />
              ) : (
                <Menu
                  size={21}
                  strokeWidth={1.5}
                />
              )}
            </button>

          </div>

        </div>


        {/* =====================================================
            SEARCH PANEL
            ===================================================== */}

        {searchOpen && (
          <div
            className="navbar-search-overlay"
            ref={searchRef}
          >

            <div className="navbar-search-container">

              <form
                className="navbar-search-form"
                onSubmit={handleSearchSubmit}
              >

                <Search
                  size={20}
                  strokeWidth={1.4}
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  autoComplete="off"
                />

                <button
                  type="button"
                  className="navbar-search-close"
                  aria-label="Close search"
                  onClick={closeSearch}
                >
                  <X
                    size={20}
                    strokeWidth={1.4}
                  />
                </button>

              </form>


              {/* SEARCH CONTENT */}
              {searchValue.trim() && (
                <div className="navbar-search-results">

                  {/* LOADING */}
                  {searchLoading && (
                    <div className="search-message">
                      Searching...
                    </div>
                  )}


                  {/* RESULTS */}
                  {!searchLoading &&
                    results.length > 0 && (
                      <>
                        <div className="search-results-heading">
                          <span>
                            PRODUCTS
                          </span>

                          <small>
                            {results.length}
                          </small>
                        </div>

                        <div className="search-results-list">

                          {results.map(
                            (product) => (
                              <button
                                key={product.id}
                                type="button"
                                className="search-result"
                                onClick={() =>
                                  handleProductClick(
                                    product.slug
                                  )
                                }
                              >

                                <div className="search-result-image">

                                  {product.image_url ? (
                                    <img
                                      src={
                                        product.image_url
                                      }
                                      alt={
                                        product.name
                                      }
                                    />
                                  ) : (
                                    <div className="search-result-no-image">
                                      TM
                                    </div>
                                  )}

                                </div>


                                <div className="search-result-info">

                                  <strong>
                                    {product.name}
                                  </strong>

                                  <span>
                                    {Number(
                                      product.price
                                    ).toFixed(2)}{" "}
                                    DT
                                  </span>

                                </div>


                                <ArrowRight
                                  size={17}
                                  strokeWidth={1.4}
                                />

                              </button>
                            )
                          )}

                        </div>


                        {/* VIEW ALL */}
                        <button
                          type="button"
                          className="search-view-all"
                          onClick={
                            handleSearchSubmit
                          }
                        >
                          View all results
                          <ArrowRight
                            size={17}
                            strokeWidth={1.4}
                          />
                        </button>
                      </>
                    )}


                  {/* NO RESULTS */}
                  {!searchLoading &&
                    results.length === 0 && (
                      <div className="search-empty">

                        <strong>
                          No products found
                        </strong>

                        <span>
                          Try searching for another
                          product or category.
                        </span>

                      </div>
                    )}

                </div>
              )}

            </div>

          </div>
        )}

      </header>
    </>
  );
}

export default Navbar;
