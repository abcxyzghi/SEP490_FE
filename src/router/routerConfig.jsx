import { PATH_NAME } from "./Pathname";
// import pages
import Registerpage from "../components/pages/Registerpage/Registerpage";
import Loginpage from "../components/pages/Loginpage/Loginpage";
import NotFoundpage from "../components/pages/NotFoundpage/NotFoundpage";
import Homepage from "../components/pages/Homepage/Homepage";
import Shoppage from "../components/pages/Shoppage/Shoppage";
import Auctionpage from "../components/pages/Auctionpage/Auctionpage";
import AuctionRoom from "../components/pages/AuctionRoom/AuctionRoom";
import BoxDetailpage from "../components/pages/BoxDetailpage/BoxDetailpage";
import ProductDetailpage from "../components/pages/ProductDetailpage/ProductDetailpage";
import Settingpage from "../components/pages/Settingpage/Settingpage";
import Profilepage from "../components/pages/Profilepage/Profilepage";
import Cartpage from "../components/pages/Cartpage/Cartpage";

export const logisterRoutes = [
    { path: PATH_NAME.REGISTER, element: <Registerpage /> },
    { path: PATH_NAME.LOGIN, element: <Loginpage /> },
    { path: PATH_NAME.NOTFOUND, element: <NotFoundpage /> },
];

export const publicRoutes = [
    { path: PATH_NAME.HOMEPAGE, element: <Homepage /> },
    { path: PATH_NAME.SHOP_PAGE, element: <Shoppage /> },
    { path: PATH_NAME.AUNCTION_PAGE, element: <Auctionpage /> },
    { path: PATH_NAME.BOXDETAIL_PAGE, element: <BoxDetailpage /> },
    { path: PATH_NAME.PRODUCTDETAIL_PAGE, element: <ProductDetailpage /> },
    { path: PATH_NAME.PROFILE, element: <Profilepage /> },
    { path: PATH_NAME.CART_PAGE, element: <Cartpage /> }, 
];

export const privateRoutes = [
    // { path: PATH_NAME.HOME, element: <Home />, roles: ['free', 'learner', 'proUser'] },
    { path: PATH_NAME.AUNCTION_ROOM, element: <AuctionRoom />},
    { path: PATH_NAME.SETTING_PAGE, element: <Settingpage />},

];

// export const adminRoutes = [
//     {path: PATH_NAME.ADMIN_DASHBOARD, element: <AdminDashboard /> , isAdmin: true },
//     {path: PATH_NAME.ADMIN_USERMANGEMENT, element: <AdminUserManagement /> , isAdmin: true },
//     {path: PATH_NAME.ADMIN_SUBSCRIPTION, element: <AdminSubscription /> , isAdmin: true },
// ];

  