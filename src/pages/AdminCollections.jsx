import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  ImagePlus,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";
import { supabase } from "../lib/supabase";

function AdminCollections() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingCollection, setEditingCollection] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    slug: "",
    description: "",
    image_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  const isEditing = Boolean(editingCollection);

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
      navigate("/admin/login", {
        replace: true,
      });

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

    await loadCollections();
  }

  async function loadCollections() {
    setLoading(true);
    setError("");

    const {
      data,
      error: collectionsError,
    } = await supabase
      .from("collections")
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (collectionsError) {
      console.error(collectionsError);

      setError(
        "Unable to load collections."
      );
    } else {
      setCollections(data || []);
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
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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

    setEditingCollection(null);

    setSelectedImage(null);
    setImagePreview("");

    setError("");
    setMessage("");
  }

  function startAddCollection() {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditCollection(collection) {
    setEditingCollection(collection);

    setForm({
      name: collection.name || "",

      slug: collection.slug || "",

      description:
        collection.description || "",

      image_url:
        collection.image_url || "",
    });

    setSelectedImage(null);

    setImagePreview(
      collection.image_url || ""
    );

    setError("");
    setMessage("");

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
      slugify(slug) || "collection";

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
        "Unable to upload the collection image."
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

    if (!name) {
      setError(
        "Collection name is required."
      );

      return;
    }

    if (!slug) {
      setError(
        "Collection slug is required."
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

      const collectionData = {
        name,

        slug,

        description:
          description || null,

        image_url: imageUrl,
      };

      if (isEditing) {
        const {
          error: updateError,
        } = await supabase
          .from("collections")
          .update(collectionData)
          .eq(
            "id",
            editingCollection.id
          );

        if (updateError) {
          console.error(updateError);

          if (
            updateError.code ===
            "23505"
          ) {
            throw new Error(
              "This collection slug is already used."
            );
          }

          throw new Error(
            updateError.message ||
              "Unable to update the collection."
          );
        }

        setMessage(
          "Collection updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("collections")
          .insert(collectionData);

        if (insertError) {
          console.error(insertError);

          if (
            insertError.code ===
            "23505"
          ) {
            throw new Error(
              "A collection with this slug already exists."
            );
          }

          throw new Error(
            insertError.message ||
              "Unable to create the collection."
          );
        }

        setMessage(
          "Collection created successfully."
        );
      }

      resetForm();

      await loadCollections();
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

  async function handleDelete(collection) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(collection.id);

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);

    if (deleteError) {
      console.error(deleteError);

      setError(
        deleteError.message ||
          "Unable to delete the collection."
      );

      setDeletingId(null);

      return;
    }

    if (
      editingCollection?.id ===
      collection.id
    ) {
      resetForm();
    }

    setCollections(
      (currentCollections) =>
        currentCollections.filter(
          (currentCollection) =>
            currentCollection.id !==
            collection.id
        )
    );

    setMessage(
      "Collection deleted successfully."
    );

    setDeletingId(null);
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-collections-page">
        <div className="admin-collections-container">

          {/* HEADER */}

          <div className="admin-collections-header">

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
                Collections
              </h1>

              <p>
                Create and manage the collections
                shown in your store.
              </p>

            </div>

            <div className="admin-collections-header-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={loadCollections}
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
                  startAddCollection
                }
              >
                <Plus
                  size={17}
                  strokeWidth={1.5}
                />

                Add collection
              </button>

            </div>

          </div>

          {/* FEEDBACK */}

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

          {/* EDITOR */}

          <section className="admin-collection-editor">

            <div className="admin-collection-editor-header">

              <div>

                <p className="section-eyebrow">
                  {isEditing
                    ? "EDIT COLLECTION"
                    : "NEW COLLECTION"}
                </p>

                <h2>
                  {isEditing
                    ? `Edit ${editingCollection.name}`
                    : "Create a collection"}
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
              className="admin-collection-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-collection-form-grid">

                {/* MAIN */}

                <div className="admin-collection-form-main">

                  <div className="admin-form-field">

                    <label htmlFor="collection-name">
                      Collection name
                    </label>

                    <input
                      id="collection-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={
                        handleNameChange
                      }
                      placeholder="e.g. Summer Edit"
                      disabled={saving}
                    />

                  </div>

                  <div className="admin-form-field">

                    <label htmlFor="collection-slug">
                      Slug
                    </label>

                    <input
                      id="collection-slug"
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={
                        handleChange
                      }
                      placeholder="summer-edit"
                      disabled={saving}
                    />

                    <small>
                      Used in the collection URL
                      and must be unique.
                    </small>

                  </div>

                  <div className="admin-form-field">

                    <label htmlFor="collection-description">
                      Description
                    </label>

                    <textarea
                      id="collection-description"
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe this collection..."
                      rows={6}
                      disabled={saving}
                    />

                  </div>

                </div>

                {/* IMAGE */}

                <div className="admin-collection-form-side">

                  <div className="admin-image-upload">

                    <div className="admin-image-upload-header">

                      <div>

                        <label>
                          Collection image
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
                          alt="Collection preview"
                        />
                      ) : (
                        <div className="admin-image-placeholder">

                          <ImagePlus
                            size={30}
                            strokeWidth={1.2}
                          />

                          <span>
                            Upload collection image
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

                      <Layers
                        size={19}
                        strokeWidth={1.4}
                      />

                    </div>

                    <div>

                      <strong>
                        {isEditing
                          ? "Update collection"
                          : "Save collection"}
                      </strong>

                      <p>
                        {isEditing
                          ? "Your changes will be saved."
                          : "The collection will be added to your store."}
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
                            ? "Update collection"
                            : "Save collection"}
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </form>

          </section>

          {/* COLLECTION LIST */}

          <section className="admin-collections-list-section">

            <div className="admin-collections-list-header">

              <div>

                <p className="section-eyebrow">
                  YOUR COLLECTIONS
                </p>

                <h2>
                  {collections.length}{" "}
                  {collections.length ===
                  1
                    ? "collection"
                    : "collections"}
                </h2>

              </div>

            </div>

            {loading ? (

              <div className="admin-collections-loading">

                <RefreshCw
                  size={22}
                  strokeWidth={1.4}
                  className="spin"
                />

                <span>
                  Loading collections...
                </span>

              </div>

            ) : collections.length ===
              0 ? (

              <div className="admin-collections-empty-state">

                <Layers
                  size={32}
                  strokeWidth={1.2}
                />

                <h3>
                  No collections yet
                </h3>

                <p>
                  Create your first collection
                  to organize your products.
                </p>

                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={
                    startAddCollection
                  }
                >
                  <Plus
                    size={17}
                    strokeWidth={1.5}
                  />

                  Add collection
                </button>

              </div>

            ) : (

              <div className="admin-collections-grid">

                {collections.map(
                  (collection) => (

                    <article
                      className="admin-collection-card"
                      key={collection.id}
                    >

                      <div className="admin-collection-card-image">

                        {collection.image_url ? (
                          <img
                            src={
                              collection.image_url
                            }
                            alt={
                              collection.name
                            }
                          />
                        ) : (
                          <Layers
                            size={30}
                            strokeWidth={1.2}
                          />
                        )}

                      </div>

                      <div className="admin-collection-card-content">

                        <p className="admin-collection-card-slug">
                          {collection.slug}
                        </p>

                        <h3>
                          {collection.name}
                        </h3>

                        <p>
                          {collection.description ||
                            "No description added yet."}
                        </p>

                        <div className="admin-collection-card-actions">

                          <button
                            type="button"
                            className="admin-table-action edit"
                            onClick={() =>
                              startEditCollection(
                                collection
                              )
                            }
                            title="Edit collection"
                          >
                            <Edit3
                              size={16}
                              strokeWidth={1.5}
                            />
                          </button>

                          <button
                            type="button"
                            className="admin-table-action delete"
                            onClick={() =>
                              handleDelete(
                                collection
                              )
                            }
                            disabled={
                              deletingId ===
                              collection.id
                            }
                            title="Delete collection"
                          >
                            {deletingId ===
                            collection.id ? (
                              <RefreshCw
                                size={16}
                                strokeWidth={1.5}
                                className="spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                                strokeWidth={1.5}
                              />
                            )}
                          </button>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </div>
      </main>
    </>
  );
}

export default AdminCollections;