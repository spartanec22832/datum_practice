import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { getSections } from "../services/sections";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessages } from "../utils/apiError";

function SectionTile({ section, isAdmin }) {
    const authorName =
        typeof section.author === "object"
            ? section.author?.username ||
            section.author?.email ||
            `${section.author?.first_name || ""} ${section.author?.last_name || ""}`.trim() ||
            "Не указан"
            : section.author_username ||
            section.author_email ||
            section.author_first_name ||
            section.author_last_name ||
            (section.author ? `ID ${section.author}` : "Не указан");

    return (
        <Link
            to={`/sections/${section.slug}`}
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

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {section.title}
                    </h2>
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

export default function SectionsPage() {
    const { isAdmin, canCreateKnowledge } = useAuth();

    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadSections() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getSections();

                if (Array.isArray(data)) {
                    setSections(data);
                } else if (Array.isArray(data.results)) {
                    setSections(data.results);
                } else {
                    setSections([]);
                }
            } catch (err) {
                console.error(err);
                setError(
                    getApiErrorMessages(
                        err,
                        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b\u044b."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadSections();
    }, []);

    const rootSections = useMemo(() => {
        return sections.filter((section) => !section.parent);
    }, [sections]);

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return rootSections;
        }

        return rootSections.filter((section) => {
            const title = section.title?.toLowerCase() || "";
            const slug = section.slug?.toLowerCase() || "";
            const description = section.description?.toLowerCase() || "";

            return (
                title.includes(query) ||
                slug.includes(query) ||
                description.includes(query)
            );
        });
    }, [rootSections, searchQuery]);

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                    Справочник
                </span>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
                    Разделы и карточки
                </h1>

                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Здесь собраны секции базы знаний. Открой нужную секцию, чтобы увидеть
                    вложенные разделы и карточки.
                </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                <label
                    htmlFor="sections-search"
                    className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                    Поиск по секциям
                </label>

                <input
                    id="sections-search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Введите название, slug или описание секции"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-950"
                />
            </section>

            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Секции</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Всего: {rootSections.length}</p>
                    </div>

                    {canCreateKnowledge && (
                        <Link
                            to="/sections/create"
                            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                        >
                            + Добавить секцию
                        </Link>
                    )}
                </div>

                {isLoading && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        Загрузка секций...
                    </div>
                )}

                {!isLoading && <ErrorAlertStack error={error} />}

                {!isLoading && !error && rootSections.length === 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        Корневые секции пока отсутствуют.
                    </div>
                )}

                {!isLoading && !error && rootSections.length > 0 && filteredSections.length === 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                        По вашему запросу ничего не найдено.
                    </div>
                )}

                {!isLoading && !error && filteredSections.length >= 0 && (
                    <>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Найдено: {filteredSections.length}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredSections.map((section) => (
                                <SectionTile
                                    key={section.id}
                                    section={section}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
