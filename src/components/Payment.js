
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { playClickSound } from "../utils/soundEffects";
import "./payment.css";

const Payment = () => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = localStorage.getItem("lastOrderId");
    console.log("Retrieved orderId from localStorage:", orderId);
    if (!orderId) {
      console.error("No orderId found");
      setError("No order found. Redirecting to home...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    console.log("Fetching from:", `http://localhost:3001/latest-order/${orderId}`);
    fetch(`http://localhost:3001/latest-order/${orderId}`)
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("Fetched order data:", data);
        if (data.error) {
          console.error("Error fetching order:", data.error);
          setError("Order not found: " + data.error);
          setTimeout(() => navigate("/"), 2000);
        } else {
          setOrder(data);
          console.log("Order state set:", data);
          setTimeout(() => {
            console.log("Triggering auto-print");
            window.print();
            setTimeout(() => {
              console.log("Redirecting to home after print");
              navigate("/");
            }, 1000);
          }, 3000);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError("Failed to fetch order: " + error.message);
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate]);

  const handleButtonClick = (action) => {
    playClickSound();
    action();
  };

  const handleManualPrint = () => {
    window.print();
  };

  if (error) {
    return <div className="payment-kiosk"><h2>{error}</h2></div>;
  }

  if (!order) {
    console.log("Order is null, rendering loading");
    return <div className="payment-kiosk"><h2>Loading receipt...</h2></div>;
  }

  return (
    <div className="payment-kiosk">
      <div className="payment-screen">
        <div className="order-confirmation">
          <h2>Order Placed Successfully!</h2>
          <p className="order-number">Your Order Number: {order.orderNumber}</p>
          <p className="order-instruction">
            Please wait—your order will be called when ready!
          </p>
          <div className="receipt">
            <div className="receipt-header">
              <h3>KTM</h3>
              <p>Thank you for your order!</p>
            </div>
            <div className="receipt-details">
              <p><strong>Order #:</strong> {order.orderNumber}</p>
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Date:</strong> {order.timestamp}</p>
            </div>
            <div className="receipt-items">
              <h4>Order Details</h4>
              <ul className="receipt-list">
                {order.cart.map((item, index) => (
                  <li key={index}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="receipt-total">
              <strong>Total: ${order.total}</strong>
            </div>
            <div className="receipt-footer">
              <p>Visit us again!</p>
            </div>
          </div>
          <button
            className="print-button"
            onClick={() => handleButtonClick(handleManualPrint)}
          >
            Print Receipt
          </button>
          <button
            className="back-button"
            onClick={() => handleButtonClick(() => navigate("/"))}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;