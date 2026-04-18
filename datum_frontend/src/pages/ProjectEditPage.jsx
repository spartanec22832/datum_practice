import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProjectBySlug, updateProject } from "../services/projects";
import { useAuth } from "../context/AuthContext";

export default function ProjectEditPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isAuthLoading } = useAuth();

    const [project, setProject] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        short_description: "",
        full_description: "",
        is_published: false,
        main_image: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadProject() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getProjectBySlug(slug);
                setProject(data);
                setFormData({
                    title: data.title || "",
                    short_description: data.short_description || "",
                    full_description: data.full_description || "",
                    is_published: Boolean(data.is_published),
                });
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить проект для редактирования.");
            } finally {
                setIsLoading(false);
            }
        }

        loadProject();
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

    async function handleSubmit(event) {
        event.preventDefault();

        if (!project) {
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            const payload = new FormData();
            payload.append("title", formData.title);
            payload.append("short_description", formData.short_description);
            payload.append("full_description", formData.full_description);
            payload.append("is_published", formData.is_published);

            if (formData.main_image) {
                payload.append("main_image", formData.main_image);
            }

            const updated = await updateProject(project.id, payload, true);

            setProject(updated);
            setSuccessMessage("Проект успешно обновлён.");

            setTimeout(() => {
                navigate(`/projects/${updated.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить изменения.");
        } finally {
            setIsSaving(false);
        }
    }

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
                У вас нет прав для редактирования проектов.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/projects" className="transition hover:text-slate-700">
                    Проекты
                </Link>
                <span>/</span>
                <Link
                    to={`/projects/${slug}`}
                    className="transition hover:text-slate-700"
                >
                    {project?.title || slug}
                </Link>
                <span>/</span>
                <span className="text-slate-500">Редактирование</span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Редактирование проекта
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600">
                    Здесь администратор может изменить содержимое проекта.
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
                className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm"
            >
                <div className="space-y-2">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Название проекта
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
                        htmlFor="short_description"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Краткое описание
                    </label>
                    <textarea
                        id="short_description"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="full_description"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Полное описание
                    </label>
                    <textarea
                        id="full_description"
                        name="full_description"
                        value={formData.full_description}
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
                        Фото проекта
                    </label>

                    <input
                        id="main_image"
                        name="main_image"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    />
                    {project?.main_image && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <img
                                src={
                                    project.main_image.startsWith("http")
                                        ? project.main_image
                                        : `${import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"}${project.main_image}`
                                }
                                alt={project.title}
                                className="h-56 w-full object-cover"
                            />
                        </div>
                    )}

                    {project?.main_image && (
                        <p className="text-sm text-slate-500">
                            Текущее изображение уже загружено. Можно выбрать новый файл для замены.
                        </p>
                    )}
                </div>


                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                    />
                    <span className="text-sm text-slate-700">Опубликован</span>
                </label>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить"}
                    </button>

                    <Link
                        to={`/projects/${slug}`}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}