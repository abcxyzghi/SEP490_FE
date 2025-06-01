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
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // Gọi API refresh để lấy accessToken mới
        const res = await axios.post('http://14.225.198.143:8080/api/auth/refresh', {
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        // Lưu token mới vào localStorage
        localStorage.setItem("token", newAccessToken);

        // Gắn token mới vào header của request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Gửi lại request gốc
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> xóa token và xử lý logout nếu cần
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
