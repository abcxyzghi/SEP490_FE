import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';
import { Pathname } from '../../../router/Pathname';

// Importing icons
import FullLogoGrD from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
import SidebarToggle from '../../../assets/Icon_line/upload-square-02.svg'; // replace with actual icon
import AdminDashboardIcon from '../../../assets/Icon_line/Chart_alt.svg';
import UsersIcon from '../../../assets/Icon_line/user_management.svg'; // Moderator + User
import SystemIcon from '../../../assets/Icon_line/computer-dollar.svg'; // Auntion + Product. user 'Order' icon
import TransactionIcon from '../../../assets/Icon_line/estimate-01.svg'; 
import LogoutIcon from '../../../assets/Icon_line/Sign_out_squre.svg'; 


export default function AdminSidebar({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Define links for the sidebar
  const topLinks = [
    { path: Pathname('ADMIN_DASHBOARD'), label: 'Dashboard', defaultIcon: AdminDashboardIcon },
    { path: Pathname('ADMIN_USERMANGEMENT'), label: 'User Management', defaultIcon: UsersIcon },
    { path: Pathname('ADMIN_SYSTEMMANGEMENT'), label: 'System Management', defaultIcon: SystemIcon },
    { path: Pathname('ADMIN_TRANSACTIONMANGEMENT'), label: 'Transaction Management', defaultIcon: TransactionIcon },
  ];

  const bottomLinks = [
    { label: 'Logout', onClick: onLogout, defaultIcon: LogoutIcon },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      <div className="logo-container">
        {isCollapsed ? (
          <img src={GrDLogo} alt="Logo" className="sole-logo" />
        ) : (
          <img src={FullLogoGrD} alt="Full Logo" className="full-logo" />
        )}
      </div>

      <button className="toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? '⟩' : '⟨'}
      </button>

      <div className="links-container">
        {/* Top section */}
        <div className="top-links">
          {topLinks
            .map((link) => (
              <NavLink
                to={link.path}
                className='sidebar-link'
                key={link.label}
              >
                {({ isActive }) => (
                  <div className={`sidebar-link-content${isActive ? ' active' : ''}`}>
                    <img
                      src={link.defaultIcon}
                      alt={`${link.label} Icon`}
                      className="icon"
                    />
                    {!isCollapsed && <span className="label-style">{link.label}</span>}
                  </div>
                )}
              </NavLink>
            ))}
        </div>

        {/* Bottom section */}
        <div className="bottom-links">
          {bottomLinks
            .map((link, index) => (
              link.path ? (
                <NavLink
                  to={link.path}
                  className='sidebar-link'
                  key={index}
                >
                  {({ isActive }) => (
                    <div className={`sidebar-link-content${isActive ? ' active' : ''}`}>
                      <img
                        src={link.defaultIcon}
                        alt={`${link.label} Icon`}
                        className="icon"
                      />
                      {!isCollapsed && <span className="label-style">{link.label}</span>}
                    </div>
                  )}
                </NavLink>
              ) : (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="sidebar-link logoutBtn-style"
                >
                  <div className="sidebar-link-content">
                    <img src={link.defaultIcon} alt={`${link.label} Icon`} className="icon" />
                    {!isCollapsed && <span className="label-style">{link.label}</span>}
                  </div>
                </button>
              )
            ))}
        </div>
      </div>
    </div>
  )
}
