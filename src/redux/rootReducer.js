import { combineReducers } from "@reduxjs/toolkit";

import  cartReducer  from "./features/cartSlice";
import authReducer from './features/authSlice';

const rootReducer = combineReducers({    
    
        cart: cartReducer,
        auth: authReducer
})

export default rootReducer;