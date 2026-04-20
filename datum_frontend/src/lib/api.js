import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    saveTokens,
} from "../utils/auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refresh = getRefreshToken();

            if (!refresh) {
                clearTokens();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh,
                });

                const newAccess = response.data.access;

                saveTokens({ access: newAccess, refresh });
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                return api(originalRequest);
            } catch (refreshError) {
                clearTokens();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;