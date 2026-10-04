
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

function Shop() {
  const [searchParams] = useSearchParams();

  const collectionSlug = searchParams.get("collection");

  const [products, setProducts] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedProductId, setAddedProductId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      setCollectionName("");

      try {
        let productIds = null;

        /*
         * If a collection is selected:
         * 1. Find the collection by slug
         * 2. Find all product IDs linked to that collection
         * 3. Load only those products
         */
        if (collectionSlug) {
          const {
            data: collection,
            error: collectionError,
          } = await supabase
            .from("collections")
            .select("id, name")
            .eq("slug", collectionSlug)
            .single();

          if (collectionError) {
            console.error(
              "Error loading collection:",
              collectionError
            );

            setError("Unable to load this collection.");
            setProducts([]);
            setLoading(false);
            return;
          }

          setCollectionName(collection.name);

          const {
            data: productCollections,
            error: productCollectionsError,
          } = await supabase
            .from("product_collections")
            .select("product_id")
            .eq("collection_id", collection.id);

          if (productCollectionsError) {
            console.error(
              "Error loading collection products:",
              productCollectionsError
            );

            setError(
              "Unable to load products from this collection."
            );
            setProducts([]);
            setLoading(false);
            return;
          }

          productIds = (
            productCollections || []
          ).map((item) => item.product_id);

          /*
           * Collection exists but has no products.
           */
          if (productIds.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }
        }

        let productsQuery = supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            description,
            price,
            image_url,
            is_new,
            is_available,
            stock_quantity,
            created_at,
            categories (
              name,
              slug
            )
          `)
          .eq("is_available", true)
          .order("created_at", {
            ascending: false,
          });

        /*
         * Apply collection filter only when
         * a collection was selected.
         */
        if (collectionSlug && productIds) {
          productsQuery = productsQuery.in(
            "id",
            productIds
          );
        }

        const {
          data,
          error: productsError,
        } = await productsQuery;

        if (productsError) {
          console.error(
            "Error loading products:",
            productsError
          );
          setError("Unable to load products.");
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unable to load products.");
        setProducts([]);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [collectionSlug]);

  function handleAddToCart(product) {
    if (product.stock_quantity <= 0) {
      return;
    }

    const success = addToCart(product);

    if (!success) {
      return;
    }

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  }

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.categories;

      if (
        category &&
        category.slug &&
        !categoryMap.has(category.slug)
      ) {
        categoryMap.set(category.slug, {
          name: category.name,
          slug: category.slug,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const description =
          product.description?.toLowerCase() || "";

        const category =
          product.categories?.name?.toLowerCase() ||
          "";

        return (
          name.includes(search) ||
          description.includes(search) ||
          category.includes(search)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.categories?.slug ===
          selectedCategory
      );
    }

    if (showNewOnly) {
      result = result.filter(
        (product) => product.is_new
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    showNewOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "all" ||
    showNewOnly ||
    sortBy !== "newest";

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setShowNewOnly(false);
    setSortBy("newest");
  }

  return (
    <>
      <Navbar />

      <main className="shop-page">

        <section className="shop-header">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h1>
            {collectionName || "Shop"}
          </h1>

          <p>
            {collectionName
              ? `Explore the products from our ${collectionName} collection.`
              : "Discover jewelry, accessories, makeup, and more, selected to add something special to your style."}
          </p>

        </section>

        {!loading &&
          !error &&
          products.length > 0 && (
            <section className="shop-filters">

              <div className="shop-search">

                <Search
                  size={18}
                  strokeWidth={1.5}
                />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="shop-search-clear"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    aria-label="Clear search"
                  >
                    <X
                      size={16}
                      strokeWidth={1.5}
                    />
                  </button>
                )}

              </div>

              <div className="shop-filter-group">

                <SlidersHorizontal
                  size={17}
                  strokeWidth={1.5}
                />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  aria-label="Filter by category"
                >
                  <option value="all">
                    All categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

              </div>

              <button
                type="button"
                className={`new-filter ${
                  showNewOnly ? "active" : ""
                }`}
                onClick={() =>
                  setShowNewOnly(!showNewOnly)
                }
              >
                ✦ New arrivals
              </button>

              <div className="shop-sort">

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  aria-label="Sort products"
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to high
                  </option>

                  <option value="price-high">
                    Price: High to low
                  </option>

                  <option value="name">
                    Name: A–Z
                  </option>
                </select>

              </div>

            </section>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="shop-results-bar">

              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="clear-filters"
                >
                  Clear filters

                  <X
                    size={14}
                    strokeWidth={1.5}
                  />
                </button>
              )}

            </div>
          )}

        <section className="shop-products">

          {loading && (
            <div className="shop-status">
              Loading products...
            </div>
          )}

          {error && (
            <div className="shop-status shop-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="shop-status">
                {collectionName
                  ? `No products available in ${collectionName} yet.`
                  : "No products available yet."}
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 0 &&
            filteredProducts.length === 0 && (

              <div className="shop-no-results">

                <Search
                  size={28}
                  strokeWidth={1.2}
                />

                <h2>
                  No products found
                </h2>

                <p>
                  Try another search or change
                  your filters.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={clearFilters}
                >
                  Clear filters
                  <span>→</span>
                </button>

              </div>
            )}

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (

              <div className="products-grid">

                {filteredProducts.map((product) => {

                  const isOutOfStock =
                    product.stock_quantity <= 0;

                  const isLowStock =
                    product.stock_quantity > 0 &&
                    product.stock_quantity <= 3;

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                    >

                      <Link
                        to={`/product/${product.slug}`}
                        className="shop-product-link"
                      >

                        <div className="product-image-wrapper">

                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="product-image"
                            />
                          ) : (
                            <div className="product-image-placeholder">
                              No image
                            </div>
                          )}

                          {product.is_new && (
                            <span className="product-badge">
                              NEW
                            </span>
                          )}

                          {isOutOfStock && (
                            <span className="product-stock-badge">
                              OUT OF STOCK
                            </span>
                          )}

                        </div>

                        <div className="product-info">

                          <div className="product-category">
                            {product.categories?.name ||
                              "THE M TOUCH"}
                          </div>

                          <h2>
                            {product.name}
                          </h2>

                          <p className="product-price">
                            {Number(
                              product.price
                            ).toFixed(2)}{" "}
                            DT
                          </p>

                          {isOutOfStock ? (
                            <p className="stock-status out-of-stock">
                              Out of stock
                            </p>
                          ) : isLowStock ? (
                            <p className="stock-status low-stock">
                              Only{" "}
                              {product.stock_quantity}{" "}
                              left
                            </p>
                          ) : (
                            <p className="stock-status in-stock">
                              In stock
                            </p>
                          )}

                        </div>

                      </Link>

                      <button
                        type="button"
                        className={`add-to-cart-button ${
                          addedProductId === product.id
                            ? "added"
                            : ""
                        } ${
                          isOutOfStock
                            ? "disabled"
                            : ""
                        }`}
                        onClick={() =>
                          handleAddToCart(product)
                        }
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock
                          ? "Out of stock"
                          : addedProductId === product.id
                            ? "Added to cart ✓"
                            : "Add to cart"}
                      </button>

                    </article>
                  );
                })}

              </div>
            )}

        </section>

      </main>
    </>
  );
}

export default Shop;
