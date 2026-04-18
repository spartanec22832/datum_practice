import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    deleteSection,
    getSectionBySlug,
    getSectionContent,
} from "../services/sections";
import { useAuth } from "../context/AuthContext";

function SectionTile({ section }) {
    return (
        <Link
            to={`/sections/${section.slug}`}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Секция
            </p>

            <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {section.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600">
                {section.description || "Описание секции отсутствует."}
            </p>
        </Link>
    );
}

function CardTile({ card }) {
    return (
        <Link
            to={`/cards/${card.slug}`}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Карточка
            </p>

            <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {card.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600">
                {card.summary || "Краткое описание карточки отсутствует."}
            </p>
        </Link>
    );
}

export default function SectionPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [section, setSection] = useState(null);
    const [content, setContent] = useState({ sections: [], cards: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadSectionPage() {
            try {
                setIsLoading(true);
                setError("");

                const [sectionData, contentData] = await Promise.all([
                    getSectionBySlug(slug),
                    getSectionContent(slug),
                ]);

                setSection(sectionData);
                setContent({
                    sections: Array.isArray(contentData.child_sections)
                        ? contentData.child_sections
                        : [],
                    cards: Array.isArray(contentData.cards) ? contentData.cards : [],
                });
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить раздел.");
            } finally {
                setIsLoading(false);
            }
        }

        loadSectionPage();
    }, [slug]);

    async function handleDeleteSection() {
        if (!section) {
            return;
        }

        if (deleteConfirmation !== section.title) {
            return;
        }

        try {
            setIsDeleting(true);
            setError("");

            await deleteSection(section.id);
            navigate("/sections");
        } catch (err) {
            console.error(err);
            setError("Не удалось удалить секцию.");
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Загрузка раздела...
            </div>
        );
    }

    if (error && !section) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
            </div>
        );
    }

    if (!section) {
        return (
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Раздел не найден.
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
                    <span>/</span>
                    <span className="text-slate-500">{section.title}</span>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        {section.title}
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-slate-600">
                        {section.description || "Описание раздела отсутствует."}
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to={`/sections/${section.slug}/edit`}
                            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Редактировать секцию
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setDeleteConfirmation("");
                                setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                            Удалить секцию
                        </button>
                    </div>
                )}
            </section>

            {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Вложенные секции</h2>
                    <p className="text-sm text-slate-500">
                        Подразделы внутри текущей секции.
                    </p>
                </div>

                {content.sections.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                        В этой секции пока нет вложенных секций.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {content.sections.map((item) => (
                            <SectionTile key={item.id} section={item} />
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Карточки</h2>
                    <p className="text-sm text-slate-500">
                        Карточки, относящиеся к текущей секции.
                    </p>
                </div>

                {content.cards.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                        В этой секции пока нет карточек.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {content.cards.map((item) => (
                            <CardTile key={item.id} card={item} />
                        ))}
                    </div>
                )}
            </section>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Подтвердите удаление секции
                            </h2>

                            <p className="text-sm leading-6 text-slate-600">
                                Чтобы удалить секцию, введите её название точно так же, как оно
                                указано ниже:
                            </p>

                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                                {section.title}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="delete-confirmation"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Название секции
                                </label>

                                <input
                                    id="delete-confirmation"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    placeholder="Введите точное название секции"
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteSection}
                                    disabled={isDeleting || deleteConfirmation !== section.title}
                                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? "Удаление..." : "Удалить навсегда"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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