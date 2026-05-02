function normalizeMessages(error) {
    if (Array.isArray(error)) {
        return error.map((message) => String(message).trim()).filter(Boolean);
    }

    if (typeof error === "string") {
        const message = error.trim();
        return message ? [message] : [];
    }

    return [];
}

export default function ErrorAlertStack({
    error,
    className = "space-y-3",
    itemClassName = "rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
}) {
    const messages = normalizeMessages(error);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {messages.map((message, index) => (
                <div key={`${index}-${message}`} className={itemClassName}>
                    {message}
                </div>
            ))}
        </div>
    );
}
