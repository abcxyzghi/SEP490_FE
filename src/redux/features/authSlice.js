import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    updateProfileImage: (state, action) => {
      if (state.user) {
        state.user.profile_image = action.payload;
      }
    },
  },
});

export const { setUser, setToken, logout,updateProfileImage } = authSlice.actions;
export default authSlice.reducer;
