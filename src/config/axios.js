import axios from "axios";

// Tạo instance Axios
const api = axios.create({
  baseURL: 'http://14.225.198.143:8080/api/',
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

        const res = await axios.post('http://14.225.198.143:8080/api/auth/refresh', {
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("token", newAccessToken);

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
