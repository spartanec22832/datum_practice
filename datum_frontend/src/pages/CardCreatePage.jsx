import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCard, createCardMedia } from "../services/cards";
import { getSectionBySlug } from "../services/sections";
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

export default function CardCreatePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin, canCreateKnowledge, isAuthLoading } = useAuth();

    const [section, setSection] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        content: "",
        is_published: true,
        main_image: null,
    });

    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadSection() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getSectionBySlug(slug);
                setSection(data);
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить секцию для создания карточки.");
            } finally {
                setIsLoading(false);
            }
        }

        loadSection();
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

    function handleAttachmentsChange(event) {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            return;
        }

        const newItems = files.map((file, index) => ({
            file,
            caption: "",
            sort_order: attachments.length + index,
        }));

        setAttachments((prev) => [...prev, ...newItems]);
        event.target.value = "";
    }

    function handleAttachmentFieldChange(index, field, value) {
        setAttachments((prev) =>
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

    function handleRemoveAttachment(index) {
        setAttachments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!section) {
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            const cardPayload = new FormData();
            cardPayload.append("title", formData.title);
            cardPayload.append("summary", formData.summary);
            cardPayload.append("content", formData.content);
            cardPayload.append("is_published", isAdmin ? String(formData.is_published) : "true");
            cardPayload.append("section", section.id);

            if (formData.main_image) {
                cardPayload.append("main_image", formData.main_image);
            }

            const createdCard = await createCard(cardPayload, true);

            for (const item of attachments) {
                const mediaPayload = new FormData();
                mediaPayload.append("file", item.file);
                mediaPayload.append("caption", item.caption);
                mediaPayload.append("sort_order", item.sort_order);
                mediaPayload.append("media_type", getMediaType(item.file.name));

                await createCardMedia(createdCard.id, mediaPayload);
            }

            setSuccessMessage("Карточка успешно создана.");

            setTimeout(() => {
                navigate(`/cards/${createdCard.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            setError("Не удалось создать карточку.");
        } finally {
            setIsSaving(false);
        }
    }

    if (isAuthLoading || isLoading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Загрузка...
            </div>
        );
    }

    if (!canCreateKnowledge) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                У вас нет прав для создания карточек.
            </div>
        );
    }

    if (!section) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Секция не найдена.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/sections" className="transition hover:text-slate-700 dark:text-slate-200">
                    Справочник
                </Link>
                <span>/</span>
                <Link
                    to={`/sections/${section.slug}`}
                    className="transition hover:text-slate-700 dark:text-slate-200"
                >
                    {section.title}
                </Link>
                <span>/</span>
                <span className="text-slate-500 dark:text-slate-400">Создание карточки</span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Создание карточки
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Новая карточка будет добавлена в секцию «{section.title}».
                </p>
            </section>

            {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
            >
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
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="attachments"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Вложения карточки
                        </label>

                        <input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={handleAttachmentsChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                        />

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Можно прикреплять изображения, видео, аудио и документы.
                        </p>
                    </div>

                    {attachments.length > 0 && (
                        <div className="space-y-4">
                            {attachments.map((item, index) => (
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
                                                    handleAttachmentFieldChange(
                                                        index,
                                                        "caption",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Порядок
                                            </label>
                                            <input
                                                type="number"
                                                value={item.sort_order}
                                                onChange={(event) =>
                                                    handleAttachmentFieldChange(
                                                        index,
                                                        "sort_order",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(index)}
                                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                        >
                                            Удалить вложение
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                        <input
                            type="checkbox"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">Опубликована</span>
                    </label>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 disabled:opacity-70"
                    >
                        {isSaving ? "Создаём..." : "Создать карточку"}
                    </button>

                    <Link
                        to={`/sections/${section.slug}`}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}