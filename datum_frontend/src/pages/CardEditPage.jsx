import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    createCardMedia,
    deleteCardMedia,
    getCardMediaAllowedExtensions,
    getCardBySlug,
    updateCard,
    updateCardMedia,
} from "../services/cards";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessages } from "../utils/apiError";


function getFileExtension(fileName) {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function isSupportedAttachment(file, allowedExtensions) {
    if (!allowedExtensions) {
        return true;
    }

    return allowedExtensions.has(getFileExtension(file.name));
}

function getUnsupportedAttachmentMessage(files) {
    const names = files.map((file) => file.name).join(", ");
    return `\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430: ${names}.`;
}

function getAttachmentCaptions(mediaItems) {
    return Object.fromEntries(
        (mediaItems || []).map((item) => [item.id, item.caption || ""])
    );
}

function getFileUrl(filePath) {
    if (!filePath) {
        return null;
    }

    if (filePath.startsWith("http")) {
        return filePath;
    }

    return `${import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"}${filePath}`;
}

function getFileName(filePath) {
    if (!filePath) {
        return "Файл без названия";
    }

    try {
        const cleanPath = filePath.split("?")[0];
        return cleanPath.split("/").pop() || "Файл без названия";
    } catch {
        return "Файл без названия";
    }
}

export default function CardEditPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const {isAuthLoading, canManageKnowledgeItem } = useAuth();

    const [card, setCard] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        content: "",
        is_published: true,
        main_image: null,
    });

    const [newAttachments, setNewAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [attachmentError, setAttachmentError] = useState("");
    const [allowedAttachmentExtensions, setAllowedAttachmentExtensions] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [existingAttachmentCaptions, setExistingAttachmentCaptions] = useState({});


    useEffect(() => {
        async function loadCard() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getCardBySlug(slug);
                setCard(data);
                setFormData({
                    title: data.title || "",
                    summary: data.summary || "",
                    content: data.content || "",
                    is_published: Boolean(data.is_published),
                    main_image: null,
                });
                setExistingAttachmentCaptions(
                    getAttachmentCaptions(data.media_items)
                );
            } catch (err) {
                console.error(err);
                setError(
                    getApiErrorMessages(
                        err,
                        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443 \u0434\u043b\u044f \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadCard();
    }, [slug]);

    useEffect(() => {
        async function loadAllowedExtensions() {
            try {
                const data = await getCardMediaAllowedExtensions();
                const extensions = Array.isArray(data.extensions)
                    ? data.extensions
                    : [];

                setAllowedAttachmentExtensions(new Set(extensions));
            } catch (err) {
                console.error(err);
                setAllowedAttachmentExtensions(null);
            }
        }

        loadAllowedExtensions();
    }, []);

    function handleChange(event) {
        const { name, value, type, checked, files } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                        ? files[0] || null
                        : value,
        }));
    }

    function handleNewAttachmentsChange(event) {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            return;
        }

        const unsupportedFiles = files.filter(
            (file) => !isSupportedAttachment(file, allowedAttachmentExtensions)
        );
        const supportedFiles = files.filter((file) =>
            isSupportedAttachment(file, allowedAttachmentExtensions)
        );

        if (unsupportedFiles.length > 0) {
            setAttachmentError(getUnsupportedAttachmentMessage(unsupportedFiles));
        } else {
            setAttachmentError("");
        }

        if (supportedFiles.length === 0) {
            event.target.value = "";
            return;
        }

        const items = supportedFiles.map((file) => ({
            file,
            caption: "",
        }));

        setNewAttachments((prev) => [...prev, ...items]);
        event.target.value = "";
    }

    function handleNewAttachmentFieldChange(index, field, value) {
        setNewAttachments((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    }

    function handleRemoveNewAttachment(index) {
        setNewAttachments((prev) =>
            prev.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    function handleExistingAttachmentCaptionChange(mediaId, value) {
        setExistingAttachmentCaptions((prev) => ({
            ...prev,
            [mediaId]: value,
        }));
    }

    async function handleDeleteExistingAttachment(mediaId) {
        try {
            setError("");
            await deleteCardMedia(mediaId);

            setCard((prev) => {
                if (!prev) {
                    return prev;
                }

                return {
                    ...prev,
                    media_items: Array.isArray(prev.media_items)
                        ? prev.media_items.filter((item) => item.id !== mediaId)
                        : [],
                };
            });
            setExistingAttachmentCaptions((prev) => {
                const next = { ...prev };
                delete next[mediaId];
                return next;
            });
        } catch (err) {
            console.error(err);
            setError(
                getApiErrorMessages(
                    err,
                    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438."
                )
            );
        }
    }

    async function saveExistingAttachmentCaptions() {
        const mediaItems = Array.isArray(card?.media_items) ? card.media_items : [];

        for (const item of mediaItems) {
            const caption = existingAttachmentCaptions[item.id] || "";

            if (caption === (item.caption || "")) {
                continue;
            }

            const payload = new FormData();
            payload.append("caption", caption);

            await updateCardMedia(item.id, payload);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!card) {
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setAttachmentError("");
            setSuccessMessage("");

            let updatedCard = null;

            if (!formData.main_image) {
                const payload = {
                    title: formData.title,
                    summary: formData.summary,
                    content: formData.content,
                    is_published: formData.is_published,
                };

                updatedCard = await updateCard(card.id, payload, false);
            } else {
                const payload = new FormData();
                payload.append("title", formData.title);
                payload.append("summary", formData.summary);
                payload.append("content", formData.content);

                payload.append("is_published", String(formData.is_published));

                if (formData.main_image) {
                    payload.append("main_image", formData.main_image);
                }

                updatedCard = await updateCard(card.id, payload, true);
            }

            await saveExistingAttachmentCaptions();

            const existingAttachmentsCount = Array.isArray(card.media_items)
                ? card.media_items.length
                : 0;

            for (const [index, item] of newAttachments.entries()) {
                const mediaPayload = new FormData();
                mediaPayload.append("file", item.file);
                mediaPayload.append("caption", item.caption);
                mediaPayload.append("sort_order", existingAttachmentsCount + index);
                await createCardMedia(updatedCard.id, mediaPayload);
            }

            const freshCard = await getCardBySlug(updatedCard.slug);

            setCard(freshCard);
            setFormData((prev) => ({
                ...prev,
                main_image: null,
            }));
            setNewAttachments([]);
            setExistingAttachmentCaptions(
                getAttachmentCaptions(freshCard.media_items)
            );
            setSuccessMessage("Карточка успешно обновлена.");

            setTimeout(() => {
                navigate(`/cards/${freshCard.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            const messages = getApiErrorMessages(
                err,
                "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438."
            );
            const isAttachmentError = messages.some((message) =>
                message.includes("\u041d\u0435\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043c\u044b\u0439 \u0442\u0438\u043f \u0444\u0430\u0439\u043b\u0430")
            );

            if (isAttachmentError) {
                setAttachmentError(messages);
            } else {
                setError(messages);
            }
        } finally {
            setIsSaving(false);
        }
    }

    const currentImageUrl = useMemo(() => {
        if (!card?.main_image) {
            return null;
        }

        if (card.main_image.startsWith("http")) {
            return card.main_image;
        }

        return `${import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"}${card.main_image}`;
    }, [card]);

    const sectionSlug = card?.section_slug || card?.section?.slug || null;
    const sectionTitle = card?.section_title || card?.section?.title || "Раздел";

    const existingMediaItems = Array.isArray(card?.media_items)
        ? [...card.media_items].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
        : [];

    if (isAuthLoading || isLoading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Загрузка...
            </div>
        );
    }

    if (!canManageKnowledgeItem(card)) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                У вас нет прав для редактирования карточек.
            </div>
        );
    }

    if (!card) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Карточка не найдена.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link
                    to="/sections"
                    className="transition hover:text-slate-700 dark:text-slate-200"
                >
                    Справочник
                </Link>

                {sectionSlug && (
                    <>
                        <span>/</span>
                        <Link
                            to={`/sections/${sectionSlug}`}
                            className="transition hover:text-slate-700 dark:text-slate-200"
                        >
                            {sectionTitle}
                        </Link>
                    </>
                )}

                <span>/</span>
                <Link
                    to={`/cards/${card.slug}`}
                    className="transition hover:text-slate-700 dark:text-slate-200"
                >
                    {card.title}
                </Link>
                <span>/</span>
                <span className="text-slate-500 dark:text-slate-400">
                    Редактирование
                </span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Редактирование карточки
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Здесь можно изменить содержимое карточки и управлять её вложениями.
                </p>
            </section>

            <ErrorAlertStack error={error} />

            {successMessage && (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
            >
                <section className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Название карточки
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="summary"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Краткое описание
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Содержимое карточки
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={10}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="main_image"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Главное изображение карточки
                        </label>

                        <input
                            id="main_image"
                            name="main_image"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                        />

                        {card?.main_image && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Текущее изображение уже загружено. Можно выбрать новый
                                файл для замены.
                            </p>
                        )}
                    </div>

                    {currentImageUrl && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                            <img
                                src={currentImageUrl}
                                alt={card.title}
                                className="h-56 w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                Опубликована
                            </span>
                        </label>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Если снять галочку, карточка станет черновиком и будет видна только вам и администратору.
                        </p>
                    </div>
                </section>

                <section className="space-y-5">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            Текущие вложения
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Здесь можно удалить уже прикреплённые файлы.
                        </p>
                    </div>

                    {existingMediaItems.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300">
                            У карточки пока нет вложений.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {existingMediaItems.map((item) => {
                                const rawFilePath = item.file || item.file_path;
                                const fileUrl = getFileUrl(rawFilePath);
                                const fileName = item.original_filename || getFileName(rawFilePath);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-start md:justify-between"
                                    >
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="break-all text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {fileName}
                                            </p>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                {item.media_type}
                                            </p>
                                            <div className="space-y-2 pt-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    Описание вложения
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        existingAttachmentCaptions[item.id] ??
                                                        item.caption ??
                                                        ""
                                                    }
                                                    onChange={(event) =>
                                                        handleExistingAttachmentCaptionChange(
                                                            item.id,
                                                            event.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                                />
                                            </div>
                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                                                >
                                                    Открыть файл
                                                </a>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteExistingAttachment(item.id)
                                            }
                                            className="inline-flex rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                        >
                                            Удалить вложение
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="space-y-5">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            Новые вложения
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Здесь можно добавить новые файлы к карточке.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="attachments"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Добавить файлы
                        </label>

                        <input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={handleNewAttachmentsChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                        />

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Можно прикреплять изображения, видео, аудио и документы.
                        </p>
                    </div>

                    <ErrorAlertStack
                        error={attachmentError}
                        itemClassName="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                    />

                    {newAttachments.length > 0 && (
                        <div className="space-y-4">
                            {newAttachments.map((item, index) => (
                                <div
                                    key={`${item.file.name}-${index}`}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
                                >
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {item.file.name}
                                        </p>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Подпись
                                            </label>
                                            <input
                                                type="text"
                                                value={item.caption}
                                                onChange={(event) =>
                                                    handleNewAttachmentFieldChange(
                                                        index,
                                                        "caption",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewAttachment(index)}
                                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                        >
                                            Удалить из списка
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 disabled:opacity-70"
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить"}
                    </button>

                    <Link
                        to={`/cards/${card.slug}`}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}
