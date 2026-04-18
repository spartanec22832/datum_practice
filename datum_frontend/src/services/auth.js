import api from "../lib/api";

export async function loginUser(credentials) {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
}

export async function refreshToken(refresh) {
    const response = await api.post("/auth/refresh/", { refresh });
    return response.data;
}

export async function getMe() {
    const response = await api.get("/auth/me/");
    return response.data;
}