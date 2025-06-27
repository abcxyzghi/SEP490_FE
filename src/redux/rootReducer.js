import { combineReducers } from "@reduxjs/toolkit";
import  userReducer  from "./features/userSlice";
import  cartReducer  from "./features/cartSlice";
import authReducer from './features/authSlice';

const rootReducer = combineReducers({    
        user: userReducer,
        cart: cartReducer,
        auth: authReducer
})

export default rootReducer;