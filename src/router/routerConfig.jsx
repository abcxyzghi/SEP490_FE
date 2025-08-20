import { PATH_NAME } from "./Pathname";
// import pages
import Registerpage from "../components/pages/Registerpage/Registerpage";
import Loginpage from "../components/pages/Loginpage/Loginpage";
import NotFoundpage from "../components/pages/NotFoundpage/NotFoundpage";
import TermsOfService from "../components/pages/TermsOfService/TermsOfService";
import PrivacyPolicy from "../components/pages/PrivacyPolicy/PrivacyPolicy";
import CopyrightPolicy from "../components/pages/CopyrightPolicy/CopyrightPolicy";
import Contact from "../components/pages/Contact/Contact";
import HelpCenter from "../components/pages/HelpCenter/HelpCenter";
import About from "../components/pages/About/About";
import Homepage from "../components/pages/Homepage/Homepage";
import Shoppage from "../components/pages/Shoppage/Shoppage";
import Auctionpage from "../components/pages/Auctionpage/Auctionpage";
import AuctionRoom from "../components/pages/AuctionRoom/AuctionRoom";
import BoxDetailpage from "../components/pages/BoxDetailpage/BoxDetailpage";
import CollectionDetailPage from "../components/pages/CollectionDetailPage/CollectionDetailPage";
import ProductDetailpage from "../components/pages/ProductDetailpage/ProductDetailpage";
import Settingpage from "../components/pages/Settingpage/Settingpage";
import Notificationpage from "../components/pages/Notificationpage/Notificationpage";
import Activitypage from "../components/pages/Activitypage/Activitypage";
import Profilepage from "../components/pages/Profilepage/Profilepage";
import Cartpage from "../components/pages/Cartpage/Cartpage";
import Exchangepage from "../components/pages/Exchangepage/Exchangepage";
import Paymentpage from "../components/pages/Paymentpage/Paymentpage";
import SuccessPayment from "../components/pages/SuccessPage/SuccessPage";
import FailurePage from "../components/pages/FailurePage/FailurePage";
// import Checkoutpage from "../components/pages/Checkoutpage/Checkoutpage";
import Achievementpage from "../components/pages/Achievementpage/Achievementpage";
import ChatRoom from "../components/pages/ChatRoom/ChatRoom";
import UserSaleReport from "../components/pages/UserSaleReport/UserSaleReport";

import ModeratorDashboard from "../components/moderatorPages/ModeratorDashboard/ModeratorDashboard";
import ModProfile from "../components/moderatorPages/ModProfile/ModProfile";
import ModReport from "../components/moderatorPages/ModReport/ModReport";
import ModProduct from "../components/moderatorPages/ModProduct/ModProduct";
import ModMysteryBox from "../components/moderatorPages/ModMysteryBox/ModMysteryBox";
import ModAuction from "../components/moderatorPages/ModAuction/ModAuction";
import ModWithdrawRequest from "../components/moderatorPages/ModWithdrawRequest/ModWithdrawRequest";
import ModCollection from "../components/moderatorPages/ModCollection/ModCollection";

import AdminDashboard from "../components/adminPages/AdminDashboard/AdminDashboard";
import AdUserManagement from "../components/adminPages/AdUserManagement/AdUserManagement";
import AdProductManagement from "../components/adminPages/AdProductManagement/AdProductManagement";
import AdAuctionManagement from "../components/adminPages/AdAuctionManagement/AdAuctionManagement";
import AdRevenueReport from "../components/adminPages/AdRevenueReport/AdRevenueReport";
import AdReportManagement from "../components/adminPages/AdReportManagement/AdReportManagement";


export const logisterRoutes = [
    { path: PATH_NAME.REGISTER, element: <Registerpage /> },
    { path: PATH_NAME.LOGIN, element: <Loginpage /> },
    { path: PATH_NAME.NOTFOUND, element: <NotFoundpage /> },
];

export const publicRoutes = [
    { path: PATH_NAME.TERM_OF_SERVICE, element: <TermsOfService /> },
    { path: PATH_NAME.PRIVACY_POLICY, element: <PrivacyPolicy /> },
    { path: PATH_NAME.COPYRIGHT_POLICY, element: <CopyrightPolicy /> },
    { path: PATH_NAME.CONTACT, element: <Contact /> },
    { path: PATH_NAME.HELPCENTER, element: <HelpCenter /> },
    { path: PATH_NAME.ABOUT, element: <About /> },
    { path: PATH_NAME.HOMEPAGE, element: <Homepage /> },
    { path: PATH_NAME.SHOP_PAGE, element: <Shoppage /> },
    { path: PATH_NAME.AUNCTION_PAGE, element: <Auctionpage /> },
    { path: PATH_NAME.BOXDETAIL_PAGE, element: <BoxDetailpage /> },
    { path: PATH_NAME.COLLECTIONDETAIL_PAGE, element: <CollectionDetailPage /> },
    { path: PATH_NAME.PRODUCTDETAIL_PAGE, element: <ProductDetailpage /> },
];

export const privateRoutes = [
    // { path: PATH_NAME.HOME, element: <Home />, roles: ['free', 'learner', 'proUser'] },
    { path: PATH_NAME.AUNCTION_ROOM, element: <AuctionRoom />, role: ['user'] },
    { path: PATH_NAME.SETTING_PAGE, element: <Settingpage />, role: ['user'] },
    { path: PATH_NAME.CART_PAGE, element: <Cartpage />, role: ['user'] },
    { path: PATH_NAME.PROFILE, element: <Profilepage />, role: ['user'] },
    { path: PATH_NAME.PAYMENT_PAGE, element: <Paymentpage />, role: ['user'] },
    { path: PATH_NAME.FAILURE_PAYMENT, element: <FailurePage />, role: ['user'] },
    { path: PATH_NAME.SUCCESS_PAYMENT, element: <SuccessPayment />, role: ['user'] },
    // { path: PATH_NAME.CHECKOUT_PAGE, element: <Checkoutpage />, role: ['user'] },
    { path: PATH_NAME.ACHIEVEMENT_PAGE, element: <Achievementpage />, role: ['user'] },
    { path: PATH_NAME.ACTIVITIES_PAGE, element: <Activitypage />, role: ['user'] },
    { path: PATH_NAME.NOTIFICATION_PAGE, element: <Notificationpage />, role: ['user'] },
    { path: PATH_NAME.EXCHANGE_PAGE, element: <Exchangepage />, role: ['user'] },
    { path: PATH_NAME.CHAT_ROOM, element: <ChatRoom />, role: ['user'] },
    { path: PATH_NAME.USER_SALE_REPORT, element: <UserSaleReport />, role: ['user'] },
];

export const moderatorRoutes = [
    {path: PATH_NAME.MODERATOR_DASHBOARD, element: <ModeratorDashboard /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_PROFILE, element: <ModProfile /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_REPORT, element: <ModReport /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_PRODUCT, element: <ModProduct /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_MYSTERYBOX, element: <ModMysteryBox /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_AUCTION, element: <ModAuction /> , role: ['mod'] },
    {path: PATH_NAME.MODERATOR_COLLECTION, element: <ModCollection /> ,role: ['mod'] },
    {path: PATH_NAME.MODERATOR_WITHDRAW_REQUEST, element: <ModWithdrawRequest /> ,role: ['mod'] },

];

export const adminRoutes = [
    { path: PATH_NAME.ADMIN_DASHBOARD, element: <AdminDashboard />, role: ['admin'] },
    { path: PATH_NAME.ADMIN_USERS, element: <AdUserManagement />, role: ['admin'] },
    { path: PATH_NAME.ADMIN_PRODUCT, element: <AdProductManagement />, role: ['admin'] },
    { path: PATH_NAME.ADMIN_AUCTION, element: <AdAuctionManagement />, role: ['admin'] },
    { path: PATH_NAME.ADMIN_REVENUE, element: <AdRevenueReport />, role: ['admin'] },
    { path: PATH_NAME.ADMIN_REPORT, element: <AdReportManagement />, role: ['admin'] },
];

