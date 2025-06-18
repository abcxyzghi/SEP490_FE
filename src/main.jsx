import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <BrowserRouter>
  //   <App />
  // </BrowserRouter>,
  <StrictMode>
    <App />
  </StrictMode>
  )



// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import {createBrowserRouter,RouterProvider,} from "react-router-dom";
// import LoginPage from './page/login/index.jsx';
// import RegisterPage from './page/register/index.jsx';
//   const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <LoginPage />,
//   },
//   {
//     path: "/register",
//     element: <RegisterPage/>,
//   },
// ]);
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>,
// )
