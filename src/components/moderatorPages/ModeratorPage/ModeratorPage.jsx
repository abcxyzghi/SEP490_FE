import React from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import './ModeratorPage.css';

export default function ModeratorPage() {
  return (
    <div className="ModeratorP-container">
      {/* Sidebar on the left */}


      <div className='ModeratorP-content'>
        <Outlet />  {/* This will render nested routes */}
      </div>
    </div>
  )
}

