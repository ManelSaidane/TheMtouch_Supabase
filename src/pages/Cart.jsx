
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const deliveryFee = cartItems.length > 0 ? 6 : 0;
  const finalTotal = cartTotal + deliveryFee;

  return (
    <>
      <Navbar />

      <main className="cart-page">

        <section className="cart-header">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h1>
            Your Cart
          </h1>

        </section>

        {cartItems.length === 0 ? (

          <section className="empty-cart">

            <h2>
              Your cart is empty
            </h2>

            <p>
              Discover something you love and add it to your cart.
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Continue shopping
              <span>→</span>
            </Link>

          </section>

        ) : (

          <section className="cart-content">

            <div className="cart-items">

              {cartItems.map((item) => (

                <article
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-item-image">

                    <img
                      src={item.image_url}
                      alt={item.name}
                    />

                  </div>

                  <div className="cart-item-details">

                    <h2>
                      {item.name}
                    </h2>

                    <p className="cart-item-price">
                      {item.price.toFixed(2)} DT
                    </p>

                    <div className="cart-item-actions">

                      <div className="quantity-control">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          disabled={
                            item.quantity >=
                            item.stock_quantity
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>

                      {item.quantity >=
                        item.stock_quantity && (

                        <span className="cart-stock-warning">
                          Maximum available quantity reached
                        </span>

                      )}

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                  <div className="cart-item-total">

                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}{" "}
                    DT

                  </div>

                </article>

              ))}

            </div>

            <aside className="cart-summary">

              <p className="cart-summary-label">
                ORDER SUMMARY
              </p>

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
                  {finalTotal.toFixed(2)} DT
                </strong>

              </div>

              <Link
                to="/checkout"
                className="checkout-button"
              >
                Proceed to order
                <span>→</span>
              </Link>

              <Link
                to="/shop"
                className="continue-shopping"
              >
                Continue shopping
              </Link>

            </aside>

          </section>

        )}

      </main>
    </>
  );
}

export default Cart;

