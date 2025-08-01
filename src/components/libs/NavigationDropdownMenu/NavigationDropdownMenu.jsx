import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "../../../redux/store";
import "./NavigationDropdownMenu.css";
// Importing profile menu assets
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import ArrowDropdown from "../../../assets/Icon_fill/Arrow_drop_down.svg";
import SubArrow from "../../../assets/Icon_line/Chevron_Right.svg";
import ChatIcon from "../../../assets/Icon_fill/comment_fill.svg";
import BellIcon from "../../../assets/Icon_fill/Bell_fill.svg";
import AchievementIcon from "../../../assets/Icon_fill/Flag_finish.svg";
import ActivityIcon from "../../../assets/Icon_fill/Huge-icon.svg";
import SettingIcon from "../../../assets/Icon_fill/Setting_fill.svg";
import LogoutIcon from "../../../assets/Icon_fill/Sign_out_squre_fill.svg";
import CloseSubMenu from "../../../assets/Icon_line/Chevron_Left.svg";
// Importing api services
import { Pathname, PATH_NAME } from "../../../router/Pathname";
import { setUser, logout } from "../../../redux/features/authSlice";
import { fetchUserInfo } from "../../../services/api.auth";
import { clearCart } from "../../../redux/features/cartSlice";

export default function NavigationDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [subMenu, setSubMenu] = useState(null); // 'chat' | 'notification' | null
  const [submenuExiting, setSubmenuExiting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Fetch user info on open (if not already loaded)
  useEffect(() => {
    if (isOpen && !user) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserInfo().then((res) => {
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        });
      }
    }
  }, [isOpen, user, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (subMenu !== null) {
          setSubMenu(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, subMenu]);

  if (!user) return null;

  const handleNavigate = (path) => {
    navigate(path.replace(":id", user.user_id));
    setIsOpen(false);
    setSubMenu(null);
  };

  // const handleLogout = () => {
  //   persistor.pause(); // stop persisting
  //   persistor.flush().then(() => {
  //     persistor.purge(); // mark persisted state as gone
  //     dispatch(logout()); // clear auth from Redux
  //     localStorage.removeItem("persist:root"); // force-remove immediately
  //     localStorage.clear(); // optional: clear everything else
  //     sessionStorage.clear();
  //     caches
  //       .keys()
  //       .then((names) => names.forEach((name) => caches.delete(name)));
  //   });
  //   // ✅ Reload cleanly to make sure Redux state is empty
  //   window.location.href = Pathname("LOGIN"); // <- hard reload
  // }; 
  const handleLogout = async () => {
    // Clear Redux memory state
    dispatch(logout());
    dispatch(clearCart());
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

  const handleCloseSubMenu = () => {
    setSubmenuExiting(true);
    setTimeout(() => {
      setSubMenu(null);
      setSubmenuExiting(false);
    }, 300); // match animation duration
  };

  // Dropdown trigger (avatar + arrow)
  return (
    <div className="nav-dropdown-root" ref={menuRef}>
      <div
        className="avatar relative ml-7 nav-profile-container"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="w-14 max-[480px]:w-10 rounded-full border-2 border-white relative nav-profile-img">
          <img
            src={
              user.profile_image
                ? `https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profile_image}`
                : ProfileHolder
            }
            alt="Profile"
          />
        </div>
        <div className="nav-arrow-dropdown">
          <img src={ArrowDropdown} alt="Dropdown" />
        </div>
      </div>
      {isOpen && (
        <div className="nav-dropdown-menu">
          {subMenu === null ? (
            <ul className="nav-dropdown-list">
              <li
                className="avatar nav-dropdown-avatar-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(Pathname("PROFILE"));
                }}
              >
                <div className="w-11 max-[480px]:w-10 rounded-full nav-dropdown-avatar small">
                  <img
                    src={
                      user.profile_image
                        ? `https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profile_image}`
                        : ProfileHolder
                    }
                    alt="avatar"
                  />
                </div>
                <span className="oxanium-semibold">{user.username}</span>
              </li>
              <li
                className="nav-sub-expand"
                onClick={(e) => {
                  e.stopPropagation();
                  setSubMenu("chat");
                }}
              >
                <div className="nav-dropdown-sub-container">
                  <img
                    className="nav-dropdown-item-icon"
                    src={ChatIcon}
                    alt="Chats"
                  />
                  <span className="oxanium-semibold">Chats</span>
                </div>
                <img
                  className="nav-dropdown-item-subIcon"
                  src={SubArrow}
                  alt="Submenu"
                />
              </li>
              {/* <li
                className="nav-sub-expand"
                onClick={(e) => {
                  e.stopPropagation();
                  setSubMenu("notification");
                }}
              >
                <div className="nav-dropdown-sub-container">
                  <img
                    className="nav-dropdown-item-icon"
                    src={BellIcon}
                    alt="Notifications"
                  />
                  <span className="oxanium-semibold">Notifications</span>
                </div>
                <img
                  className="nav-dropdown-item-subIcon"
                  src={SubArrow}
                  alt="Submenu"
                />
              </li> */}
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(Pathname("ACHIEVEMENT_PAGE"));
                }}
              >
                <img
                  className="nav-dropdown-item-icon"
                  src={AchievementIcon}
                  alt="Achievement"
                />
                <span className="oxanium-semibold">Achievements</span>
              </li>
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  // future change to activity page
                  handleNavigate(Pathname("ACTIVITIES_PAGE"));
                }}
              >
                <img
                  className="nav-dropdown-item-icon"
                  src={ActivityIcon}
                  alt="Activity"
                />
                <span className="oxanium-semibold">Activities</span>
              </li>

              <div className="nav-dropdown-divider" />

              <li
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(Pathname("SETTING_PAGE"));
                }}
              >
                <img
                  className="nav-dropdown-item-icon"
                  src={SettingIcon}
                  alt="Settings"
                />
                <span className="oxanium-semibold">Settings</span>
              </li>
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <img
                  className="nav-dropdown-item-icon"
                  src={LogoutIcon}
                  alt="Logout"
                />
                <span className="oxanium-semibold">Logout</span>
              </li>
            </ul>
          ) : subMenu === "chat" ? (
            <div
              className={`nav-submenu-panel${submenuExiting ? " exiting" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nav-submenu-header oxanium-semibold">
                <div
                  onClick={handleCloseSubMenu}
                  className="nav-dropdown-close-subIcon"
                >
                  <img src={CloseSubMenu} alt="Close Submenu" />
                </div>
                <span>Chats</span>
              </div>
              <div className="nav-submenu-content">
                {/* Render list of chats here */}
                <p>No chats yet.</p>
              </div>
            </div>
          ) : (
            <div
              className={`nav-submenu-panel${submenuExiting ? " exiting" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nav-submenu-header oxanium-semibold">
                <div
                  onClick={handleCloseSubMenu}
                  className="nav-dropdown-close-subIcon"
                >
                  <img src={CloseSubMenu} alt="Close Submenu" />
                </div>
                <span>Notifications</span>
              </div>
              <div className="nav-submenu-content">
                {/* Render list of notifications here */}
                <p>No notifications yet.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
