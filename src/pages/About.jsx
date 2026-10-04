import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import Navbar from "../components/Navbar";

function About() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        {/* HERO */}
        <section className="about-hero">
          <div className="about-hero-content">
            <p className="section-eyebrow">OUR STORY</p>

            <h1>
              More than an accessory.
              <br />
              <em>A personal touch.</em>
            </h1>

            <p className="about-hero-text">
              The M Touch brings together jewelry, accessories, beauty, and
              carefully selected pieces designed to add a personal touch to
              every look.
            </p>
          </div>
        </section>

        {/* CONCEPT */}
        <section className="about-concept">
          <div className="about-concept-intro">
            <p className="section-eyebrow">THE M TOUCH</p>

            <h2>
              Your style,
              <br />
              your touch.
            </h2>
          </div>

          <div className="about-concept-text">
            <p>
              The M Touch was created around a simple idea: the little details
              can completely transform the way you feel and express yourself.
            </p>

            <p>
              From jewelry and accessories to beauty essentials, every piece is
              chosen to complement your style, whether you're looking for
              something subtle, elegant, or simply different.
            </p>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="about-categories">
          <div className="about-section-heading">
            <p className="section-eyebrow">WHAT WE LOVE</p>

            <h2>Made for every side of you.</h2>
          </div>

          <div className="about-category-grid">
            <div className="about-category-card">
              <span>01</span>

              <h3>Jewelry</h3>

              <p>
                Delicate pieces and statement details designed to elevate your
                everyday look.
              </p>
            </div>

            <div className="about-category-card">
              <span>02</span>

              <h3>Accessories</h3>

              <p>
                The finishing touches that make an outfit feel completely yours.
              </p>
            </div>

            <div className="about-category-card">
              <span>03</span>

              <h3>Beauty</h3>

              <p>
                Carefully selected beauty pieces to complete your personal
                style.
              </p>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="about-philosophy">
          <div className="about-philosophy-icon">
            <Sparkles size={24} strokeWidth={1.3} />
          </div>

          <p className="section-eyebrow">OUR PHILOSOPHY</p>

          <h2>
            It's not about following
            <br />
            every trend.
            <br />
            <em>It's about making it yours.</em>
          </h2>

          <p>
            We believe style is personal. That's why The M Touch focuses on
            pieces that can be mixed, matched, layered, and made your own.
          </p>
        </section>

        {/* SELECTION */}
        <section className="about-selection">
          <div className="about-selection-image">
            <img src="/images/hero/pic2.jpeg" alt="The M Touch" />
          </div>

          <div className="about-selection-content">
            <p className="section-eyebrow">OUR SELECTION</p>

            <h2>
              Curated with
              <br />
              intention.
            </h2>

            <p>
              We don't want to fill your wardrobe with things you'll forget
              about. Our selection is built around pieces that catch the eye,
              feel right, and bring something special to your everyday style.
            </p>

            <Link to="/shop" className="about-shop-link">
              Explore the collection
              <ArrowRight size={17} strokeWidth={1.4} />
            </Link>
          </div>
        </section>

        {/* FINAL QUOTE */}
        <section className="about-final">
          <p className="section-eyebrow">THE M TOUCH</p>

          <h2>
            Small details.
            <br />
            <em>Big difference.</em>
          </h2>

          <Link to="/shop" className="primary-button">
            Shop the collection
            <ArrowRight size={17} strokeWidth={1.4} />
          </Link>
        </section>
      </main>
    </>
  );
}

export default About;
