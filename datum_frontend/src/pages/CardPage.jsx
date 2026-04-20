import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteCard, getCardBySlug } from "../services/cards";
import { useAuth } from "../context/AuthContext";

function getFileUrl(filePath) {
    if (!filePath) {
        return null;
    }

    if (filePath.startsWith("http")) {
        return filePath;
    }

    return `${
        import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"
    }${filePath}`;
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

function MediaItemCard({ item }) {
    const rawFilePath = item.file || item.file_path;
    const fileUrl = getFileUrl(rawFilePath);
    const fileName = getFileName(rawFilePath);
    const mediaType = item.media_type;
    const caption = item.caption || "";

    if (!fileUrl) {
        return null;
    }

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            {mediaType === "image" && (
                <img
                    src={fileUrl}
                    alt={caption || fileName}
                    className="h-64 w-full object-cover"
                />
            )}

            {mediaType === "video" && (
                <video controls className="h-64 w-full bg-black">
                    <source src={fileUrl} />
                    Ваш браузер не поддерживает воспроизведение видео.
                </video>
            )}

            {mediaType === "audio" && (
                <div className="p-6">
                    <audio controls className="w-full">
                        <source src={fileUrl} />
                        Ваш браузер не поддерживает воспроизведение аудио.
                    </audio>
                </div>
            )}

            {mediaType === "document" && (
                <div className="p-6">
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                        Открыть документ
                    </a>
                </div>
            )}

            <div className="space-y-2 border-t border-slate-100 p-4 dark:border-slate-800">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {mediaType === "image" && "Изображение"}
                    {mediaType === "video" && "Видео"}
                    {mediaType === "audio" && "Аудио"}
                    {mediaType === "document" && "Документ"}
                </p>

                <p className="break-all text-sm font-medium text-slate-900 dark:text-slate-100">
                    {fileName}
                </p>

                {caption && (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{caption}</p>
                )}
            </div>
        </article>
    );
}

export default function CardPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadCard() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getCardBySlug(slug);
                setCard(data);
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить карточку.");
            } finally {
                setIsLoading(false);
            }
        }

        loadCard();
    }, [slug]);

    const imageUrl = useMemo(() => {
        if (!card?.main_image) {
            return null;
        }

        if (card.main_image.startsWith("http")) {
            return card.main_image;
        }

        return `${
            import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"
        }${card.main_image}`;
    }, [card]);

    const sectionSlug = card?.section_slug || card?.section?.slug || null;
    const sectionTitle = card?.section_title || card?.section?.title || "Раздел";

    const mediaItems = Array.isArray(card?.media_items)
        ? [...card.media_items].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
        : [];

    async function handleDeleteCard() {
        if (!card) {
            return;
        }

        if (deleteConfirmation !== card.title) {
            return;
        }

        try {
            setIsDeleting(true);
            setError("");

            await deleteCard(card.id);

            if (sectionSlug) {
                navigate(`/sections/${sectionSlug}`);
            } else {
                navigate("/sections");
            }
        } catch (err) {
            console.error(err);
            setError("Не удалось удалить карточку.");
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Загрузка карточки...
            </div>
        );
    }

    if (error && !card) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {error}
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
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to="/sections" className="transition hover:text-slate-700 dark:text-slate-200">
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
                    <span className="text-slate-500 dark:text-slate-400">{card.title}</span>
                </div>

                {sectionSlug && (
                    <div>
                        <Link
                            to={`/sections/${sectionSlug}`}
                            className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            ← Назад в раздел
                        </Link>
                    </div>
                )}

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {card.title}
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                        {card.summary || "Краткое описание карточки отсутствует."}
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to={`/cards/${card.slug}/edit`}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                        >
                            Редактировать карточку
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setDeleteConfirmation("");
                                setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                        >
                            Удалить карточку
                        </button>
                    </div>
                )}
            </section>

            {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                </div>
            )}

            <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={card.title}
                        className="h-[360px] w-full object-cover"
                    />
                ) : (
                    <div className="flex h-[240px] items-center justify-center bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Изображение карточки отсутствует
                    </div>
                )}

                <div className="space-y-5 p-6">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>
              Обновлено{" "}
                {card.updated_at
                    ? new Date(card.updated_at).toLocaleDateString("ru-RU")
                    : "—"}
            </span>
                    </div>

                    <div className="space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
                        <p>{card.content || "Содержимое карточки отсутствует."}</p>
                    </div>
                </div>
            </article>

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Вложения карточки
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Дополнительные изображения, видео, аудио и документы.
                    </p>
                </div>

                {mediaItems.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        У этой карточки пока нет вложений.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {mediaItems.map((item) => (
                            <MediaItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </section>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                Подтвердите удаление карточки
                            </h2>

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Чтобы удалить карточку, введите её название точно так же, как оно
                                указано ниже:
                            </p>

                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 dark:border dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100">
                                {card.title}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="delete-confirmation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Название карточки
                                </label>

                                <input
                                    id="delete-confirmation"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    placeholder="Введите точное название карточки"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteCard}
                                    disabled={isDeleting || deleteConfirmation !== card.title}
                                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? "Удаление..." : "Удалить навсегда"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
