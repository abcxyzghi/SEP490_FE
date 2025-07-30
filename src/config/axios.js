import axios from "axios";

// Lấy API URL từ biến môi trường
const CS_API = import.meta.env.VITE_API_CS_KEY;
const BACKUP_CS_API = import.meta.env.VITE_BACKUP_CS_KEY;

const PY_API = import.meta.env.VITE_API_PY_KEY;
const BACKUP_PY_API = import.meta.env.VITE_BACKUP_PY_KEY;

// Tạo instance Axios cho từng API
const primaryAxios = axios.create({
  baseURL: CS_API,
  timeout: 5000,
});

const backupAxios = axios.create({
  baseURL: BACKUP_CS_API,
  timeout: 5000,
});

const pythonAxios = axios.create({
  baseURL: PY_API,
  timeout: 5000,
});

const backupPythonAxios = axios.create({
  baseURL: BACKUP_PY_API,
  timeout: 5000,
});

// Gắn token cho tất cả instance
// const attachToken = (instance) => {
//   instance.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );
// };

// [primaryAxios, backupAxios, pythonAxios, backupPythonAxios].forEach(attachToken);

attachInterceptorsTo(primaryAxios);
attachInterceptorsTo(backupAxios);
attachInterceptorsTo(pythonAxios);
attachInterceptorsTo(backupPythonAxios);

// 🔁 Interceptor xử lý refresh token cho .NET (C#)
// primaryAxios.interceptors.response.use(
//   (response) => {
//     if (response.status === 201) {
//       console.log("Tạo mới thành công:", response.data);
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         const res = await pythonAxios.post(`/api/user/auth/refresh?token=${refreshToken}`);
//         const newAccessToken = res.data.access_token;
//         localStorage.setItem("token", newAccessToken);
//         if (res.data.refresh_token) {
//           localStorage.setItem("refreshToken", res.data.refresh_token);
//         }
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return primaryAxios(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     if (error.response?.status === 403) {
//       console.warn("Không có quyền truy cập vào tài nguyên này.");
//     }

//     return Promise.reject(error);
//   }
// );

function attachInterceptorsTo(instance) {

  instance.interceptors.request.use(
    (config) => {
      // Nếu config.requiresAuth === true thì tự động gắn token
      if (config.requiresAuth) {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(`[Auth] Token missing — skipping Authorization header for: ${config.url}`);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => {
      if (response.status === 201) {
        console.log("Tạo mới thành công:", response.data);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          // const res = await pythonAxios.post(`/api/user/auth/refresh?token=${refreshToken}`);

          const res = await pythonApiWithFallback({
            method: "post",
            url: `/api/user/auth/refresh?token=${refreshToken}`,
          });

          const newAccessToken = res.data.access_token;
          localStorage.setItem("token", newAccessToken);
          if (res.data.refresh_token) {
            localStorage.setItem("refreshToken", res.data.refresh_token);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        console.warn("Không có quyền truy cập vào tài nguyên này.");
      }

      return Promise.reject(error);
    }
  );
}


// Fallback API cho C# backend
const apiWithFallback = async (config) => {
  try {
    return await primaryAxios(config);
  } catch (err) {
    console.warn("[Fallback] C# API failed. Retrying with backup...");
    return await backupAxios(config);
  }
};

// Fallback API cho Python backend
const pythonApiWithFallback = async (config) => {
  try {
    return await pythonAxios(config);
  } catch (err) {
    console.warn("[Fallback] Python API failed. Retrying with backup...");
    return await backupPythonAxios(config);
  }
};

export const api = pythonAxios;
// Export các instance để dùng trực tiếp nếu cần
export default primaryAxios; // Dùng mặc định là C#
export {
  pythonAxios,
  backupAxios,
  backupPythonAxios,
  apiWithFallback,
  pythonApiWithFallback,
};