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
import CollectionDetailPage from "../components/pages/CollectionDetailPage/CollectionDetailPage";
import ProductDetailpage from "../components/pages/ProductDetailpage/ProductDetailpage";
import Settingpage from "../components/pages/Settingpage/Settingpage";
import Notificationpage from "../components/pages/Notificationpage/Notificationpage";
import Profilepage from "../components/pages/Profilepage/Profilepage";
import Cartpage from "../components/pages/Cartpage/Cartpage";
import Paymentpage from "../components/pages/Paymentpage/Paymentpage";
import Checkoutpage from "../components/pages/Checkoutpage/Checkoutpage";
import Achievementpage from "../components/pages/Achievementpage/Achievementpage";
import ChatRoom from "../components/pages/ChatRoom/ChatRoom";
import ModeratorDashboard from "../components/moderatorPages/ModeratorDashboard/ModeratorDashboard";

import AdminDashboard from "../components/adminPages/AdminDashboard/AdminDashboard";
import UserManagement from "../components/adminPages/UserManagement/UserManagement";
import SystemManagement from "../components/adminPages/SystemManagement/SystemManagement";
import TransactionManagement from "../components/adminPages/TransactionManagement/TransactionManagement";
import Exchangepage from "../components/pages/Exchangepage/Exchangepage";

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
    { path: PATH_NAME.COLLECTIONDETAIL_PAGE, element: <CollectionDetailPage /> },    
    { path: PATH_NAME.PRODUCTDETAIL_PAGE, element: <ProductDetailpage /> },
    { path: PATH_NAME.PROFILE, element: <Profilepage /> },
];

export const privateRoutes = [
    // { path: PATH_NAME.HOME, element: <Home />, roles: ['free', 'learner', 'proUser'] },
    { path: PATH_NAME.AUNCTION_ROOM, element: <AuctionRoom />, role: ['user'] },
    { path: PATH_NAME.SETTING_PAGE, element: <Settingpage />, role: ['user'] },
    { path: PATH_NAME.CART_PAGE, element: <Cartpage />, role: ['user'] },
    { path: PATH_NAME.PAYMENT_PAGE, element: <Paymentpage />, role: ['user'] },
    { path: PATH_NAME.CHECKOUT_PAGE, element: <Checkoutpage />, role: ['user'] },
    { path: PATH_NAME.ACHIEVEMENT_PAGE, element: <Achievementpage />, role: ['user'] },
    { path: PATH_NAME.NOTIFICATION_PAGE, element: <Notificationpage />, role: ['user'] },
    { path: PATH_NAME.CHAT_ROOM, element:<ChatRoom/>, role: ['user']},
    { path: PATH_NAME.EXCHANGE_PAGE, element: <Exchangepage />, role: ['user'] },

];

export const moderatorRoutes = [
    {path: PATH_NAME.MODERATOR_DASHBOARD, element: <ModeratorDashboard /> , role: ['moderator'] },
   
];

export const adminRoutes = [
    {path: PATH_NAME.ADMIN_DASHBOARD, element: <AdminDashboard /> , role: ['admin'] },
    {path: PATH_NAME.ADMIN_USERMANGEMENT, element: <UserManagement /> , role: ['admin'] },
    {path: PATH_NAME.ADMIN_SYSTEMMANGEMENT, element: <SystemManagement /> , role: ['admin'] },
    {path: PATH_NAME.ADMIN_TRANSACTIONMANGEMENT, element: <TransactionManagement /> , role: ['admin'] },
];

