const categories = [
  {
    title: "Jewelry",
    description: "Delicate pieces for every occasion.",
    image: "/images/jewelry/category.jpg",
    link: "#jewelry",
  },
  {
    title: "Accessories",
    description: "The details that complete your look.",
    image: "/images/accessories/category.jpg",
    link: "#accessories",
  },
  {
    title: "Makeup",
    description: "Beauty essentials to express your style.",
    image: "/images/makeup/category.jpg",
    link: "#makeup",
  },
  {
    title: "New Arrivals",
    description: "Discover what's new at The M Touch.",
    image: "/images/products/new-arrivals.jpg",
    link: "#new-arrivals",
  },
];

function ShopCategories() {
  return (
    <section className="shop-categories" id="shop">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">EXPLORE</p>

          <h2>
            Find your
            <br />
            signature touch.
          </h2>
        </div>

        <p className="section-description">
          Explore our selection of jewelry, accessories, beauty essentials,
          and more — carefully chosen to complement your everyday style.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <a
            href={category.link}
            className="category-card"
            key={category.title}
          >
            <div className="category-image">
              <img
                src={category.image}
                alt={category.title}
              />

              <span className="category-arrow">↗</span>
            </div>

            <div className="category-info">
              <h3>{category.title}</h3>

              <p>{category.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default ShopCategories;