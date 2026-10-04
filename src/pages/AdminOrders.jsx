import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { supabase } from "../lib/supabase";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/admin/login";
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        window.location.href =
          "/admin/login";

        return;
      }

      const { data, error: ordersError } =
        await supabase
          .from("orders")
          .select(`
            id,
            customer_name,
            phone,
            city,
            address,
            note,
            total,
            status,
            created_at,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              unit_price
            )
          `)
          .order("created_at", {
            ascending: false,
          });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(data || []);
    } catch (error) {
      console.error(
        "Unable to load orders:",
        error
      );

      setError(
        "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(
    orderId,
    newStatus
  ) {
    setUpdatingOrderId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?.id === orderId
          ? {
              ...currentOrder,
              status: newStatus,
            }
          : currentOrder
      );
    } catch (error) {
      console.error(
        "Unable to update order:",
        error
      );

      setError(
        "Unable to update the order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatStatus(status) {
    return status
      .charAt(0)
      .toUpperCase() + status.slice(1);
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-orders-page">

        <section className="admin-orders-header">

          <div>
            <p className="section-eyebrow">
              THE M TOUCH · ADMIN
            </p>

            <h1>Orders</h1>

            <p>
              Manage customer orders and delivery
              status.
            </p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={loadOrders}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>

        {error && (
          <div className="admin-orders-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-orders-status">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-orders-empty">

            <p className="section-eyebrow">
              NO ORDERS
            </p>

            <h2>
              Your orders will appear here.
            </h2>

            <p>
              When a customer places an order,
              you will be able to manage it from
              this page.
            </p>

          </div>
        ) : (
          <section className="admin-orders-layout">

            <div className="admin-orders-list">

              <div className="admin-orders-list-header">
                <span>
                  {orders.length}{" "}
                  {orders.length === 1
                    ? "order"
                    : "orders"}
                </span>
              </div>

              {orders.map((order) => (
                <button
                  key={order.id}
                  className={`admin-order-row ${
                    selectedOrder?.id === order.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                >
                  <div className="admin-order-main">

                    <strong>
                      #{order.id}
                    </strong>

                    <span>
                      {order.customer_name}
                    </span>

                  </div>

                  <div className="admin-order-meta">

                    <span>
                      {order.city}
                    </span>

                    <span>
                      {Number(
                        order.total
                      ).toFixed(2)}{" "}
                      DT
                    </span>

                    <span
                      className={`order-status status-${order.status}`}
                    >
                      {formatStatus(
                        order.status
                      )}
                    </span>

                  </div>

                </button>
              ))}

            </div>

            <aside className="admin-order-details">

              {!selectedOrder ? (
                <div className="admin-order-details-empty">

                  <span>←</span>

                  <p>
                    Select an order to view
                    its details.
                  </p>

                </div>
              ) : (
                <>
                  <div className="admin-order-details-header">

                    <div>
                      <p className="admin-detail-label">
                        ORDER
                      </p>

                      <h2>
                        #{selectedOrder.id}
                      </h2>
                    </div>

                    <span
                      className={`order-status status-${selectedOrder.status}`}
                    >
                      {formatStatus(
                        selectedOrder.status
                      )}
                    </span>

                  </div>

                  <div className="admin-order-date">
                    {formatDate(
                      selectedOrder.created_at
                    )}
                  </div>

                  <div className="admin-detail-section">

                    <p className="admin-detail-label">
                      CUSTOMER
                    </p>

                    <div className="admin-customer-info">

                      <strong>
                        {selectedOrder.customer_name}
                      </strong>

                      <span>
                        {selectedOrder.phone}
                      </span>

                      <span>
                        {selectedOrder.city}
                      </span>

                      <span>
                        {selectedOrder.address}
                      </span>

                      {selectedOrder.note && (
                        <div className="admin-customer-note">
                          <small>
                            NOTE
                          </small>

                          <span>
                            {selectedOrder.note}
                          </span>
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="admin-detail-section">

                    <p className="admin-detail-label">
                      ITEMS
                    </p>

                    <div className="admin-order-items">

                      {selectedOrder.order_items?.map(
                        (item) => (
                          <div
                            className="admin-order-item"
                            key={item.id}
                          >
                            <div>
                              <strong>
                                {item.product_name}
                              </strong>

                              <span>
                                Qty:{" "}
                                {item.quantity}
                              </span>
                            </div>

                            <span>
                              {(
                                Number(
                                  item.unit_price
                                ) *
                                item.quantity
                              ).toFixed(2)}{" "}
                              DT
                            </span>
                          </div>
                        )
                      )}

                    </div>

                  </div>

                  <div className="admin-order-total">

                    <span>Total</span>

                    <strong>
                      {Number(
                        selectedOrder.total
                      ).toFixed(2)}{" "}
                      DT
                    </strong>

                  </div>

                  <div className="admin-detail-section">

                    <p className="admin-detail-label">
                      ORDER STATUS
                    </p>

                    <div className="admin-status-buttons">

                      {ORDER_STATUSES.map(
                        (status) => (
                          <button
                            key={status}
                            className={
                              selectedOrder.status ===
                              status
                                ? "active"
                                : ""
                            }
                            disabled={
                              updatingOrderId ===
                              selectedOrder.id
                            }
                            onClick={() =>
                              updateOrderStatus(
                                selectedOrder.id,
                                status
                              )
                            }
                          >
                            {formatStatus(
                              status
                            )}
                          </button>
                        )
                      )}

                    </div>

                    {updatingOrderId ===
                      selectedOrder.id && (
                      <p className="admin-status-saving">
                        Saving status...
                      </p>
                    )}

                  </div>
                </>
              )}

            </aside>

          </section>
        )}

      </main>
    </>
  );
}

export default AdminOrders;