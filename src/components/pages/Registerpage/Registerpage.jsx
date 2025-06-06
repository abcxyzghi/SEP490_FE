import React, { useState } from 'react';
import './Registerpage.css';
import { useNavigate } from "react-router-dom";
import RegisterForm from '../../libs/RegisterForm/RegisterForm';
//import media
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
import lvaVid from '../../../assets/pageBG/Logister/black-and-yellow-background-with-a-wave-pattern.mp4'

export default function Registerpage() {
  const [nextPage, setNextPage] = useState("Home"); // default target when logo is clicked
  const navigate = useNavigate();

  // Page transition toggle
  const toggleNextPage = () => {
    setNextPage(prev => (prev === "Login" ? "Home" : "Login"));
  };

  const handleLogoClick = () => {
    if (nextPage === "Home") {
      navigate("/"); // go to homepage
    } else {
      navigate("/login"); // go to login page
    }
  };

  return (
    <div className="registerpage-container">
      <video autoPlay muted loop playsInline className="logister-background-video">
        <source src={lvaVid} type="video/mp4" />
      </video>

      {/* Page switcher on the top */}
      <div className="registerpage-header">
        <div className="registerpage-toggle">
          <div className="registerpage-headleft-bar" onClick={toggleNextPage}>
            <div className="registerpage-flip-container">
              <div className="registerpage-flip-front oleo-script-regular">{nextPage}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 group">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                  animate-bounce text-orange-400 -rotate-6 
                  text-2xl font-black opacity-0 group-hover:opacity-100 transition
                  registerpage-tooltip-text">
              Switch here!
            </div>
            <div className="registerpage-logo" onClick={handleLogoClick}>
              <img
                src={GrDLogo}
                alt="Toggle Logo"
                className="registerpage-logo-inner"
              />
            </div>
          </div>

          <div className="registerpage-headright-bar">
            <div className="registerpage-static-text oleo-script-regular">page</div>
          </div>
        </div>
      </div>

      {/* Register Form */}
      <div className="registerpage-content flex items-center justify-center min-h-[calc(100vh-60px)]">
        <RegisterForm />
      </div>


    </div>
  );
}
