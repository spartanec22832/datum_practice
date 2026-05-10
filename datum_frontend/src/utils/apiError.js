import axios from "axios";

const NETWORK_ERROR_MESSAGE =
    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043e\u043c. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435, \u0447\u0442\u043e \u0431\u044d\u043a\u0435\u043d\u0434 \u0437\u0430\u043f\u0443\u0449\u0435\u043d \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d.";

const FIELD_LABELS = {
    caption: "\u041f\u043e\u0434\u043f\u0438\u0441\u044c",
    content: "\u0421\u043e\u0434\u0435\u0440\u0436\u0438\u043c\u043e\u0435",
    description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    file: "\u0424\u0430\u0439\u043b",
    full_description: "\u041f\u043e\u043b\u043d\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    geojson: "GeoJSON",
    is_published: "\u041f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f",
    main_image: "\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
    media_type: "\u0422\u0438\u043f \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u044f",
    parent: "\u0420\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u0441\u043a\u0438\u0439 \u0440\u0430\u0437\u0434\u0435\u043b",
    password: "\u041f\u0430\u0440\u043e\u043b\u044c",
    section: "\u0420\u0430\u0437\u0434\u0435\u043b",
    short_description: "\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    sort_order: "\u041f\u043e\u0440\u044f\u0434\u043e\u043a",
    summary: "\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    title: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
    username: "\u041b\u043e\u0433\u0438\u043d",
};

const MESSAGE_TRANSLATIONS = new Map([
    [
        "Authentication credentials were not provided.",
        "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f.",
    ],
    [
        "Authentication required.",
        "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f.",
    ],
    [
        "Cannot publish a card inside an unpublished section.",
        "\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443 \u0432 \u043d\u0435\u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043d\u043e\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u0435.",
    ],
    [
        "Cannot publish a section inside an unpublished parent section.",
        "\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b \u0432\u043d\u0443\u0442\u0440\u0438 \u043d\u0435\u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043d\u043e\u0433\u043e \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u0441\u043a\u043e\u0433\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u0430.",
    ],
    [
        "Enter a valid email address.",
        "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 email.",
    ],
    [
        "GeoJSON must be an object.",
        "GeoJSON \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c JSON-\u043e\u0431\u044a\u0435\u043a\u0442\u043e\u043c.",
    ],
    [
        "GeoJSON type must be one of Feature, FeatureCollection, Point, Polygon, or MultiPolygon.",
        "\u0422\u0438\u043f GeoJSON \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043e\u0434\u043d\u0438\u043c \u0438\u0437: Feature, FeatureCollection, Point, Polygon \u0438\u043b\u0438 MultiPolygon.",
    ],
    [
        "No active account found with the given credentials",
        "\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u043b\u043e\u0433\u0438\u043d \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u044c.",
    ],
    [
        "Not found.",
        "\u041e\u0431\u044a\u0435\u043a\u0442 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.",
    ],
    [
        "Only admin can manage system sections.",
        "\u0422\u043e\u043b\u044c\u043a\u043e \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440 \u043c\u043e\u0436\u0435\u0442 \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c \u0441\u0438\u0441\u0442\u0435\u043c\u043d\u044b\u043c\u0438 \u0440\u0430\u0437\u0434\u0435\u043b\u0430\u043c\u0438.",
    ],
    [
        "Section cannot be its own parent.",
        "\u0420\u0430\u0437\u0434\u0435\u043b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u0435\u043c \u0441\u0430\u043c \u0434\u043b\u044f \u0441\u0435\u0431\u044f.",
    ],
    [
        "This field is required.",
        "\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u043f\u043e\u043b\u0435.",
    ],
    [
        "This field may not be blank.",
        "\u041f\u043e\u043b\u0435 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c.",
    ],
    [
        "This field may not be null.",
        "\u041f\u043e\u043b\u0435 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c.",
    ],
    [
        "You cannot add media to this card.",
        "\u0423 \u0432\u0430\u0441 \u043d\u0435\u0442 \u043f\u0440\u0430\u0432 \u0434\u043b\u044f \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u0439 \u043a \u044d\u0442\u043e\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435.",
    ],
    [
        "You do not have permission to perform this action.",
        "\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u043f\u0440\u0430\u0432 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f.",
    ],
]);

function translateServerMessage(rawMessage) {
    const message = String(rawMessage ?? "").trim();

    if (!message) {
        return "";
    }

    if (
        message.includes("ValidationError") &&
        message.includes("\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430")
    ) {
        const extensionMatch = message.match(
            /\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430:\s*([^'"}<\s]+)/
        );
        const suffix = extensionMatch?.[1] || "\u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u044b\u0439 \u0442\u0438\u043f";
        return `\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430: ${suffix}.`;
    }

    if (message.startsWith("Unsupported file type:")) {
        const extension = message.slice("Unsupported file type:".length).trim();
        const suffix = extension || "\u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u044b\u0439 \u0442\u0438\u043f";
        return `\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430: ${suffix}.`;
    }

    return MESSAGE_TRANSLATIONS.get(message) ?? message;
}

function humanizeFieldName(rawKey) {
    const key = String(rawKey ?? "").replace(/\[\d+\]/g, "");

    if (FIELD_LABELS[key]) {
        return FIELD_LABELS[key];
    }

    return key
        .split("_")
        .filter(Boolean)
        .map((part, index) =>
            index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
        )
        .join(" ");
}

function buildFieldPrefix(path) {
    const parts = String(path ?? "")
        .split(".")
        .filter(Boolean);
    const lastPart = parts[parts.length - 1];

    if (!lastPart || lastPart === "detail" || lastPart === "non_field_errors") {
        return "";
    }

    return `${humanizeFieldName(lastPart)}: `;
}

function collectMessages(value, path = "") {
    if (value == null) {
        return [];
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        const message = translateServerMessage(value);

        if (!message) {
            return [];
        }

        return [`${buildFieldPrefix(path)}${message}`];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => collectMessages(item, path));
    }

    if (typeof value === "object") {
        return Object.entries(value).flatMap(([key, item]) => {
            const nextPath =
                key === "detail" || key === "non_field_errors"
                    ? path
                    : path
                        ? `${path}.${key}`
                        : key;

            return collectMessages(item, nextPath);
        });
    }

    return [];
}

function getStatusMessage(status) {
    switch (status) {
        case 400:
            return "\u0412 \u0437\u0430\u043f\u0440\u043e\u0441\u0435 \u0435\u0441\u0442\u044c \u043e\u0448\u0438\u0431\u043a\u0438. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0432\u0432\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435.";
        case 401:
            return "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f.";
        case 403:
            return "\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u043f\u0440\u0430\u0432 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f.";
        case 404:
            return "\u041e\u0431\u044a\u0435\u043a\u0442 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.";
        case 413:
            return "\u0424\u0430\u0439\u043b \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u0434\u043b\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438.";
        case 415:
            return "\u0421\u0435\u0440\u0432\u0435\u0440 \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0442\u0430\u043a\u043e\u0439 \u0444\u043e\u0440\u043c\u0430\u0442 \u0434\u0430\u043d\u043d\u044b\u0445.";
        case 500:
            return "\u041d\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435 \u043f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.";
        default:
            return "";
    }
}

export function getApiErrorMessage(
    error,
    fallback = "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430."
) {
    return getApiErrorMessages(error, fallback).join("; ");
}

export function getApiErrorMessages(
    error,
    fallback = "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430."
) {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            const message = fallback
                ? `${fallback} ${NETWORK_ERROR_MESSAGE}`
                : NETWORK_ERROR_MESSAGE;

            return message ? [message] : [];
        }

        const messages = [
            ...new Set(
                collectMessages(error.response.data)
                    .map((message) => message.trim())
                    .filter(Boolean)
            ),
        ];

        if (messages.length > 0) {
            return messages;
        }

        const statusMessage = getStatusMessage(error.response.status);

        if (statusMessage) {
            return [statusMessage];
        }
    }

    if (error instanceof Error) {
        const message = translateServerMessage(error.message);

        if (message) {
            return [message];
        }
    }

    return fallback ? [fallback] : [];
}
