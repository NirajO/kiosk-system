
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { playClickSound } from "../utils/soundEffects";
import "./checkout.css";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleButtonClick = (action) => {
    playClickSound();
    action();
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!name || !phone) {
      alert("Please enter your name and phone number.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          cart: cart,
        }),
      });

      const rawResponse = await response.text();
      console.log("Raw response from backend:", rawResponse);

      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (jsonError) {
        throw new Error("Invalid JSON response from server: " + rawResponse);
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to record order");
      }

      if (!result.success) {
        throw new Error(result.message || "Order placement failed");
      }

      console.log("Order recorded in backend:", result);
      localStorage.setItem("lastOrderId", result.orderId);
      clearCart();
      navigate("/payment");
    } catch (error) {
      console.error("Error placing order:", error.message);
      alert("Failed to place order: " + error.message);
    }
  };

  return (
    <div className="checkout-kiosk">
      <div className="checkout-screen">
        <h1>Checkout</h1>
        <div className="checkout-container">
          <div className="order-summary-section">
            <h2>
              <span className="icon">🛒</span> Order Summary
            </h2>
            {cart.length === 0 ? (
              <p className="empty-order-message">Your order is empty.</p>
            ) : (
              <>
                <div className="order-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={`/images/${item.image}`} alt={item.name} />
                      <div className="order-item-details">
                        <h3>{item.quantity}x {item.name}</h3>
                        <p>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <h3 className="total">Total: ${total.toFixed(2)}</h3>
              </>
            )}
          </div>

          <div className="customer-info-section">
            <h2>
              <span className="icon">👤</span> Customer Info
            </h2>
            <div className="customer-info">
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  placeholder="Enter your 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="checkout-buttons">
              <button
                className="place-order-button"
                onClick={() => handleButtonClick(handlePlaceOrder)}
              >
                Place Order
              </button>
              <button
                className="back-to-cart-button"
                onClick={() => handleButtonClick(() => navigate("/cart"))}
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;