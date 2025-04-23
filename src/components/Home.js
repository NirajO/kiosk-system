// src/components/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { playClickSound } from "../utils/soundEffects";
import "../styles.css";

function Home() {
  const navigate = useNavigate();

  const handleButtonClick = (action) => {
    playClickSound();
    action();
  };

  return (
    <div className="home">
      <h1 className="welcome">Welcome to KTM</h1>
      <button
        className="button"
        onClick={() => handleButtonClick(() => navigate("/menu"))}
      >
        Tap to Start
      </button>
    </div>
  );
}

export default Home;