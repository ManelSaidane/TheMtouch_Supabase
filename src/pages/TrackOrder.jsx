
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    const code = trackingCode.trim();

    if (!code) {
      return;
    }

    navigate(`/order-status?token=${encodeURIComponent(code)}`);
  }

  return (
    <>
      <Navbar />

      <main className="track-order-page">
        <section className="track-order-header">
          <p className="section-eyebrow">THE M TOUCH</p>

          <h1>Track your order</h1>

          <p>
            Enter your tracking code below to see the
            latest status of your order.
          </p>
        </section>

        <section className="track-order-card">
          <div className="track-order-icon">
            <Search size={24} strokeWidth={1.4} />
          </div>

          <h2>Where is my order?</h2>

          <p>
            Enter the tracking code you received after
            placing your order.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="tracking-code">
              TRACKING CODE
            </label>

            <div className="track-order-input-wrapper">
              <input
                id="tracking-code"
                type="text"
                placeholder="Enter your tracking code"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                autoComplete="off"
              />

              <button type="submit" disabled={!trackingCode.trim()}>
                Track order
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </form>

          <div className="track-order-help">
            <span>Don't have your tracking code?</span>

            <a href="/contact">
              Contact us →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

export default TrackOrder;

