
import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { playClickSound } from "../utils/soundEffects";
import "./cart.css";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleButtonClick = (action) => {
    playClickSound();
    action();
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before proceeding to checkout.");
      return;
    }
    navigate("/checkout");
  };

  const handleResetCart = () => {
    clearCart();
  };

  return (
    <div className="cart-kiosk">
      <div className="cart-screen">
        <h1>Cart</h1>
        <div className="cart-container">
          <h2>
            <span className="icon">🛒</span> Your Cart
          </h2>
          {cart.length === 0 ? (
            <div className="empty-cart-container">
              <p className="empty-cart-message">Your cart is empty.</p>
              <div className="cart-buttons">
                <button
                  className="back-to-menu-button"
                  onClick={() => handleButtonClick(() => navigate("/menu"))}
                >
                  ← Back to Menu
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={`/images/${item.image}`} alt={item.name} />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            handleButtonClick(() =>
                              updateQuantity(item.id, item.quantity - 1)
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleButtonClick(() =>
                              updateQuantity(item.id, item.quantity + 1)
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          handleButtonClick(() => removeFromCart(item.id))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="total">Total: ${total.toFixed(2)}</h3>
              <div className="cart-buttons">
                <button
                  className="proceed-to-checkout-button"
                  onClick={() => handleButtonClick(handleCheckout)}
                >
                  Proceed to Checkout
                </button>
                <button
                  className="reset-cart-button"
                  onClick={() => handleButtonClick(handleResetCart)}
                >
                  Reset Cart
                </button>
                <button
                  className="back-to-menu-button"
                  onClick={() => handleButtonClick(() => navigate("/menu"))}
                >
                  ← Back to Menu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;