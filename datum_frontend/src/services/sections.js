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