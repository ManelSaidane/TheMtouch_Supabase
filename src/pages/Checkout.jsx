import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck } from "lucide-react";

import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const deliveryFee = 6;
  const orderTotal = cartTotal + deliveryFee;

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const items = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const {
        data,
        error: orderError,
      } = await supabase.rpc("place_order", {
        p_customer_name: form.customer_name,
        p_phone: form.phone,
        p_city: form.city,
        p_address: form.address,
        p_note: form.note,
        p_items: items,
      });

      if (orderError) {
        console.error("Order error:", orderError);

        if (
          orderError.message
            ?.toLowerCase()
            .includes("not enough stock")
        ) {
          setError(
            "Sorry, one or more products are no longer available in the requested quantity."
          );
        } else {
          setError(
            "We couldn't place your order. Please try again."
          );
        }

        return;
      }

      const orderId = data?.order_id;
      const trackingToken = data?.tracking_token;

      if (!orderId || !trackingToken) {
        console.error("Invalid order response:", data);
        setError(
          "The order was created, but we couldn't generate the tracking link."
        );
        return;
      }

      console.log("Order created:", {
        orderId,
        trackingToken,
      });

      clearCart();

      navigate(
        `/order-success?order=${orderId}&token=${trackingToken}`
      );
    } catch (error) {
      console.error(
        "Unexpected order error:",
        error
      );

      setError(
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <section className="checkout-empty">
            <div className="checkout-empty-icon">
              <Check
                size={24}
                strokeWidth={1.5}
              />
            </div>

            <p className="section-eyebrow">
              THE M TOUCH
            </p>

            <h1>
              Your cart is empty
            </h1>

            <p>
              Add something to your cart before
              placing an order.
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Continue shopping
              <span>→</span>
            </Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        {/* HEADER */}

        <section className="checkout-header">
          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h1>
            Complete your order
          </h1>

          <p>
            Tell us where we should deliver
            your order.
          </p>
        </section>

        {/* CHECKOUT CONTENT */}

        <section className="checkout-content">
          {/* FORM */}

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            {/* CUSTOMER */}

            <div className="checkout-section">
              <p className="checkout-section-label">
                01 · CUSTOMER INFORMATION
              </p>

              <div className="form-group">
                <label htmlFor="customer_name">
                  Full name <span>*</span>
                </label>

                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone number <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* DELIVERY */}

            <div className="checkout-section">
              <p className="checkout-section-label">
                02 · DELIVERY INFORMATION
              </p>

              <div className="form-group">
                <label htmlFor="city">
                  City <span>*</span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Delivery address <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, building, apartment..."
                  rows="4"
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="note">
                  Additional note
                  <span className="optional-label">
                    Optional
                  </span>
                </label>

                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Anything we should know?"
                  rows="3"
                />
              </div>
            </div>

            {/* PAYMENT INFORMATION */}

            <div className="checkout-payment-info">
              <div className="checkout-payment-icon">
                <ShieldCheck
                  size={20}
                  strokeWidth={1.5}
                />
              </div>

              <div>
                <strong>
                  Payment & confirmation
                </strong>

                <p>
                  No online payment is required.
                  We will contact you to confirm
                  your order before delivery.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="checkout-submit"
              disabled={submitting}
            >
              {submitting
                ? "Placing order..."
                : "Place order"}

              <span>→</span>
            </button>

            <p className="checkout-note">
              By placing this order, you confirm
              that the information provided is
              correct.
            </p>
          </form>

          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">
            <p className="cart-summary-label">
              YOUR ORDER
            </p>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div
                  className="checkout-item"
                  key={item.id}
                >
                  <div className="checkout-item-info">
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <span className="checkout-item-price">
                    {(item.price * item.quantity).toFixed(2)} DT
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            <div className="cart-summary-row">
              <span>
                Subtotal
              </span>

              <span>
                {cartTotal.toFixed(2)} DT
              </span>
            </div>

            <div className="cart-summary-row">
              <span>
                Delivery
              </span>

              <span>
                {deliveryFee.toFixed(2)} DT
              </span>
            </div>

            <div className="cart-summary-row cart-total">
              <span>
                Total
              </span>

              <strong>
                {orderTotal.toFixed(2)} DT
              </strong>
            </div>

            <div className="checkout-delivery-note">
              <strong>
                Delivery fee
              </strong>

              <span>
                Fixed at 6 DT
              </span>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

export default Checkout;