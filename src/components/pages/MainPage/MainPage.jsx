import React from 'react';
import { Outlet } from "react-router-dom";
import './MainPage.css';
import Navigation from '../../libs/Navigation/Navigation';
import Footer from '../../libs/Footer/Footer';

export default function MainPage() {

  return (
    <div className='MainP-container'>
      {/* Naviagation on top */}
      <Navigation />

      {/* Main content area */}
      <div className='MainP-content'>
        <Outlet />  {/* This will render nested routes like /home/shop */}
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  )
}
