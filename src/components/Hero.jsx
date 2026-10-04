import { Link } from "react-router-dom";
function Hero() {
  return (
    <section className="hero">
      <div className="hero-image">
        <img src="/images/hero/theMtouch%20PDF.jpeg" alt="The M Touch" />
      </div>

      <div className="hero-content">
        <p className="eyebrow">JEWELRY · ACCESSORIES · BEAUTY</p>

        <h1>
          Your style,
          <br />
          your touch.
        </h1>

        <p className="hero-description">
          Discover pieces selected to add something special to every look.
        </p>

        <Link to="/shop" className="primary-button">
          {" "}
          Discover the collection <span>→</span>{" "}
        </Link>
      </div>
    </section>
  );
}

export default Hero;
