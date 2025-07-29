import axios from 'axios';
import { api, pythonApiWithFallback } from '../config/axios';

//get user info from token to render on the navbar
export const fetchUserInfo = (token) =>
  axios.get('https://mmb-be-dotnet.onrender.com/api/Auth/who-am-i', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);

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

// login api using for user to login
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
  // Map userName to username for API
  const apiPayload = {
    username: userName,
    email,
    password,
  };
  return await api.post('/api/user/auth/register', apiPayload);
};

//input the email to recive the verify email
export const sendVerifyEmailApi = async (email) => {
  return await api.post(`/api/user/email/verify?email=${encodeURIComponent(email)}`, {});
};

// recive the otp to confirm the verify email
export const confirmOtpApi = async (code, email) => {
  return await api.post(`/api/user/email/confirm?code=${encodeURIComponent(code)}&current_email=${encodeURIComponent(email)}`, {});
};

//api using for forgotpassword when user forgot their password
export const sendForgotPasswordOtpApi = async (email) => {
  return await api.post(`/api/user/password-recovery/verify?email=${encodeURIComponent(email)}`, {});
};

//api using for they confirm forgot password 
export const confirmForgotPasswordApi = async ({ email, code, password }) => {
  return await api.post('/api/user/password-recovery/confirm', {
    email,
    code,
    password,
  }, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
};
