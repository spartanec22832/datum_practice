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

export async function getCardMediaAllowedExtensions() {
    const response = await api.get("/media/allowed-extensions/");
    return response.data;
}

export async function updateCardMedia(mediaId, payload) {
    const response = await api.patch(`/media/${mediaId}/`, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export async function updateCard(id, payload, isFormData = false) {
    const config = isFormData
        ? {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        : {};

    const response = await api.patch(`/cards/id/${id}/`, payload, config);
    return response.data;
}

export async function deleteCard(id) {
    const response = await api.delete(`/cards/id/${id}/`);
    return response.data;
}

export async function deleteCardMedia(mediaId) {
    const response = await api.delete(`/media/${mediaId}/`);
    return response.data;
}
