import React from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import './MainPage.css';
import Navigation from '../../libs/Navigation/Navigation';
import { Pathname } from '../../../router/Pathname';
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
      <Footer />
      {/* Footer at the bottom */}

    </div>
  )
}
