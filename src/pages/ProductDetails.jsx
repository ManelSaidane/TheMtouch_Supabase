import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    const { data, error: productError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        price,
        category_id,
        image_url,
        is_new,
        is_available,
        stock_quantity,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("is_available", true)
      .maybeSingle();

    if (productError) {
      console.error(productError);
      setError("Unable to load this product.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("This product could not be found.");
      setLoading(false);
      return;
    }

    setProduct(data);

    const stock = Number(data.stock_quantity || 0);

    if (stock <= 0) {
      setQuantity(0);
    } else {
      setQuantity(1);
    }

    setLoading(false);
  }

  function increaseQuantity() {
    if (!product) return;

    const stock = Number(product.stock_quantity || 0);

    setQuantity((current) =>
      Math.min(current + 1, stock)
    );
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  }

  function handleAddToCart() {
    if (!product || quantity <= 0) return;

    let addedSuccessfully = false;

    for (let i = 0; i < quantity; i++) {
      const result = addToCart(product);

      if (result) {
        addedSuccessfully = true;
      } else {
        break;
      }
    }

    if (addedSuccessfully) {
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2200);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-loading">
            Loading product...
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-error">
            <p className="section-eyebrow">THE M TOUCH</p>

            <h1>Product unavailable</h1>

            <p>
              {error ||
                "This product is no longer available."}
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Back to shop
              <span>→</span>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const stock = Number(product.stock_quantity || 0);

  const stockStatus =
    stock <= 0
      ? "out"
      : stock <= 3
        ? "low"
        : "in";

  const stockText =
    stock <= 0
      ? "Out of stock"
      : stock <= 3
        ? `Only ${stock} left`
        : "In stock";

  return (
    <>
      <Navbar />

      <main className="product-details-page">

        <div className="product-details-container">

          <Link
            to="/shop"
            className="product-back-link"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
            />
            Back to shop
          </Link>

          <div className="product-details-grid">

            {/* IMAGE */}

            <div className="product-gallery">

              <button
                type="button"
                className="product-main-image"
                onClick={() => {
                  if (product.image_url) {
                    setLightboxOpen(true);
                  }
                }}
                disabled={!product.image_url}
                aria-label="Zoom product image"
              >
                {product.image_url ? (
                  <>
                    <img
                      src={product.image_url}
                      alt={product.name}
                    />

                    <span className="product-zoom-indicator">
                      <Search
                        size={16}
                        strokeWidth={1.5}
                      />
                      Click to zoom
                    </span>
                  </>
                ) : (
                  <div className="product-no-image">
                    No image available
                  </div>
                )}

                {product.is_new && (
                  <span className="product-details-new">
                    NEW
                  </span>
                )}
              </button>

            </div>

            {/* INFORMATION */}

            <div className="product-information">

              <p className="product-category">
                {product.categories?.name ||
                  "Collection"}
              </p>

              <h1>{product.name}</h1>

              <p className="product-detail-price">
                {Number(product.price).toFixed(2)} DT
              </p>

              <div className="product-detail-divider" />

              {product.description && (
                <div className="product-description">
                  <p>
                    {product.description}
                  </p>
                </div>
              )}

              <div className="product-stock-detail">
                <span
                  className={`product-stock-dot ${stockStatus}`}
                />

                <span>{stockText}</span>
              </div>

              {stock > 0 && (
                <div className="product-purchase">

                  <div className="product-quantity-row">

                    <span className="product-quantity-label">
                      Quantity
                    </span>

                    <div className="product-quantity">

                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus
                          size={15}
                          strokeWidth={1.5}
                        />
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= stock}
                        aria-label="Increase quantity"
                      >
                        <Plus
                          size={15}
                          strokeWidth={1.5}
                        />
                      </button>

                    </div>

                  </div>

                  {quantity >= stock && stock > 0 && (
                    <p className="product-max-stock">
                      Maximum available quantity reached.
                    </p>
                  )}

                  <button
                    type="button"
                    className={`product-add-button ${
                      added ? "added" : ""
                    }`}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag
                      size={18}
                      strokeWidth={1.4}
                    />

                    {added
                      ? "Added to cart"
                      : "Add to cart"}
                  </button>

                  {added && (
                    <Link
                      to="/cart"
                      className="product-view-cart"
                    >
                      View cart
                      <span>→</span>
                    </Link>
                  )}

                </div>
              )}

              {stock <= 0 && (
                <button
                  type="button"
                  className="product-add-button disabled"
                  disabled
                >
                  Out of stock
                </button>
              )}

              <div className="product-detail-notice">
                <div>
                  <strong>Delivery</strong>
                  <span>6 DT</span>
                </div>

                <div>
                  <strong>Payment</strong>
                  <span>
                    Confirmed before delivery
                  </span>
                </div>

                <div>
                  <strong>Availability</strong>
                  <span>
                    Limited stock
                  </span>
                </div>
              </div>

            </div>

          </div>

          <div className="product-bottom-navigation">

            <Link to="/shop">
              <ArrowLeft
                size={15}
                strokeWidth={1.5}
              />
              Continue shopping
            </Link>

            {cartCount > 0 && (
              <Link to="/cart">
                <ShoppingBag
                  size={15}
                  strokeWidth={1.5}
                />
                Cart ({cartCount})
              </Link>
            )}

          </div>

        </div>

      </main>

      {/* LIGHTBOX */}

      {lightboxOpen && product.image_url && (
        <div
          className="product-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} enlarged image`}
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setLightboxOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="product-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image"
          >
            <X
              size={24}
              strokeWidth={1.4}
            />
          </button>

          <div className="product-lightbox-content">

            <img
              src={product.image_url}
              alt={product.name}
            />

            <div className="product-lightbox-caption">
              <span>{product.name}</span>
              <small>Click outside or press Esc to close</small>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetails;