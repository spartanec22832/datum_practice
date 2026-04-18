import api from "../lib/api";

export async function getProjects() {
    const response = await api.get("/projects/");
    return response.data;
}

export async function getProjectBySlug(slug) {
    const response = await api.get(`/projects/${slug}/`);
    return response.data;
}

export async function updateProject(id, payload, isFormData = false) {
    const config = isFormData
        ? {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        : {};

    const response = await api.patch(`/projects/${id}/`, payload, config);
    return response.data;
}

export async function deleteProject(id) {
    const response = await api.delete(`/projects/${id}/`);
    return response.data;
}