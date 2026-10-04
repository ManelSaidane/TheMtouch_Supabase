import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase
        .from("collections")
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading collections:", error);
        setError("Unable to load collections.");
      } else {
        setCollections(data || []);
      }

      setLoading(false);
    }

    fetchCollections();
  }, []);

  return (
    <>
      <Navbar />

      <main className="collections-page">

        {/* HEADER */}

        <section className="collections-header">

          <p className="section-eyebrow">
            EXPLORE
          </p>

          <h1>
            Collections
          </h1>

          <p>
            Explore our carefully selected collections
            and discover pieces made to complement
            your style.
          </p>

        </section>

        {/* COLLECTIONS */}

        <section className="collections-content">

          {loading && (
            <div className="collections-status">
              Loading collections...
            </div>
          )}

          {error && (
            <div className="collections-status collections-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            collections.length === 0 && (
              <div className="collections-status">
                No collections available yet.
              </div>
            )}

          {!loading &&
            !error &&
            collections.length > 0 && (

              <div className="collections-grid">

                {collections.map((collection) => (

                  <article
                    className="collection-card"
                    key={collection.id}
                  >

                    <Link
                      to={`/shop?collection=${collection.slug}`}
                      className="collection-link"
                    >

                      <div className="collection-image-wrapper">

                        {collection.image_url ? (
                          <img
                            src={collection.image_url}
                            alt={collection.name}
                            className="collection-image"
                          />
                        ) : (
                          <div className="collection-image-placeholder">
                            THE M TOUCH
                          </div>
                        )}

                        <div className="collection-overlay">
                          <span>
                            Explore collection
                          </span>
                          <span>
                            →
                          </span>
                        </div>

                      </div>

                      <div className="collection-info">

                        <h2>
                          {collection.name}
                        </h2>

                        {collection.description && (
                          <p>
                            {collection.description}
                          </p>
                        )}

                      </div>

                    </Link>

                  </article>

                ))}

              </div>
            )}

        </section>

      </main>
    </>
  );
}

export default Collections;