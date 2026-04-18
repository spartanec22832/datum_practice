import api from "../lib/api";

export async function getSections() {
    const response = await api.get("/sections/");
    return response.data;
}

export async function getSectionBySlug(slug) {
    const response = await api.get(`/sections/${slug}/`);
    return response.data;
}

export async function getSectionContent(slug) {
    const response = await api.get(`/sections/${slug}/content/`);
    return response.data;
}

export async function createSection(payload) {
    const response = await api.post("/sections/", payload);
    return response.data;
}

export async function updateSection(id, payload) {
    const response = await api.patch(`/sections/${id}/`, payload);
    return response.data;
}

export async function deleteSection(id) {
    const response = await api.delete(`/sections/${id}/`);
    return response.data;
}