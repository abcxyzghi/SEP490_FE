import React from 'react';
import { Outlet } from "react-router-dom";
import './ModeratorPage.css';
import ModeratorSidebar from '../../libs/ModeratorSidebar/ModeratorSidebar';

export default function ModeratorPage() {
  return (
    <div className="ModeratorP-container">
      {/* Sidebar on the left */}
      <ModeratorSidebar />

      <div className='ModeratorP-content'>
        <Outlet />  {/* This will render nested routes */}
      </div>
    </div>
  )
}

