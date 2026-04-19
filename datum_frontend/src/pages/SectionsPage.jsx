import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSections } from "../services/sections";
import { useAuth } from "../context/AuthContext";

function SectionTile({ section, isAdmin }) {
    return (
        <Link
            to={`/sections/${section.slug}`}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Секция
                        </p>

                        {isAdmin &&
                            (section.is_published ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    Опубликовано
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Не опубликовано
                                </span>
                            ))}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                        {section.title}
                    </h2>
                </div>

                <p className="text-sm leading-7 text-slate-600">
                    {section.description || "Описание секции отсутствует."}
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
    const { isAdmin } = useAuth();

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
                setError("Не удалось загрузить секции.");
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
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Справочник
        </span>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                    Разделы и карточки
                </h1>

                <p className="max-w-3xl text-base leading-7 text-slate-600">
                    Здесь собраны секции базы знаний. Открой нужную секцию, чтобы увидеть
                    вложенные разделы и карточки.
                </p>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
                <label
                    htmlFor="sections-search"
                    className="mb-2 block text-sm font-medium text-slate-600"
                >
                    Поиск по секциям
                </label>

                <input
                    id="sections-search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Введите название, slug или описание секции"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
            </section>

            {isLoading && (
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    Загрузка секций...
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            {!isLoading && !error && rootSections.length === 0 && (
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    Корневые секции пока отсутствуют.
                </div>
            )}

            {!isLoading && !error && rootSections.length > 0 && filteredSections.length === 0 && (
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    По вашему запросу ничего не найдено.
                </div>
            )}

            {!isLoading && !error && filteredSections.length > 0 && (
                <section className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Секции</h2>
                            <p className="text-sm text-slate-500">
                                Найдено: {filteredSections.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-slate-400">
                                Всего: {rootSections.length}
                            </div>

                            {isAdmin && (
                                <Link
                                    to="/sections/create"
                                    className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    + Добавить секцию
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredSections.map((section) => (
                            <SectionTile key={section.id} section={section} isAdmin={isAdmin} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}