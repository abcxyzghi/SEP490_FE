export const PATH_NAME = {
    REGISTER: "/register",
    LOGIN: "/login",
    NOTFOUND: "*",
    TERM_OF_SERVICE: "/termsofservice",
    PRIVACY_POLICY: "/privacy",
    COPYRIGHT_POLICY: "/copyright",
    CONTACT: "/contact",
    HELPCENTER: "/helpcenter",
    ABOUT: "/about",
    HOMEPAGE: "/",
    SHOP_PAGE: "/shoppage",
    AUNCTION_PAGE: "/auctionpage",
    AUNCTION_ROOM: "/auctionroom/:id",
    BOXDETAIL_PAGE: "/boxdetailpage/:id",
    PRODUCTDETAIL_PAGE: "/productdetailpage/:id",
    COLLECTIONDETAIL_PAGE: "/collectiondetailpage/:id",
    SETTING_PAGE: "/settingpage",
    PROFILE: "/profilepage/:id",    
    CART_PAGE: "/cartpage",
    PAYMENT_PAGE: "/paymentpage",
    // CHECKOUT_PAGE: "/checkoutpage",
    CHAT_ROOM: "/chatroom/*",
    ACHIEVEMENT_PAGE: "/achievementpage",
    NOTIFICATION_PAGE: "/notifications",
    ACTIVITIES_PAGE: "/activities",
    EXCHANGE_PAGE: "/exchangepage/:sellProductId",
    USER_SALE_REPORT:"/usersalereport",
    SUCCESS_PAYMENT:"/success-payment",
    FAILURE_PAYMENT:"/failure-payment",
    WITH_DRAW:"/withdraw",

    MODERATOR_DASHBOARD: "/moderatorDashboard",
    MODERATOR_PROFILE: "/moderatorProfile",
    MODERATOR_REPORT: "/moderatorReport",
    MODERATOR_PRODUCT: "/moderatorProduct",
    MODERATOR_MYSTERYBOX: "/moderatorMysteryBox",
    MODERATOR_AUCTION: "/moderatorAuction",
    MODERATOR_COLLECTION: "/moderatorCollection",
    
    ADMIN_DASHBOARD: "/adminDashboard",
    ADMIN_USERS: "/adminUsers",
    ADMIN_PRODUCT: "/adminProduct",
    ADMIN_AUCTION: "/adminAuction",
    ADMIN_REVENUE: "/adminRevenue",
    ADMIN_REPORT: "/adminReport",
    // ADMIN_SYSTEM: "/adminSystem",
    // ADMIN_CATEGORY: "/adminCategories",
    // ADMIN_ANALYTIC: "/adminAnalytics",
    // ADMIN_TRANSACTION: "/adminTransaction",
};
// domain sau dấu "/" nếu id là 123 thì nó là /123
// "productdetailpage" chứa sản phẩm của ng bán; "collectiondetailpage" chứa sản phẩm dạng view


/**
 * Utility function to retrieve a route path by name.
 * @param {string} routeKey - The key representing the route.
 * @returns {string|null} - The route path if found, otherwise null.
 */
export const Pathname = (routeKey) => {
    if (PATH_NAME.hasOwnProperty(routeKey)) {
        return PATH_NAME[routeKey];
    }
    console.warn(`Pathname: Route key "${routeKey}" does not exist.`);
    return null; // Fallback for invalid keys
};