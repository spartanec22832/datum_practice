import api from "../lib/api";

export async function getCardBySlug(slug) {
    const response = await api.get(`/cards/${slug}/`);
    return response.data;
}