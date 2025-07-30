import axios from 'axios';
import { pythonApiWithFallback, apiWithFallback } from '../config/axios';

//get user info from token to render on the navbar
export const fetchUserInfo = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Auth/who-am-i",
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("Fetch user info failed:", error);
    throw error;
  }
};


// export const loginApi = async (userName, password) => {
//   const params = new URLSearchParams();
//   params.append('grant_type', 'password');
//   params.append('username', userName);
//   params.append('password', password);

//   const response = await api.post('api/user/auth/login', params, {
//     headers: {
//       'accept': 'application/json',
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//   });
//   return response.data;
// };

//login api using for user to login
export const loginApi = async (userName, password) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', userName);
  params.append('password', password);

  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/user/auth/login",
      data: params,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

//register api help user login when they want to be an part of the system
export const registerApi = async ({ userName, email, password }) => {
  const apiPayload = {
    username: userName, // map lại đúng key theo backend
    email,
    password,
  };

  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/user/auth/register",
      data: apiPayload,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

//send verify email (đăng ký hoặc đổi email)
export const sendVerifyEmailApi = async (email) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/user/email/verify?email=${encodeURIComponent(email)}`,
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Send verify email failed:", error);
    throw error;
  }
};

//confirm OTP code from email
export const confirmOtpApi = async (code, email) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/user/email/confirm?code=${encodeURIComponent(code)}&current_email=${encodeURIComponent(email)}`,
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Confirm OTP failed:", error);
    throw error;
  }
};

//send OTP for forgot password
export const sendForgotPasswordOtpApi = async (email) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/user/password-recovery/verify?email=${encodeURIComponent(email)}`,
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Send forgot password OTP failed:", error);
    throw error;
  }
};


//api using for they confirm forgot password 
export const confirmForgotPasswordApi = async ({ email, code, password }) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/user/password-recovery/confirm",
      data: { email, code, password },
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Confirm forgot password failed:", error);
    throw error;
  }
};