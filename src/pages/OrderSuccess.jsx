
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function OrderSuccess() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order");
  const trackingToken = searchParams.get("token");

  return (
    <>
      <Navbar />

      <main className="order-success-page">
        <section className="order-success-card">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <div className="success-icon">
            ✓
          </div>

          <h1>
            Thank you for your order
          </h1>

          <p className="order-success-message">
            Your order has been received successfully.
            We will contact you to confirm the order
            before delivery.
          </p>

          {orderId && (
            <div className="order-number">
              <span>ORDER NUMBER</span>
              <strong>#{orderId}</strong>
            </div>
          )}

          {trackingToken && (
            <div className="tracking-code-box">
              <span className="tracking-code-label">
                YOUR TRACKING CODE
              </span>

              <strong className="tracking-code">
                {trackingToken}
              </strong>

              <p>
                Save this code. You can use it anytime
                to track your order.
              </p>
            </div>
          )}

          <div className="order-success-actions">

            {trackingToken && (
              <Link
                to={`/order-status?token=${encodeURIComponent(
                  trackingToken
                )}`}
                className="primary-button"
              >
                Track your order
                <span>→</span>
              </Link>
            )}

            <Link
              to="/shop"
              className="secondary-button"
            >
              Continue shopping
            </Link>

          </div>

        </section>
      </main>
    </>
  );
}

export default OrderSuccess;

