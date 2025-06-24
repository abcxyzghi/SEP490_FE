export const PATH_NAME = {
    REGISTER: "/register",
    LOGIN: "/login",
    NOTFOUND: "*",
    HOMEPAGE: "/",
    SHOP_PAGE: "/shoppage",
    AUNCTION_PAGE: "/auctionpage",
    AUNCTION_ROOM: "/auctionroom/:id",
    BOXDETAIL_PAGE: "/boxdetailpage/:id",
    PRODUCTDETAIL_PAGE: "/productdetailpage/:id",
    COLLECTIONDETAIL_PAGE: "/collectiondetailpage/:id",
    SETTING_PAGE: "/settingpage",
    PROFILE: "/profilepage/:id",    
    ADMIN_DASHBOARD: "/adminDashboard",
    ADMIN_USERMANGEMENT: "/adminUserManagement",
    ADMIN_SUBSCRIPTION: "/adminSubcription",
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