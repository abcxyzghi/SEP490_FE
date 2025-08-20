import React, { useState } from 'react';
import './Registerpage.css';
import { useNavigate } from "react-router-dom";
import Particles from '../../libs/Particles/Particles';
import RegisterForm from '../../libs/RegisterForm/RegisterForm';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
//import media
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
import lvaVid from '../../../assets/pageBG/Logister/black-and-yellow-background-with-a-wave-pattern.mp4'

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Registerpage() {
  const [nextPage, setNextPage] = useState("Home"); // default target when logo is clicked
  const [pauseOnHoverZone, setPauseOnHoverZone] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    duration: 6000,
  });
  const navigate = useNavigate();

  // Page transition toggle
  const toggleNextPage = () => {
    setNextPage(prev => (prev === "Login" ? "Home" : "Login"));
  };

  const handleLogoClick = () => {
    if (nextPage === "Home") {
      navigate("/"); // go to homepage
    } else {
      navigate("/login"); // go to login page
    }
  };

  // Helper to show snackbar from child components
  const showSnackbar = (message, severity = 'info', duration = 6000) => {
    setSnackbar({ open: true, message, severity, duration });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="registerpage-container">
      {/* <video autoPlay muted loop playsInline className="logister-background-video">
        <source src={lvaVid} type="video/mp4" />
      </video> */}
      <div className='logister-particle-background'>
        <Particles
          particleColors={['#960BAF', '#F8AC52', '#0db6e0']}
          particleCount={700}
          particleSpread={10}
          speed={0.2}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          pauseOnHoverZone={pauseOnHoverZone}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Page switcher on the top */}
      <div
        className="registerpage-header"
        onMouseEnter={() => setPauseOnHoverZone(false)}   // won't pause while hovered
        onMouseLeave={() => setPauseOnHoverZone(false)}
      >
        <div className="registerpage-toggle">
          <div className="registerpage-headleft-bar" onClick={toggleNextPage}>
            <div className="registerpage-flip-container">
              <div className="registerpage-flip-front oleo-script-regular">{nextPage}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 group">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                  animate-bounce text-orange-400 -rotate-6 
                  text-2xl font-black opacity-0 group-hover:opacity-100 transition
                  registerpage-tooltip-text">
              Switch here!
            </div>
            <div className="registerpage-logo" onClick={handleLogoClick}>
              <img
                src={GrDLogo}
                alt="Toggle Logo"
                className="registerpage-logo-inner"
              />
            </div>
          </div>

          <div className="registerpage-headright-bar">
            <div className="registerpage-static-text oleo-script-regular">page</div>
          </div>
        </div>
      </div>

      {/* Register Form */}
      <div
        className="registerpage-content flex items-center justify-center min-h-[calc(100vh-60px)]"
        onMouseEnter={() => setPauseOnHoverZone(false)}   // won't pause while hovered
        onMouseLeave={() => setPauseOnHoverZone(false)}
      >
        {/* PASS the showSnackbar function to the form */}
        <RegisterForm showSnackbar={showSnackbar} />
      </div>

      {/* Top-level Snackbar (renders relative to viewport) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
}
