import { useEffect, useState } from "react";
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
import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { supabase } from "../lib/supabase";

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

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError("");

    const { data, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, created_at")
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Error loading categories:", categoriesError);
      setError(categoriesError.message);
      setCategories([]);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  function handleNameChange(event) {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      name: value,
      ...(editingCategory
        ? {}
        : {
            slug: slugify(value),
          }),
    }));

    setError("");
    setMessage("");
  }

  function startEdit(category) {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const name = form.name.trim();
    const slug = form.slug.trim() || slugify(name);
    const description = form.description.trim();
    const imageUrl = form.image_url.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    if (!slug) {
      setError("Category slug is required.");
      return;
    }

    setSaving(true);

    const categoryData = {
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
    };

    let result;

    if (editingCategory) {
      result = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("categories")
        .insert(categoryData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("Category save error:", result.error);

      if (result.error.code === "23505") {
        setError("A category with this slug already exists.");
      } else {
        setError(result.error.message);
      }

      setSaving(false);
      return;
    }

    setMessage(
      editingCategory
        ? "Category updated successfully."
        : "Category created successfully."
    );

    setEditingCategory(null);
    setForm(emptyForm);

    await loadCategories();

    setSaving(false);
  }

  async function handleDelete(category) {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);

    // Check whether products are using this category
    const { count, error: productsError } = await supabase
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("category_id", category.id);

    if (productsError) {
      console.error("Category product check error:", productsError);
      setError(productsError.message);
      setDeletingId(null);
      return;
    }

    if (count > 0) {
      setError(
        `You cannot delete "${category.name}" because ${count} product${
          count > 1 ? "s are" : " is"
        } using this category. Reassign the product${
          count > 1 ? "s" : ""
        } first.`
      );

      setDeletingId(null);
      return;
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      console.error("Category delete error:", deleteError);
      setError(deleteError.message);
    } else {
      setMessage("Category deleted successfully.");

      if (editingCategory?.id === category.id) {
        cancelEdit();
      }

      await loadCategories();
    }

    setDeletingId(null);
  }

  return (
    <div className="admin-products-page">
      <AdminNavbar />

      <main className="admin-products-content">
        <div className="admin-products-header">
          <div>
            <Link to="/admin/products" className="admin-back-link">
              <ArrowLeft size={18} />
              Back to Products
            </Link>

            <h1>Categories</h1>

            <p>
              Manage the categories available in your store.
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={loadCategories}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {message && (
          <div className="admin-success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <section className="admin-product-form-card">
          <div className="admin-section-header">
            <div>
              <h2>
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <p>
                {editingCategory
                  ? "Update the information of this category."
                  : "Create a new category for your products."}
              </p>
            </div>

            {editingCategory && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={cancelEdit}
              >
                <X size={17} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="category-name">
                  Name
                </label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Jewelry"
                  disabled={saving}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="category-slug">
                  Slug
                </label>

                <input
                  id="category-slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="e.g. jewelry"
                  disabled={saving}
                />

                <small>
                  Used for category URLs and filtering.
                </small>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="category-description">
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this category..."
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="category-image">
                Image URL
              </label>

              <div className="admin-input-with-icon">
                <ImagePlus size={18} />

                <input
                  id="category-image"
                  name="image_url"
                  type="text"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="/images/jewelry/category.jpg"
                  disabled={saving}
                />
              </div>

              <small>
                Use an image from your public folder or a
                Supabase Storage URL.
              </small>
            </div>

            {form.image_url && (
              <div className="admin-category-image-preview">
                <img
                  src={form.image_url}
                  alt={
                    form.name ||
                    "Category preview"
                  }
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="admin-spin"
                    />
                    Saving...
                  </>
                ) : editingCategory ? (
                  <>
                    <Save size={17} />
                    Update Category
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create Category
                  </>
                )}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-products-list-section">
          <div className="admin-section-header">
            <div>
              <h2>All Categories</h2>

              <p>
                {categories.length}{" "}
                {categories.length === 1
                  ? "category"
                  : "categories"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <RefreshCw
                size={24}
                className="admin-spin"
              />
              <p>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="admin-empty-state">
              <Package size={30} />

              <h3>No categories yet</h3>

              <p>
                Create your first category above.
              </p>
            </div>
          ) : (
            <div className="admin-categories-grid">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="admin-category-card"
                >
                  <div className="admin-category-card-image">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          event.currentTarget.parentElement.classList.add(
                            "has-no-image"
                          );
                        }}
                      />
                    ) : (
                      <ImagePlus size={30} />
                    )}
                  </div>

                  <div className="admin-category-card-content">
                    <h3>{category.name}</h3>

                    <span className="admin-category-slug">
                      /{category.slug}
                    </span>

                    {category.description && (
                      <p>
                        {category.description}
                      </p>
                    )}

                    <div className="admin-category-card-actions">
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                          startEdit(category)
                        }
                        disabled={
                          deletingId === category.id
                        }
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-danger-button"
                        onClick={() =>
                          handleDelete(category)
                        }
                        disabled={
                          deletingId === category.id
                        }
                      >
                        {deletingId === category.id ? (
                          <RefreshCw
                            size={16}
                            className="admin-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}