import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    deleteSection,
    getSectionBySlug,
    getSectionContent,
} from "../services/sections";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { useAuth } from "../context/AuthContext";
import CardPage from "./CardPage";
import { getApiErrorMessages } from "../utils/apiError";

function normalizeSectionPath(path) {
    return (path || "").replace(/^\/+|\/+$/g, "");
}

function buildSectionBreadcrumbs(sectionPath) {
    const parts = normalizeSectionPath(sectionPath).split("/").filter(Boolean);

    return parts.map((slug, index) => ({
        slug,
        path: `/sections/${parts.slice(0, index + 1).join("/")}`,
        isLast: index === parts.length - 1,
    }));
}

function SectionTile({ section, isAdmin, currentSectionPath }) {
    const authorName =
        typeof section.author === "object"
            ? section.author?.username ||
            section.author?.email ||
            `${section.author?.first_name || ""} ${section.author?.last_name || ""}`.trim() ||
            "Не указан"
            : section.author_username || section.author_email || "Не указан";

    const normalizedCurrentPath = normalizeSectionPath(currentSectionPath);

    const targetPath = normalizedCurrentPath
        ? `/sections/${normalizedCurrentPath}/${section.slug}`
        : `/sections/${section.slug}`;

    return (
        <Link
            to={targetPath}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Секция
                        </p>

                        {isAdmin &&
                            (section.is_published ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:border dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500/100" />
                                    Опубликовано
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Не опубликовано
                                </span>
                            ))}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {section.title}
                    </h3>
                </div>

                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {section.description || "Описание секции отсутствует."}
                </p>

                <p className="text-xs text-slate-400">
                    Автор: {authorName}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>Подсекций: {section.children_count ?? 0}</span>
                    <span>Карточек: {section.cards_count ?? 0}</span>
                </div>
            </div>
        </Link>
    );
}

function CardTile({ card, isAdmin, currentSectionPath }) {
    const normalizedCurrentPath = normalizeSectionPath(currentSectionPath);

    const targetPath = normalizedCurrentPath
        ? `/sections/${normalizedCurrentPath}/cards/${card.slug}`
        : `/cards/${card.slug}`;

    return (
        <Link
            to={targetPath}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Карточка
                        </p>

                        {isAdmin &&
                            (card.is_published ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:border dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500/100" />
                                    Опубликовано
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Не опубликовано
                                </span>
                            ))}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {card.title}
                    </h3>
                </div>

                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {card.summary || "Краткое описание карточки отсутствует."}
                </p>

                <p className="text-xs text-slate-400">
                    Автор:{" "}
                    {typeof card.author === "object"
                        ? card.author?.username ||
                        card.author?.email ||
                        `${card.author?.first_name || ""} ${card.author?.last_name || ""}`.trim() ||
                        "Не указан"
                        : card.author_username || card.author_email || "Не указан"}
                </p>
            </div>
        </Link>
    );
}

export default function SectionPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { isAdmin, canCreateKnowledge, canManageKnowledgeItem } = useAuth();

    const sectionPath = normalizeSectionPath(params["*"] || params.slug || "");
    const sectionPathParts = sectionPath.split("/").filter(Boolean);

    const cardIndex = sectionPathParts.indexOf("cards");
    const isNestedCardPage =
        cardIndex !== -1 && Boolean(sectionPathParts[cardIndex + 1]);

    const nestedCardSlug = isNestedCardPage
        ? sectionPathParts[cardIndex + 1]
        : null;

    const nestedCardSectionPath = isNestedCardPage
        ? sectionPathParts.slice(0, cardIndex).join("/")
        : sectionPath;

    const slug = isNestedCardPage
        ? null
        : sectionPathParts[sectionPathParts.length - 1] || "";

    const breadcrumbs = buildSectionBreadcrumbs(sectionPath);

    const [section, setSection] = useState(null);
    const [content, setContent] = useState({ sections: [], cards: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isNestedCardPage) {
            return;
        }

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
                    cards: Array.isArray(contentData.cards)
                        ? contentData.cards
                        : [],
                });
            } catch (err) {
                console.error(err);
                setError(
                    getApiErrorMessages(
                        err,
                        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadSectionPage();
    }, [slug, isNestedCardPage]);

    const canManageSection = canManageKnowledgeItem(section);

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
            setError(
                getApiErrorMessages(
                    err,
                    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b."
                )
            );
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isNestedCardPage && nestedCardSlug) {
        return (
            <CardPage
                cardSlug={nestedCardSlug}
                sectionPath={nestedCardSectionPath}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Загрузка раздела...
            </div>
        );
    }

    if (error && !section) {
        return <ErrorAlertStack error={error} />;
    }

    if (!section) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                Раздел не найден.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <Link
                        to="/sections"
                        className="transition hover:text-slate-700 dark:text-slate-200"
                    >
                        Справочник
                    </Link>

                    {breadcrumbs.map((item) => (
                        <div key={item.path} className="flex items-center gap-2">
                            <span>/</span>

                            {item.isLast ? (
                                <span className="text-slate-500 dark:text-slate-400">
                    {section.title}
                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="transition hover:text-slate-700 dark:text-slate-200"
                                >
                                    {item.slug}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {section.title}
                    </h1>
                    <p className="text-sm text-slate-400">
                        Автор:{" "}
                        {typeof section.author === "object"
                            ? section.author?.username ||
                            section.author?.email ||
                            `${section.author?.first_name || ""} ${section.author?.last_name || ""}`.trim() ||
                            "Не указан"
                            : section.author_username || section.author_email || "Не указан"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {canManageSection && (
                        <Link
                            to={`/sections/${section.slug}/edit`}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                        >
                            Редактировать секцию
                        </Link>
                    )}

                    {canCreateKnowledge && (
                        <Link
                            to={`/sections/${section.slug}/cards/create`}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                        >
                            + Добавить карточку
                        </Link>
                    )}

                    {canManageSection && (
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteConfirmation("");
                                setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                        >
                            Удалить секцию
                        </button>
                    )}
                </div>
            </section>

            <ErrorAlertStack error={error} />

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Вложенные секции
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Подразделы внутри текущей секции.
                    </p>
                </div>

                {content.sections.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        В этой секции пока нет вложенных секций.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {content.sections.map((item) => (
                            <SectionTile
                                key={item.id}
                                section={item}
                                isAdmin={isAdmin}
                                currentSectionPath={sectionPath}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Карточки
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Карточки, относящиеся к текущей секции.
                    </p>
                </div>

                {content.cards.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        В этой секции пока нет карточек.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {content.cards.map((item) => (
                            <CardTile
                                key={item.id}
                                card={item}
                                isAdmin={isAdmin}
                                currentSectionPath={sectionPath}
                            />
                        ))}
                    </div>
                )}
            </section>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                Подтвердите удаление секции
                            </h2>

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Чтобы удалить секцию, введите её название точно так же,
                                как оно указано ниже:
                            </p>

                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 dark:border dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100">
                                {section.title}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="delete-confirmation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Название секции
                                </label>

                                <input
                                    id="delete-confirmation"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) =>
                                        setDeleteConfirmation(event.target.value)
                                    }
                                    placeholder="Введите точное название секции"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteSection}
                                    disabled={
                                        isDeleting || deleteConfirmation !== section.title
                                    }
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
