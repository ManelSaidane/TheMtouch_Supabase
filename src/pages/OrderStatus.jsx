
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Check,
  Clock3,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function OrderStatus() {
  const [searchParams] = useSearchParams();
  const trackingToken = searchParams.get("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      if (!trackingToken) {
        setError("This order tracking link is invalid.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase.rpc(
        "get_order_by_tracking_token",
        {
          p_tracking_token: trackingToken,
        }
      );

      if (fetchError) {
        console.error("Error loading order:", fetchError);
        setError("Unable to load your order.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          "We couldn't find an order associated with this tracking link."
        );
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    }

    fetchOrder();
  }, [trackingToken]);

  const statuses = [
    {
      key: "pending",
      label: "Order received",
      description: "We've received your order.",
      icon: Clock3,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      description: "Your order has been confirmed.",
      icon: Check,
    },
    {
      key: "preparing",
      label: "Preparing",
      description: "Your order is being prepared.",
      icon: Package,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Your order has been delivered.",
      icon: Truck,
    },
  ];

  function getStatusIndex() {
    if (!order) return -1;

    return statuses.findIndex(
      (status) => status.key === order.status
    );
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="order-status-page">
          <div className="order-status-state">
            Loading your order...
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="order-status-page">
          <section className="order-status-error">
            <XCircle
              size={42}
              strokeWidth={1.2}
            />

            <p className="section-eyebrow">
              THE M TOUCH
            </p>

            <h1>Order not found</h1>

            <p>{error}</p>

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

  const currentStatusIndex = getStatusIndex();

  const isCancelled = order.status === "cancelled";

  return (
    <>
      <Navbar />

      <main className="order-status-page">

        <section className="order-status-header">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h1>Track your order</h1>

          <p>
            Follow the progress of your order
            from confirmation to delivery.
          </p>

        </section>

        <section className="order-status-card">

          <div className="order-status-card-header">

            <div>
              <span>ORDER NUMBER</span>
              <h2>#{order.id}</h2>
            </div>

            <div className="order-status-date">
              <span>ORDER DATE</span>
              <strong>
                {formatDate(order.created_at)}
              </strong>
            </div>

          </div>

          {isCancelled ? (
            <div className="order-cancelled">

              <div className="order-status-icon">
                <XCircle
                  size={25}
                  strokeWidth={1.4}
                />
              </div>

              <div>
                <h3>Order cancelled</h3>
                <p>
                  This order has been cancelled.
                  Please contact us if you need
                  more information.
                </p>
              </div>

            </div>
          ) : (
            <div className="order-timeline">

              {statuses.map(
                (status, index) => {
                  const Icon = status.icon;

                  const isCompleted =
                    index <= currentStatusIndex;

                  const isCurrent =
                    index === currentStatusIndex;

                  return (
                    <div
                      className={`order-timeline-item ${
                        isCompleted
                          ? "completed"
                          : ""
                      } ${
                        isCurrent
                          ? "current"
                          : ""
                      }`}
                      key={status.key}
                    >

                      <div className="order-timeline-marker">
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="order-timeline-content">

                        <h3>
                          {status.label}
                        </h3>

                        <p>
                          {isCurrent
                            ? status.description
                            : index <
                                currentStatusIndex
                              ? "Completed."
                              : "Coming next."}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

          <div className="order-customer">

            <div>
              <span>CUSTOMER</span>
              <strong>
                {order.customer_name}
              </strong>
            </div>

            <div>
              <span>TOTAL</span>
              <strong>
                {Number(order.total).toFixed(2)} DT
              </strong>
            </div>

          </div>

        </section>

        {order.items?.length > 0 && (
          <section className="order-status-items">

            <div className="order-status-section-header">
              <p className="section-eyebrow">
                YOUR ORDER
              </p>

              <h2>Order details</h2>
            </div>

            <div className="order-status-items-list">

              {order.items.map(
                (item, index) => (
                  <div
                    className="order-status-item"
                    key={`${item.product_name}-${index}`}
                  >

                    <div>
                      <strong>
                        {item.product_name}
                      </strong>

                      <span>
                        Quantity: {item.quantity}
                      </span>
                    </div>

                    <strong>
                      {(
                        Number(item.unit_price) *
                        item.quantity
                      ).toFixed(2)}{" "}
                      DT
                    </strong>

                  </div>
                )
              )}

            </div>

            <div className="order-status-total">
              <span>Total</span>

              <strong>
                {Number(order.total).toFixed(2)} DT
              </strong>
            </div>

          </section>
        )}

        <div className="order-status-footer">

          <p>
            Need help with your order?
          </p>

          <Link to="/contact">
            Contact us →
          </Link>

        </div>

      </main>
    </>
  );
}

export default OrderStatus;

