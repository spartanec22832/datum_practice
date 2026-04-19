import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCardBySlug } from "../services/cards";

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
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                        className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Открыть документ
                    </a>
                </div>
            )}

            <div className="space-y-2 border-t border-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {mediaType === "image" && "Изображение"}
                    {mediaType === "video" && "Видео"}
                    {mediaType === "audio" && "Аудио"}
                    {mediaType === "document" && "Документ"}
                </p>

                <p className="break-all text-sm font-medium text-slate-900">
                    {fileName}
                </p>

                {caption && (
                    <p className="text-sm leading-6 text-slate-600">{caption}</p>
                )}
            </div>
        </article>
    );
}

export default function CardPage() {
    const { slug } = useParams();

    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (isLoading) {
        return (
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Загрузка карточки...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
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
            <section className="space-y-4">
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
                    <span className="text-slate-500">{card.title}</span>
                </div>

                {sectionSlug && (
                    <div>
                        <Link
                            to={`/sections/${sectionSlug}`}
                            className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            ← Назад в раздел
                        </Link>
                    </div>
                )}

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        {card.title}
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-slate-600">
                        {card.summary || "Краткое описание карточки отсутствует."}
                    </p>
                </div>
            </section>

            <article className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={card.title}
                        className="h-[360px] w-full object-cover"
                    />
                ) : (
                    <div className="flex h-[240px] items-center justify-center bg-slate-200 text-slate-500">
                        Изображение карточки отсутствует
                    </div>
                )}

                <div className="space-y-5 p-6">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Обновлено{" "}
                {card.updated_at
                    ? new Date(card.updated_at).toLocaleDateString("ru-RU")
                    : "—"}
            </span>
                    </div>

                    <div className="space-y-4 text-sm leading-7 text-slate-700">
                        <p>{card.content || "Содержимое карточки отсутствует."}</p>
                    </div>
                </div>
            </article>

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Вложения карточки
                    </h2>
                    <p className="text-sm text-slate-500">
                        Дополнительные изображения, видео, аудио и документы.
                    </p>
                </div>

                {mediaItems.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
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
        </div>
    );
}