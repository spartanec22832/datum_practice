import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSectionBySlug, getSections, updateSection } from "../services/sections";
import { useAuth } from "../context/AuthContext";

export default function SectionEditPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isAuthLoading, canManageKnowledgeItem } = useAuth();

    const [section, setSection] = useState(null);
    const [sections, setSections] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        parent: "",
        is_published: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                setError("");

                const [sectionData, sectionsData] = await Promise.all([
                    getSectionBySlug(slug),
                    getSections(),
                ]);

                setSection(sectionData);

                const normalizedSections = Array.isArray(sectionsData)
                    ? sectionsData
                    : Array.isArray(sectionsData.results)
                        ? sectionsData.results
                        : [];

                setSections(normalizedSections);

                setFormData({
                    title: sectionData.title || "",
                    description: sectionData.description || "",
                    parent: sectionData.parent?.id || sectionData.parent || "",
                    is_published: Boolean(sectionData.is_published),
                });
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить секцию для редактирования.");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [slug]);

    const parentOptions = useMemo(() => {
        if (!section) return sections;
        return sections.filter((item) => item.id !== section.id);
    }, [sections, section]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!section) return;

        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            const payload = {
                title: formData.title,
                description: formData.description,
                parent: formData.parent ? Number(formData.parent) : null,
            };

            if (isAdmin) {
                payload.is_published = formData.is_published;
            }

            const updated = await updateSection(section.id, payload);

            setSuccessMessage("Секция успешно обновлена.");

            setTimeout(() => {
                navigate(`/sections/${updated.slug || section.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить изменения секции.");
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

    if (!canManageKnowledgeItem(section)) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                У вас нет прав для редактирования секции.
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
                <Link
                    to="/sections"
                    className="transition hover:text-slate-700 dark:text-slate-200"
                >
                    Секции
                </Link>
                <span>/</span>
                <Link
                    to={`/sections/${section.slug}`}
                    className="transition hover:text-slate-700 dark:text-slate-200"
                >
                    {section.title}
                </Link>
                <span>/</span>
                <span className="text-slate-500 dark:text-slate-400">
                    Редактирование
                </span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Редактирование секции
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Здесь можно изменить название, описание и родительскую секцию.
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
                        Название секции
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
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Описание
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={6}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="parent"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Родительская секция
                    </label>
                    <select
                        id="parent"
                        name="parent"
                        value={formData.parent}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    >
                        <option value="">Без родительской секции</option>
                        {parentOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </div>

                {isAdmin && (
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
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 disabled:opacity-70"
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить"}
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