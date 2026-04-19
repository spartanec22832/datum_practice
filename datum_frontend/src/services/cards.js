import api from "../lib/api";

export async function getCardBySlug(slug) {
    const response = await api.get(`/cards/${slug}/`);
    return response.data;
}

export async function createCard(payload, isFormData = false) {
    const config = isFormData
        ? {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        : {};

    const response = await api.post("/cards/", payload, config);
    return response.data;
}

export async function createCardMedia(cardId, payload) {
    const response = await api.post(`/cards/${cardId}/media/`, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}