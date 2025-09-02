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
  const incomingItems = action.payload;

  incomingItems.forEach((incomingItem) => {
    const existingIndex = state.items.findIndex(
      (item) => item.id === incomingItem.id && item.type === incomingItem.type
    );

    if (existingIndex !== -1) {
      // Ghi đè toàn bộ dữ liệu bằng dữ liệu mới nhất
      state.items[existingIndex] = { ...state.items[existingIndex], ...incomingItem };
    } else {
      state.items.push(incomingItem);
    }
  });
},
  clearCart: (state, action) => {
  const typeToClear = action.payload?.type;

  if (typeToClear) {
    // Chỉ xóa những item có type tương ứng
    state.items = state.items.filter(item => item.type !== typeToClear);
  } else {
    // Nếu không truyền type thì xóa hết
    state.items = [];
  }
},
    removeItemFromCart: (state, action) => {
  state.items = state.items.filter(
    (item) => !(item.id === action.payload.id && item.type === action.payload.type)
  );
},
updateQuantity: (state, action) => {
    const { id, type, quantity } = action.payload;
    const item = state.items.find(
      (item) => item.id === id && item.type === type
    );
    if (item) {
      item.quantity = quantity;
    }
  },
    // other reducers...
  },
});

export const { addItemToCart, setCartFromServer, clearCart ,removeItemFromCart,updateQuantity} = cartSlice.actions;
export default cartSlice.reducer;
