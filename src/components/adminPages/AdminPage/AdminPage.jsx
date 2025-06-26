import React from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import './AdminPage.css';
import AdminSidebar from '../../libs/AdminSidebar/AdminSidebar';

export default function AdminPage() {
  return (
    <div className="AdminP-container">
      {/* Sidebar on the left */}
      <AdminSidebar />

      {/* Main content area */}
      <div className='AdminP-content'>
        <Outlet />  {/* This will render nested routes */}
      </div>
    </div>
  )
}
