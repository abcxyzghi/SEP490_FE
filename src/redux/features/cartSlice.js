import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
   addItemToCart: (state, action) => {
  if (!Array.isArray(state.items)) {
    state.items = [];
  }

  const existing = state.items.find(i => i.id === action.payload.id && i.type === action.payload.type);

  if (existing) {
    existing.quantity += action.payload.quantity || 1;
  } else {
    state.items.push(action.payload);
  }
},
    setCartFromServer: (state, action) => {
      state.items = action.payload;
    },
     clearCart: (state) => {
      state.items = [];
    },
    removeItemFromCart: (state, action) => {
  state.items = state.items.filter(
    (item) => !(item.id === action.payload.id && item.type === action.payload.type)
  );
},
    // other reducers...
  },
});

export const { addItemToCart, setCartFromServer, clearCart ,removeItemFromCart} = cartSlice.actions;
export default cartSlice.reducer;
