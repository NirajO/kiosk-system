// src/components/Menu.js
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { playClickSound } from "../utils/soundEffects";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import "./menu.css";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Meals");
  const { cart, addToCart, clearCart } = useCart(); 
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/menu")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched menu items:", data);
        // Ensure data is an array; if not, default to an empty array
        const items = Array.isArray(data) ? data : [];
        setMenuItems(items);
        const categories = [...new Set(items.map((item) => item.category || "Other"))];
        if (!categories.includes("Meals") && categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching menu:", error);
        setMenuItems([]); // Set to empty array on error
      });
  }, []);

 
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item) => {
    playClickSound();
    addToCart(item);
  };

  const handleButtonClick = (action) => {
    playClickSound();
    action();
  };

  const handleCategoryClick = (category) => {
    playClickSound();
    setSelectedCategory(category);
  };

  const handleSwipe = (direction) => {
    const currentIndex = categories.indexOf(selectedCategory);
    let newIndex;

    if (direction === "left") {
      newIndex = (currentIndex + 1) % categories.length;
    } else {
      newIndex = (currentIndex - 1 + categories.length) % categories.length;
    }

    setSelectedCategory(categories[newIndex]);
    playClickSound();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: false,
  });

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedItems);

  const handleBackToHome = () => {
    clearCart(); 
    navigate("/"); 
  };

  return (
    <div className="menu-kiosk">
      <div className="menu-screen">
        <div className="menu-header">
          <button
            className="back-to-home-button"
            onClick={() => handleButtonClick(handleBackToHome)}
          >
            Back to Home
          </button>
          <h1>Menu</h1>
        </div>

        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="menu-content" {...swipeHandlers}>
          {selectedCategory && groupedItems[selectedCategory] ? (
            <>
              <h2>{selectedCategory}</h2>
              <div className="menu-items">
                {groupedItems[selectedCategory].map((item) => (
                  <div key={item.id} className="menu-item">
                    <img src={`/images/${item.image}`} alt={item.name} />
                    <h3>{item.name}</h3>
                    <p className="description">{item.description || "No description available."}</p>
                    <p className="price">${(item.price != null ? Number(item.price) : 0).toFixed(2)}</p>
                    <button onClick={() => handleAddToCart(item)}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No items available in this category.</p>
          )}
        </div>

        <button
          className="cart-button"
          onClick={() => handleButtonClick(() => navigate("/cart"))}
        >
          View Cart {cartItemCount > 0 && <span className="cart-count">({cartItemCount})</span>}
        </button>
      </div>
    </div>
  );
};

export default Menu;