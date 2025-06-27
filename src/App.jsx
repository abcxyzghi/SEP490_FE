import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import './App.css';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { publicRoutes, privateRoutes, moderatorRoutes, adminRoutes } from './router/routerConfig';
import { PATH_NAME } from './router/Pathname';
import Registerpage from './components/pages/Registerpage/Registerpage';
import Loginpage from './components/pages/Loginpage/Loginpage';
import NotFoundpage from './components/pages/NotFoundpage/NotFoundpage';
import MainPage from './components/pages/MainPage/MainPage';
import ModeratorPage from './components/moderatorPages/ModeratorPage/ModeratorPage';
import AdminPage from './components/adminPages/AdminPage/AdminPage';

const pageVariants = {
  initial: { opacity: 0, y: "-100vh" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100vh" },
  transition: { duration: 0.4 },
};

const AnimatedRoute = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition="transition"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  const user = useSelector((state) => state.user); // Already from persisted Redux state
  const userRole = user?.role;

  return (
    <AnimatedRoute>
      <Routes>
        <Route path="/" element={<MainPage />}>
          {/* Public Routes */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* Private Routes */}
          {privateRoutes.map((route) => {
            const hasAccess = route.role
              ? route.role.includes(userRole)
              : Boolean(userRole);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  hasAccess ? (
                    route.element
                  ) : (
                    <Navigate to={PATH_NAME.NOTFOUND} replace />
                  )
                }
              />
            );
          })}
        </Route>

        {/* Moderator Routes */}
        <Route element={<ModeratorPage />}>
          {moderatorRoutes.map((route) => {
            const hasAccess = route.role
              ? route.role.includes(userRole)
              : Boolean(userRole);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  hasAccess ? (
                    route.element
                  ) : (
                    <Navigate to={PATH_NAME.NOTFOUND} replace />
                  )
                }
              />
            );
          })}
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminPage />}>
          {adminRoutes.map((route) => {
            const hasAccess = route.role
              ? route.role.includes(userRole)
              : Boolean(userRole);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  hasAccess ? (
                    route.element
                  ) : (
                    <Navigate to={PATH_NAME.NOTFOUND} replace />
                  )
                }
              />
            );
          })}
        </Route>

        {/* Top-Level Routes */}
        <Route path={PATH_NAME.REGISTER} element={
          user ? <Navigate to={PATH_NAME.HOMEPAGE} replace /> : <Registerpage />
        } />
        <Route path={PATH_NAME.LOGIN} element={
          user ? <Navigate to={PATH_NAME.HOMEPAGE} replace /> : <Loginpage />
        } />
        <Route path={PATH_NAME.NOTFOUND} element={<NotFoundpage />} />
      </Routes>
    </AnimatedRoute>

  )
}

export default App
