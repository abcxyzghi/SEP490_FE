import axios from "axios";

// Tạo instance Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY || 'default_base_url',
});

// Gắn accessToken vào header của mỗi request
api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Xử lý response interceptor
api.interceptors.response.use(
  function (response) {
    // Nếu muốn xử lý riêng với status 201 (Created)
    if (response.status === 201) {
      console.log("Tạo mới thành công:", response.data);
    }
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Nếu token hết hạn → gọi refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        // Pass refreshToken as a query parameter, not in the body
        const res = await api.post(`/api/user/auth/refresh?token=${refreshToken}`);
        // Use access_token from response
        const newAccessToken = res.data.access_token;
        localStorage.setItem("token", newAccessToken);
        // Optionally update refresh_token if provided
        if (res.data.refresh_token) {
          localStorage.setItem("refreshToken", res.data.refresh_token);
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    // 403: Không đủ quyền
    if (error.response?.status === 403) {
      console.warn("Không có quyền truy cập vào tài nguyên này.");
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
