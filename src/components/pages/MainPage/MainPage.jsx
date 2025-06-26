import React from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { Pathname } from '../../../router/Pathname';
import './MainPage.css';
import Navigation from '../../libs/Navigation/Navigation';
import Footer from '../../libs/Footer/Footer';

export default function MainPage() {
  // const navigate = useNavigate();

  // const handleLogout = async () => {
  //   try {
  //     localStorage.removeItem("access_token");
  //     localStorage.removeItem("user");
  //     setAuthenticated(false); // Reset authentication state
  //     // setUser(null);
  //     const signinPath = Pathname('SIGNIN'); // Fetch path
  //     if (signinPath) {
  //       navigate(signinPath); // Navigate to signin
  //     } else {
  //       console.error("Signin path is undefined.");
  //     }
  //   } catch (error) {
  //     console.error('Error during logout:', error);
  //   }
  // };
  
  return (
    <div className='MainP-container'>
      {/* Naviagation on top */}
      {/* <AdminSidebar onLogout={handleLogout} /> */}
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
