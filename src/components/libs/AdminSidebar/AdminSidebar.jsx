import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import { Pathname, PATH_NAME } from '../../../router/Pathname';
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "../../../redux/features/authSlice";
import { fetchUserInfo } from "../../../services/api.auth";

// Importing icons
import FullLogo from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import Logo from '../../../assets/logoSVG/Logo-Grdient.svg';
// 6 pages = 6 icons
import AdminDashboardIcon from '../../../assets/Icon_line/Chart_alt.svg';
import AdminUserIcon from '../../../assets/Icon_line/user_management.svg';
import AdminProductIcon from '../../../assets/Icon_line/Arhive.svg';
import AdminAuctionIcon from '../../../assets/Icon_line/audit-01.svg';
import AdminRevenueIcon from '../../../assets/Icon_line/estimate-01.svg';
import AdminReportIcon from '../../../assets/Icon_line/file-unknown.svg';

import SideCloseIcon from '../../../assets/Icon_line/sidebar-left.svg';
import LogoutIcon from '../../../assets/Icon_line/Sign_out_squre.svg';


export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem("adminSidebarCollapsed")) || false;
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Fetch user info on open (if not already loaded)
  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserInfo().then((res) => {
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        });
      }
    }
  }, [user, dispatch]);


  const handleLogout = async () => {
    // Clear Redux memory state
    dispatch(logout());
    // dispatch(clearCart());
    // Clear localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all browser caches (for PWAs or service workers)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        // Ignore cache errors
      }
    }

    // Navigate to login page (soft)
    navigate(PATH_NAME.LOGIN, { replace: true });
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("adminSidebarCollapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  // Define links for the sidebar
  const topLinks = [
    { path: Pathname('ADMIN_DASHBOARD'), label: 'Dashboard', defaultIcon: AdminDashboardIcon },
    { path: Pathname('ADMIN_USERS'), label: 'User Management', defaultIcon: AdminUserIcon },
    { path: Pathname('ADMIN_PRODUCT'), label: 'Product Management', defaultIcon: AdminProductIcon },
    { path: Pathname('ADMIN_AUCTION'), label: 'Auction Management', defaultIcon: AdminAuctionIcon },
    { path: Pathname('ADMIN_REVENUE'), label: 'Revenue Management', defaultIcon: AdminRevenueIcon },
    { path: Pathname('ADMIN_REPORT'), label: 'Report Management', defaultIcon: AdminReportIcon },
  ];

  const bottomLinks = [
    { label: 'Logout', onClick: handleLogout, defaultIcon: LogoutIcon },
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      <div className="admin-sidebar-logo-container">
        {isCollapsed ? (
          <img src={Logo} alt="Logo" className="admin-sidebar-sole-logo" />
        ) : (
          <img src={FullLogo} alt="Full Logo" className="admin-sidebar-full-logo" />
        )}
      </div>

      <button className="admin-sidebar-toggle-btn" onClick={toggleSidebar}>
        {/* {isCollapsed ? '⟩' : '⟨'} */}
        <img src={SideCloseIcon} alt="Coll-Exp" className="admin-sidebar-toggle-icon" />
      </button>

      <div className="admin-sidebar-links-container">
        {/* Top section */}
        <div className="admin-sidebar-top-links">
          {topLinks
            .map((link) => (
              <NavLink
                to={link.path}
                className='admin-sidebar-link oxanium-semibold'
                key={link.label}
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={link.defaultIcon}
                      alt={`${link.label} Icon`}
                      className="admin-sidebar-icon"
                    />
                    {!isCollapsed && <span className="admin-sidebar-label-style">{link.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
        </div>

        {/* Bottom section */}
        <div className="admin-sidebar-bottom-links">
          {bottomLinks
            .map((link, index) => (
              link.path ? (
                <NavLink
                  to={link.path}
                  className='admin-sidebar-link'
                  key={index}
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={link.defaultIcon}
                        alt={`${link.label} Icon`}
                        className="admin-sidebar-icon"
                      />
                      {!isCollapsed && <span className="admin-sidebar-label-style">{link.label}</span>}
                    </>
                  )}
                </NavLink>
              ) : (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="admin-sidebar-link logoutBtn-style oxanium-semibold"
                >
                  <img src={link.defaultIcon} alt={`${link.label} Icon`} className="admin-sidebar-icon" />
                  {!isCollapsed && <span className="admin-sidebar-label-style">{link.label}</span>}
                </button>
              )
            ))}
        </div>
      </div>
    </div>
  )
}
