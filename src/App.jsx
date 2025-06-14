import React, { useState, useEffect } from 'react'
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { publicRoutes, privateRoutes } from './router/routerConfig';
import { PATH_NAME } from './router/Pathname';
import Registerpage from './components/pages/Registerpage/Registerpage';
import Loginpage from './components/pages/Loginpage/Loginpage';
import NotFoundpage from './components/pages/NotFoundpage/NotFoundpage';
import MainPage from './components/pages/MainPage/MainPage';

const pageVariants = {
  initial: { opacity: 0,  y: "-100vh"},
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0,  y: "100vh"},
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    // <>
    //   <Registerpage/>
    // </>
    <Router>
      <AnimatedRoute>
        <Routes>
          <Route path="/" element={<MainPage user={user} />}>
            {/* Public Routes */}
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {/* Private Routes */}
            {privateRoutes.map((route) => {
              const hasAccess = route.roles
                ? route.roles.includes(user?.role)
                : Boolean(user);
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    hasAccess ? (
                      route.element
                    ) : (
                      <Navigate to={PATH_NAME.LOGIN} replace />
                    )
                  }
                />
              );
            })}
          </Route>

          {/* Top-Level Routes */}
          <Route path={PATH_NAME.REGISTER} element={<Registerpage />} />
          <Route path={PATH_NAME.LOGIN} element={<Loginpage />} />
          <Route path={PATH_NAME.NOTFOUND} element={<NotFoundpage />} />
        </Routes>
      </AnimatedRoute>
    </Router>
  )
}

export default App
