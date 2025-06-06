import React, { useState } from 'react';
import './Loginpage.css';
import { useNavigate } from "react-router-dom";
import LoginForm from '../../libs/LoginForm/LoginForm';
// import media
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
import lvaVid from '../../../assets/pageBG/Logister/black-and-yellow-background-with-a-wave-pattern.mp4'

export default function Loginpage() {
  const [nextPage, setNextPage] = useState("Home"); // default target when logo is clicked
  const navigate = useNavigate();

  // Page transition toggle
  const toggleNextPage = () => {
    setNextPage(prev => (prev === "Register" ? "Home" : "Register"));
  };

  const handleLogoClick = () => {
    if (nextPage === "Home") {
      navigate("/"); // go to homepage
    } else {
      navigate("/register"); // go to register page
    }
  };

  return (
    <div class="loginpage-container">
      <video autoPlay muted loop playsInline class="logister-background-video">
        {/* logister-background-video share same css style with Registerpage.css */}
        <source src={lvaVid} type="video/mp4" />
      </video>

      {/* Page switcher on the top */}
      <div class="loginpage-header">
        <div className="loginpage-toggle">
          <div className="loginpage-headleft-bar" onClick={toggleNextPage}>
            <div className="loginpage-flip-container">
              <div className="loginpage-flip-front oleo-script-regular">{nextPage}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 group">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                animate-bounce text-orange-400 -rotate-6 
                text-2xl font-black opacity-0 group-hover:opacity-100 transition
                loginpage-tooltip-text">
              Switch here!
            </div>
            <div className="loginpage-logo" onClick={handleLogoClick}>
              <img
                src={GrDLogo}
                alt="Toggle Logo"
                className="loginpage-logo-inner"
              />
            </div>
          </div>

          <div className="loginpage-headright-bar">
            <div className="loginpage-static-text oleo-script-regular">page</div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div class="loginpage-content flex items-center justify-center min-h-[calc(100vh-60px)]">
        <LoginForm />
      </div>

    </div>
  )
}
