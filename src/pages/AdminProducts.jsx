import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Edit3,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";

import { supabase } from "../lib/supabase";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    slug: "",
    description: "",
    price: "",
    category_id: "",
    collection_ids: [],
    stock_quantity: "0",
    is_new: false,
    is_available: true,
    image_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  const isEditing = Boolean(editingProduct);

  const availableCategories = useMemo(
    () => categories.filter((category) => category?.id),
    [categories]
  );

  const availableCollections = useMemo(
    () => collections.filter((collection) => collection?.id),
    [collections]
  );

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const {
      data: adminUser,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();

      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    await loadData();
  }

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      productsResult,
      categoriesResult,
      collectionsResult,
    ] = await Promise.all([
      supabase
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
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("collections")
        .select("id, name, slug")
        .order("name", {
          ascending: true,
        }),
    ]);

    if (productsResult.error) {
      console.error(productsResult.error);

      setError("Unable to load products.");
    } else {
      setProducts(productsResult.data || []);
    }

    if (categoriesResult.error) {
      console.error(categoriesResult.error);

      setError((current) =>
        current
          ? `${current} Unable to load categories.`
          : "Unable to load categories."
      );
    } else {
      setCategories(categoriesResult.data || []);
    }

    if (collectionsResult.error) {
      console.error(collectionsResult.error);

      setError((current) =>
        current
          ? `${current} Unable to load collections.`
          : "Unable to load collections."
      );
    } else {
      setCollections(collectionsResult.data || []);
    }

    setLoading(false);
  }

  function slugify(value) {
    return value
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(event) {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      name: value,

      ...(isEditing
        ? {}
        : {
            slug: slugify(value),
          }),
    }));
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleCollectionChange(collectionId) {
    const id = String(collectionId);

    setForm((current) => {
      const alreadySelected =
        current.collection_ids.includes(id);

      return {
        ...current,
        collection_ids: alreadySelected
          ? current.collection_ids.filter(
              (item) => item !== id
            )
          : [
              ...current.collection_ids,
              id,
            ],
      };
    });
  }

  async function loadProductCollections(productId) {
    const {
      data,
      error: collectionError,
    } = await supabase
      .from("product_collections")
      .select("collection_id")
      .eq("product_id", productId);

    if (collectionError) {
      console.error(collectionError);

      throw new Error(
        "Unable to load product collections."
      );
    }

    return (data || []).map((item) =>
      String(item.collection_id)
    );
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";

      return;
    }

    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function resetForm() {
    setForm(emptyForm);

    setEditingProduct(null);

    setSelectedImage(null);
    setImagePreview("");

    setError("");
    setMessage("");
  }

  function startAddProduct() {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function startEditProduct(product) {
    setEditingProduct(product);

    setError("");
    setMessage("");

    let collectionIds = [];

    try {
      collectionIds =
        await loadProductCollections(
          product.id
        );
    } catch (collectionError) {
      setError(
        collectionError.message ||
          "Unable to load product collections."
      );
    }

    setForm({
      name: product.name || "",

      slug: product.slug || "",

      description:
        product.description || "",

      price:
        product.price !== null &&
        product.price !== undefined
          ? String(product.price)
          : "",

      category_id: product.category_id
        ? String(product.category_id)
        : "",

      collection_ids: collectionIds,

      stock_quantity:
        product.stock_quantity !== null &&
        product.stock_quantity !== undefined
          ? String(product.stock_quantity)
          : "0",

      is_new: Boolean(product.is_new),

      is_available: Boolean(
        product.is_available
      ),

      image_url:
        product.image_url || "",
    });

    setSelectedImage(null);

    setImagePreview(
      product.image_url || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadImage(file, slug) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safeSlug =
      slugify(slug) || "product";

    const filePath = `${Date.now()}-${safeSlug}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);

      throw new Error(
        "Unable to upload the product image."
      );
    }

    const { data } =
      supabase.storage
        .from("products")
        .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "Unable to create the image URL."
      );
    }

    return data.publicUrl;
  }

  async function saveProductCollections(
    productId,
    collectionIds
  ) {
    const {
      error: deleteError,
    } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error(deleteError);

      throw new Error(
        "Unable to update product collections."
      );
    }

    if (!collectionIds.length) {
      return;
    }

    const rows = collectionIds.map(
      (collectionId) => ({
        product_id: productId,
        collection_id:
          Number(collectionId),
      })
    );

    const {
      error: insertError,
    } = await supabase
      .from("product_collections")
      .insert(rows);

    if (insertError) {
      console.error(insertError);

      throw new Error(
        "Unable to save product collections."
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const name = form.name.trim();

    const slug = slugify(
      form.slug || form.name
    );

    const description =
      form.description.trim();

    const price = Number(form.price);

    const stockQuantity = Number(
      form.stock_quantity
    );

    if (!name) {
      setError(
        "Product name is required."
      );

      return;
    }

    if (!slug) {
      setError(
        "Product slug is required."
      );

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        "Please enter a valid price."
      );

      return;
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError(
        "Stock quantity must be a whole number greater than or equal to 0."
      );

      return;
    }

    if (!form.category_id) {
      setError(
        "Please select a category."
      );

      return;
    }

    setSaving(true);

    try {
      let imageUrl =
        form.image_url || null;

      if (selectedImage) {
        imageUrl =
          await uploadImage(
            selectedImage,
            slug
          );
      }

      const productData = {
        name,

        slug,

        description:
          description || null,

        price,

        category_id:
          Number(form.category_id),

        image_url: imageUrl,

        is_new: Boolean(form.is_new),

        is_available:
          Boolean(form.is_available),

        stock_quantity:
          stockQuantity,
      };

      let productId;

      if (isEditing) {
        const {
          error: updateError,
        } = await supabase
          .from("products")
          .update(productData)
          .eq(
            "id",
            editingProduct.id
          );

        if (updateError) {
          console.error(updateError);

          if (
            updateError.code ===
            "23505"
          ) {
            throw new Error(
              "This slug is already used by another product."
            );
          }

          throw new Error(
            updateError.message ||
              "Unable to update the product."
          );
        }

        productId =
          editingProduct.id;
      } else {
        const {
          data: insertedProduct,
          error: insertError,
        } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single();

        if (insertError) {
          console.error(insertError);

          if (
            insertError.code ===
            "23505"
          ) {
            throw new Error(
              "A product with this slug already exists."
            );
          }

          throw new Error(
            insertError.message ||
              "Unable to create the product."
          );
        }

        productId =
          insertedProduct.id;
      }

      await saveProductCollections(
        productId,
        form.collection_ids
      );

      const successMessage = isEditing
        ? "Product updated successfully."
        : "Product added successfully.";

      resetForm();

      setMessage(successMessage);

      await loadData();
    } catch (submitError) {
      console.error(submitError);

      setError(
        submitError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      console.error(deleteError);

      setError(
        deleteError.message ||
          "Unable to delete the product."
      );

      setDeletingId(null);

      return;
    }

    if (
      editingProduct?.id === product.id
    ) {
      resetForm();
    }

    setProducts(
      (currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct.id !==
            product.id
        )
    );

    setMessage(
      "Product deleted successfully."
    );

    setDeletingId(null);
  }

  function getStockLabel(product) {
    const stock = Number(
      product.stock_quantity || 0
    );

    if (stock <= 0) {
      return {
        label: "Out of stock",
        className: "out",
      };
    }

    if (stock <= 3) {
      return {
        label: `${stock} left`,
        className: "low",
      };
    }

    return {
      label: `${stock} in stock`,
      className: "in",
    };
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-products-page">
        <div className="admin-products-container">

          <div className="admin-products-header">

            <div>
              <Link
                to="/admin"
                className="admin-back-link"
              >
                <ArrowLeft
                  size={16}
                  strokeWidth={1.5}
                />
                Back to dashboard
              </Link>

              <p className="section-eyebrow">
                CATALOG MANAGEMENT
              </p>

              <h1>
                Products
              </h1>

              <p>
                Add, edit and manage the
                products available in your
                store.
              </p>
            </div>

            <div className="admin-products-header-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  strokeWidth={1.5}
                  className={
                    loading
                      ? "spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                className="admin-primary-button"
                onClick={
                  startAddProduct
                }
              >
                <Plus
                  size={17}
                  strokeWidth={1.5}
                />
                Add product
              </button>

            </div>

          </div>

          {(error || message) && (
            <div
              className={`admin-feedback ${
                error
                  ? "error"
                  : "success"
              }`}
            >
              <span>
                {error || message}
              </span>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                }}
                aria-label="Close message"
              >
                <X
                  size={16}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          )}

          <section className="admin-product-editor">

            <div className="admin-product-editor-header">

              <div>
                <p className="section-eyebrow">
                  {isEditing
                    ? "EDIT PRODUCT"
                    : "NEW PRODUCT"}
                </p>

                <h2>
                  {isEditing
                    ? `Edit ${editingProduct.name}`
                    : "Add a product"}
                </h2>
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="admin-close-editor"
                  onClick={resetForm}
                >
                  <X
                    size={17}
                    strokeWidth={1.5}
                  />
                  Cancel
                </button>
              )}

            </div>

            <form
              className="admin-product-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-product-form-grid">

                <div className="admin-product-form-main">

                  <div className="admin-form-field">

                    <label htmlFor="product-name">
                      Product name
                    </label>

                    <input
                      id="product-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={
                        handleNameChange
                      }
                      placeholder="e.g. Kiko Lipstick Reference 19"
                      disabled={saving}
                    />

                  </div>

                  <div className="admin-form-field">

                    <label htmlFor="product-slug">
                      Slug
                    </label>

                    <input
                      id="product-slug"
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={
                        handleChange
                      }
                      placeholder="kiko-lipstick-reference-19"
                      disabled={saving}
                    />

                    <small>
                      Used in the product URL
                      and must be unique.
                    </small>

                  </div>

                  <div className="admin-form-field">

                    <label htmlFor="product-description">
                      Description
                    </label>

                    <textarea
                      id="product-description"
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe the product..."
                      rows={5}
                      disabled={saving}
                    />

                  </div>

                  <div className="admin-form-row">

                    <div className="admin-form-field">

                      <label htmlFor="product-price">
                        Price
                      </label>

                      <div className="admin-input-with-suffix">

                        <input
                          id="product-price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.price
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="15.00"
                          disabled={saving}
                        />

                        <span>
                          DT
                        </span>

                      </div>

                    </div>

                    <div className="admin-form-field">

                      <label htmlFor="product-stock">
                        Stock quantity
                      </label>

                      <input
                        id="product-stock"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.stock_quantity
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="10"
                        disabled={saving}
                      />

                    </div>

                  </div>

                  <div className="admin-form-field">

                    <label htmlFor="product-category">
                      Category
                    </label>

                    <select
                      id="product-category"
                      name="category_id"
                      value={
                        form.category_id
                      }
                      onChange={
                        handleChange
                      }
                      disabled={saving}
                    >
                      <option value="">
                        Select a category
                      </option>

                      {availableCategories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* COLLECTIONS */}

                  <div className="admin-form-field">

                    <label>
                      Collections
                    </label>

                    <small>
                      Add this product to one
                      or more collections.
                    </small>

                    {availableCollections.length ===
                    0 ? (
                      <div className="admin-collections-empty">
                        No collections available yet.
                      </div>
                    ) : (
                      <div className="admin-collections-list">

                        {availableCollections.map(
                          (collection) => {
                            const selected =
                              form.collection_ids.includes(
                                String(
                                  collection.id
                                )
                              );

                            return (
                              <label
                                key={
                                  collection.id
                                }
                                className={`admin-collection-option ${
                                  selected
                                    ? "selected"
                                    : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  onChange={() =>
                                    handleCollectionChange(
                                      collection.id
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                />

                                <span className="admin-collection-checkbox" />

                                <span>
                                  {collection.name}
                                </span>
                              </label>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                  <div className="admin-product-toggles">

                    <label className="admin-toggle">

                      <input
                        type="checkbox"
                        name="is_new"
                        checked={
                          form.is_new
                        }
                        onChange={
                          handleChange
                        }
                        disabled={saving}
                      />

                      <span className="admin-toggle-box" />

                      <span>
                        <strong>
                          New arrival
                        </strong>

                        <small>
                          Show the NEW badge
                          on the product.
                        </small>
                      </span>

                    </label>

                    <label className="admin-toggle">

                      <input
                        type="checkbox"
                        name="is_available"
                        checked={
                          form.is_available
                        }
                        onChange={
                          handleChange
                        }
                        disabled={saving}
                      />

                      <span className="admin-toggle-box" />

                      <span>
                        <strong>
                          Available in store
                        </strong>

                        <small>
                          Customers can see
                          this product when
                          enabled.
                        </small>
                      </span>

                    </label>

                  </div>

                </div>

                <div className="admin-product-form-side">

                  <div className="admin-image-upload">

                    <div className="admin-image-upload-header">

                      <div>
                        <label>
                          Product image
                        </label>

                        <small>
                          JPG, PNG or WebP ·
                          Max 5 MB
                        </small>
                      </div>

                    </div>

                    <div className="admin-image-preview">

                      {imagePreview ? (
                        <img
                          src={
                            imagePreview
                          }
                          alt="Product preview"
                        />
                      ) : (
                        <div className="admin-image-placeholder">

                          <ImagePlus
                            size={30}
                            strokeWidth={1.2}
                          />

                          <span>
                            Upload product image
                          </span>

                        </div>
                      )}

                    </div>

                    <label className="admin-upload-button">

                      <ImagePlus
                        size={17}
                        strokeWidth={1.5}
                      />

                      {selectedImage
                        ? "Change image"
                        : "Choose image"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                        disabled={saving}
                      />

                    </label>

                    {selectedImage && (
                      <p className="admin-selected-file">
                        {selectedImage.name}
                      </p>
                    )}

                  </div>

                  <div className="admin-product-save-card">

                    <div className="admin-save-icon">

                      <Package
                        size={19}
                        strokeWidth={1.4}
                      />

                    </div>

                    <div>

                      <strong>
                        {isEditing
                          ? "Update product"
                          : "Save product"}
                      </strong>

                      <p>
                        {isEditing
                          ? "Your changes will be saved to the catalog."
                          : "The product will be added to your catalog."}
                      </p>

                    </div>

                    <button
                      type="submit"
                      className="admin-primary-button admin-save-button"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <RefreshCw
                            size={17}
                            strokeWidth={1.5}
                            className="spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save
                            size={17}
                            strokeWidth={1.5}
                          />
                          {isEditing
                            ? "Update product"
                            : "Save product"}
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </form>

          </section>

          <section className="admin-products-list-section">

            <div className="admin-products-list-header">

              <div>

                <p className="section-eyebrow">
                  YOUR CATALOG
                </p>

                <h2>
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}
                </h2>

              </div>

            </div>

            {loading ? (

              <div className="admin-products-loading">

                <RefreshCw
                  size={22}
                  strokeWidth={1.4}
                  className="spin"
                />

                <span>
                  Loading products...
                </span>

              </div>

            ) : products.length === 0 ? (

              <div className="admin-products-empty">

                <Package
                  size={32}
                  strokeWidth={1.2}
                />

                <h3>
                  No products yet
                </h3>

                <p>
                  Add your first product to
                  start building your catalog.
                </p>

                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={
                    startAddProduct
                  }
                >
                  <Plus
                    size={17}
                    strokeWidth={1.5}
                  />
                  Add product
                </button>

              </div>

            ) : (

              <div className="admin-products-table-wrapper">

                <table className="admin-products-table">

                  <thead>

                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Stock
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {products.map(
                      (product) => {
                        const stock =
                          getStockLabel(
                            product
                          );

                        return (
                          <tr
                            key={
                              product.id
                            }
                          >

                            <td>

                              <div className="admin-product-table-product">

                                <div className="admin-product-table-image">

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
                                    <Package
                                      size={22}
                                      strokeWidth={
                                        1.2
                                      }
                                    />
                                  )}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      product.name
                                    }
                                  </strong>

                                  <span>

                                    {product.is_new && (
                                      <em>
                                        NEW
                                      </em>
                                    )}

                                    #
                                    {
                                      product.id
                                    }

                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="admin-category-name">

                                {product
                                  .categories
                                  ?.name ||
                                  "Uncategorized"}

                              </span>

                            </td>

                            <td>

                              <strong className="admin-product-price">

                                {Number(
                                  product.price
                                ).toFixed(
                                  2
                                )}

                                <small>
                                  DT
                                </small>

                              </strong>

                            </td>

                            <td>

                              <span
                                className={`admin-stock-status ${stock.className}`}
                              >
                                {
                                  stock.label
                                }
                              </span>

                            </td>

                            <td>

                              <span
                                className={`admin-availability-status ${
                                  product.is_available
                                    ? "available"
                                    : "unavailable"
                                }`}
                              >
                                {product.is_available
                                  ? "Available"
                                  : "Hidden"}
                              </span>

                            </td>

                            <td>

                              <div className="admin-product-actions">

                                <button
                                  type="button"
                                  className="admin-table-action edit"
                                  onClick={() =>
                                    startEditProduct(
                                      product
                                    )
                                  }
                                  title="Edit product"
                                >
                                  <Edit3
                                    size={
                                      16
                                    }
                                    strokeWidth={
                                      1.5
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="admin-table-action delete"
                                  onClick={() =>
                                    handleDelete(
                                      product
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    product.id
                                  }
                                  title="Delete product"
                                >
                                  {deletingId ===
                                  product.id ? (
                                    <RefreshCw
                                      size={
                                        16
                                      }
                                      strokeWidth={
                                        1.5
                                      }
                                      className="spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={
                                        16
                                      }
                                      strokeWidth={
                                        1.5
                                      }
                                    />
                                  )}
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>
      </main>
    </>
  );
}

export default AdminProducts;