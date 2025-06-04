import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import {Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { privateRoutes } from './router/routerConfig'

import Navigation from './components/libs/Navigation/Navigation';

function App() {

  return (
    <>
      <Navigation/>
    </>
  )
}

export default App
