import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './ModeratorSidebar.css';
import { Pathname, PATH_NAME } from '../../../router/Pathname';
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "../../../redux/features/authSlice";
import { fetchUserInfo } from "../../../services/api.auth";

// Importing icons
import FullLogo from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import Logo from '../../../assets/logoSVG/Logo-Grdient.svg';
// 6 pages = 6 icons
import ModDashboardIcon from '../../../assets/Icon_line/chart-square.svg';
import ModProfileIcon from '../../../assets/Icon_line/User_Card_ID.svg';
import ModReportIcon from '../../../assets/Icon_line/file-unknown.svg';
import ModProductIcon from '../../../assets/Icon_line/Arhive.svg';
import ModBoxIcon from '../../../assets/Icon_line/blockchain-03.svg';
import ModAuctionIcon from '../../../assets/Icon_line/audit-01.svg';
import SideCloseIcon from '../../../assets/Icon_line/sidebar-left.svg';
import LogoutIcon from '../../../assets/Icon_line/Sign_out_squre.svg';
import ModCollectionIcon from '../../../assets/Icon_line/audit-01.svg';
import ModWithdrawRequestIcon from '../../../assets/Icon_line/audit-01.svg';

export default function ModeratorSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return JSON.parse(localStorage.getItem("modSidebarCollapsed")) || false;
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
            localStorage.setItem("modSidebarCollapsed", JSON.stringify(!prev));
            return !prev;
        });
    };


    // Define links for the sidebar
    const topLinks = [
        { path: Pathname('MODERATOR_DASHBOARD'), label: 'Dashboard', defaultIcon: ModDashboardIcon },
        { path: Pathname('MODERATOR_PROFILE'), label: 'Profile', defaultIcon: ModProfileIcon },
        { path: Pathname('MODERATOR_REPORT'), label: 'Report Management', defaultIcon: ModReportIcon },
        { path: Pathname('MODERATOR_PRODUCT'), label: 'Product Management', defaultIcon: ModProductIcon },
        { path: Pathname('MODERATOR_MYSTERYBOX'), label: 'Box Management', defaultIcon: ModBoxIcon },
        { path: Pathname('MODERATOR_AUCTION'), label: 'Auction Management', defaultIcon: ModAuctionIcon },
        { path: Pathname('MODERATOR_COLLECTION'), label: 'Collection Management', defaultIcon: ModCollectionIcon },
        { path: Pathname('MODERATOR_WITHDRAW_REQUEST'), label: 'Withdraw Request Management', defaultIcon: ModWithdrawRequestIcon },
    ];

    const bottomLinks = [
        { label: 'Logout', onClick: handleLogout, defaultIcon: LogoutIcon },
    ];

    return (
        <div className={`mod-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

            <div className="mod-sidebar-logo-container">
                {isCollapsed ? (
                    <img src={Logo} alt="Logo" className="mod-sidebar-sole-logo" />
                ) : (
                    <img src={FullLogo} alt="Full Logo" className="mod-sidebar-full-logo" />
                )}
            </div>

            <button className="mod-sidebar-toggle-btn" onClick={toggleSidebar}>
                {/* {isCollapsed ? '⟩' : '⟨'} */}
                <img src={SideCloseIcon} alt="Coll-Exp" className="mod-sidebar-toggle-icon" />
            </button>

            <div className="mod-sidebar-links-container">
                {/* Top section */}
                <div className="mod-sidebar-top-links">
                    {topLinks
                        .map((link) => (
                            <NavLink
                                to={link.path}
                                className='mod-sidebar-link oxanium-semibold'
                                key={link.label}
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={link.defaultIcon}
                                            alt={`${link.label} Icon`}
                                            className="mod-sidebar-icon"
                                        />
                                        {!isCollapsed && <span className="mod-sidebar-label-style">{link.label}</span>}
                                    </>
                                )}
                            </NavLink>
                        ))}
                </div>

                {/* Bottom section */}
                <div className="mod-sidebar-bottom-links">
                    {bottomLinks
                        .map((link, index) => (
                            link.path ? (
                                <NavLink
                                    to={link.path}
                                    className='mod-sidebar-link'
                                    key={index}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <img
                                                src={link.defaultIcon}
                                                alt={`${link.label} Icon`}
                                                className="mod-sidebar-icon"
                                            />
                                            {!isCollapsed && <span className="mod-sidebar-label-style">{link.label}</span>}
                                        </>
                                    )}
                                </NavLink>
                            ) : (
                                <button
                                    key={index}
                                    onClick={link.onClick}
                                    className="mod-sidebar-link logoutBtn-style oxanium-semibold"
                                >
                                    <img src={link.defaultIcon} alt={`${link.label} Icon`} className="mod-sidebar-icon" />
                                    {!isCollapsed && <span className="mod-sidebar-label-style">{link.label}</span>}
                                </button>
                            )
                        ))}
                </div>
            </div>
        </div>
    )
}
