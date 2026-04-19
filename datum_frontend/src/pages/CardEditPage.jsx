import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    createCardMedia,
    deleteCardMedia,
    getCardBySlug,
    updateCard,
} from "../services/cards";
import { useAuth } from "../context/AuthContext";

function getMediaType(fileName) {
    const lowerName = fileName.toLowerCase();

    if (
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg") ||
        lowerName.endsWith(".png") ||
        lowerName.endsWith(".gif") ||
        lowerName.endsWith(".webp")
    ) {
        return "image";
    }

    if (
        lowerName.endsWith(".mp4") ||
        lowerName.endsWith(".mov") ||
        lowerName.endsWith(".avi") ||
        lowerName.endsWith(".mkv") ||
        lowerName.endsWith(".webm")
    ) {
        return "video";
    }

    if (
        lowerName.endsWith(".mp3") ||
        lowerName.endsWith(".wav") ||
        lowerName.endsWith(".ogg") ||
        lowerName.endsWith(".m4a")
    ) {
        return "audio";
    }

    return "document";
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
    const { isAdmin, isAuthLoading } = useAuth();

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
    const [successMessage, setSuccessMessage] = useState("");

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
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить карточку для редактирования.");
            } finally {
                setIsLoading(false);
            }
        }

        loadCard();
    }, [slug]);

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

        const startOrder = newAttachments.length;

        const items = files.map((file, index) => ({
            file,
            caption: "",
            sort_order: startOrder + index,
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
                        [field]: field === "sort_order" ? Number(value) || 0 : value,
                    }
                    : item
            )
        );
    }

    function handleRemoveNewAttachment(index) {
        setNewAttachments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
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
        } catch (err) {
            console.error(err);
            setError("Не удалось удалить вложение карточки.");
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
                payload.append("is_published", formData.is_published);

                if (formData.main_image) {
                    payload.append("main_image", formData.main_image);
                }

                updatedCard = await updateCard(card.id, payload, true);
            }

            for (const item of newAttachments) {
                const mediaPayload = new FormData();
                mediaPayload.append("file", item.file);
                mediaPayload.append("caption", item.caption);
                mediaPayload.append("sort_order", item.sort_order);
                mediaPayload.append("media_type", getMediaType(item.file.name));

                await createCardMedia(updatedCard.id, mediaPayload);
            }

            const freshCard = await getCardBySlug(updatedCard.slug);

            setCard(freshCard);
            setFormData((prev) => ({
                ...prev,
                main_image: null,
            }));
            setNewAttachments([]);
            setSuccessMessage("Карточка успешно обновлена.");

            setTimeout(() => {
                navigate(`/cards/${freshCard.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить изменения карточки.");
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
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Загрузка...
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                У вас нет прав для редактирования карточек.
            </div>
        );
    }

    if (!card) {
        return (
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Карточка не найдена.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/sections" className="transition hover:text-slate-700">
                    Справочник
                </Link>

                {sectionSlug && (
                    <>
                        <span>/</span>
                        <Link
                            to={`/sections/${sectionSlug}`}
                            className="transition hover:text-slate-700"
                        >
                            {sectionTitle}
                        </Link>
                    </>
                )}

                <span>/</span>
                <Link
                    to={`/cards/${card.slug}`}
                    className="transition hover:text-slate-700"
                >
                    {card.title}
                </Link>
                <span>/</span>
                <span className="text-slate-500">Редактирование</span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Редактирование карточки
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600">
                    Здесь администратор может изменить содержимое карточки и управлять её вложениями.
                </p>
            </section>

            {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-8 rounded-[32px] bg-white p-8 shadow-sm"
            >
                <section className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Название карточки
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="summary"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Краткое описание
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Содержимое карточки
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={10}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="main_image"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Главное изображение карточки
                        </label>

                        <input
                            id="main_image"
                            name="main_image"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                        />

                        {card?.main_image && (
                            <p className="text-sm text-slate-500">
                                Текущее изображение уже загружено. Можно выбрать новый файл для замены.
                            </p>
                        )}
                    </div>

                    {currentImageUrl && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <img
                                src={currentImageUrl}
                                alt={card.title}
                                className="h-56 w-full object-cover"
                            />
                        </div>
                    )}

                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-slate-700">Опубликована</span>
                    </label>
                </section>

                <section className="space-y-5">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Текущие вложения</h2>
                        <p className="text-sm text-slate-500">
                            Здесь можно удалить уже прикреплённые файлы.
                        </p>
                    </div>

                    {existingMediaItems.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                            У карточки пока нет вложений.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {existingMediaItems.map((item) => {
                                const rawFilePath = item.file || item.file_path;
                                const fileUrl = getFileUrl(rawFilePath);
                                const fileName = getFileName(rawFilePath);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <p className="break-all text-sm font-medium text-slate-900">
                                                {fileName}
                                            </p>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                {item.media_type}
                                            </p>
                                            {item.caption && (
                                                <p className="text-sm text-slate-600">{item.caption}</p>
                                            )}
                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
                                                >
                                                    Открыть файл
                                                </a>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingAttachment(item.id)}
                                            className="inline-flex rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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
                        <h2 className="text-2xl font-bold text-slate-900">Новые вложения</h2>
                        <p className="text-sm text-slate-500">
                            Здесь можно добавить новые файлы к карточке.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="attachments"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Добавить файлы
                        </label>

                        <input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={handleNewAttachmentsChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                        />

                        <p className="text-sm text-slate-500">
                            Можно прикреплять изображения, видео, аудио и документы.
                        </p>
                    </div>

                    {newAttachments.length > 0 && (
                        <div className="space-y-4">
                            {newAttachments.map((item, index) => (
                                <div
                                    key={`${item.file.name}-${index}`}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-slate-900">
                                            {item.file.name}
                                        </p>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700">
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
                                                className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none transition focus:border-slate-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Порядок
                                            </label>
                                            <input
                                                type="number"
                                                value={item.sort_order}
                                                onChange={(event) =>
                                                    handleNewAttachmentFieldChange(
                                                        index,
                                                        "sort_order",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none transition focus:border-slate-500"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewAttachment(index)}
                                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить"}
                    </button>

                    <Link
                        to={`/cards/${card.slug}`}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}