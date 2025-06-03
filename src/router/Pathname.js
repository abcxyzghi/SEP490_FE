export const PATH_NAME = {
    REGISTER: "/signup",
    LOGIN: "/signin",
    NOTFOUND: "/404page",
    HOMEPAGE: "/",
    SHOP_PAGE: "/shoppage",
    AUNCTION_PAGE: "/auctionpage",
    AUNCTION_ROOM: "/auctionroom/:id",
    BOXDETAIL_PAGE: "/boxdetailpage",
    PRODUCTDETAIL_PAGE: "/productdetailpage",
    SETTING_PAGE: "/settingpage",
    PROFILE: "/profilepage/:id",
    
    ADMIN_DASHBOARD: "/adminDashboard",
    ADMIN_USERMANGEMENT: "/adminUserManagement",
    ADMIN_SUBSCRIPTION: "/adminSubcription",
};

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