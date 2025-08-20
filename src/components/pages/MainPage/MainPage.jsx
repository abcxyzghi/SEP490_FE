import React from 'react';
import { Outlet, useLocation } from "react-router-dom";
import './MainPage.css';
import Navigation from '../../libs/Navigation/Navigation';
import Footer from '../../libs/Footer/Footer';

export default function MainPage() {
  const location = useLocation();
  const isChatRoom = location.pathname.startsWith("/chatroom")

  return (
    <div className={`MainP-container ${isChatRoom ? "MainP-chatroom-mode" : ""}`}>
      {/* Naviagation on top */}
      <Navigation />

      {/* Main content area */}
      <div className={`MainP-content ${isChatRoom ? "MainP-chatroom-mode" : ""}`}>
        <Outlet />  {/* This will render nested routes like /home/shop */}
      </div>

      {/* Footer at the bottom / Only hide specifically for ChatRoom */}
      {!isChatRoom && <Footer />}
    </div>
  )
}
