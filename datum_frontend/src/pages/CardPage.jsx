import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCardBySlug } from "../services/cards";

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

    const imageUrl = card.main_image
        ? card.main_image.startsWith("http")
            ? card.main_image
            : `${import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"}${card.main_image}`
        : null;

    const sectionSlug =
        card.section_slug || card.section?.slug || null;

    const sectionTitle =
        card.section_title || card.section?.title || "Раздел";

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
        </div>
    );
}