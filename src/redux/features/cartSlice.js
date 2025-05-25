import { createSlice } from '@reduxjs/toolkit'

const initialState  = {
  cart:[],
  totalQuantity:0,
  totalPrice:0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
  //them product vao cart
  addToCart:(state,action) => {
  const product = action.payload;
  //check xem product da co trong cart chua
   const existingProduct = state.cart.find((item) => item.id === product.id);
  if(existingProduct){
  existingProduct.quantity += 1;
  }else{
    //neu chua ton tai thi them vao cart
    state.cart.push({...product,quantity:1})
  }
    state.totalQuantity += 1;
    state.totalPrice += product.price;
   },
   reducerCart:(state,action) =>{
   const product = action.payload;
   const existingProduct = state.cart.find((item) => item.id === product.id)
   //neu product chi con 1 sp thi xoa sp do
   if(existingProduct.quantity === 1){
     state.cart = state.cart.filter((item) => item.id !== product.id);
  } else{
    //neu con nhieu product thi tru 1 quantity
    existingProduct.quantity -= 1;
    
  }
    state.totalQuantity -= 1;
    state.totalPrice -= product.price;
  },

   

   removeFormCart:(state,action) => {
    const productId = action.payload;
    const productIndex = state.cart.findIndex((item) => item.id === productId);
    if(productIndex !== -1){
        const product = state.cart[productIndex];
        state.totalQuantity -= product.quantity;
        state.totalPrice -= product.price * product.quantity;
        state.cart.splice(productIndex,1);
    }
  },
  clearCart:(state) => {
    state.cart = [];
    state.totalQuantity = 0;
    state.totalPrice = 0;
  },
}
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFormCart,clearCart, reducerCart } = cartSlice.actions

export default cartSlice.reducer