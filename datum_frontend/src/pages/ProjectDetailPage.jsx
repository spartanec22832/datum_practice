import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectBySlug, deleteProject } from "../services/projects";
import { useAuth } from "../context/AuthContext";
import ProjectMiniMap from "../components/ProjectMiniMap";

export default function ProjectDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadProject() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getProjectBySlug(slug);
                setProject(data);
            } catch (err) {
                console.error(err);
                setError("Не удалось загрузить проект.");
            } finally {
                setIsLoading(false);
            }
        }

        loadProject();
    }, [slug]);

    async function handleDeleteProject() {
        if (!project) {
            return;
        }

        if (deleteConfirmation !== project.title) {
            return;
        }

        try {
            setIsDeleting(true);
            setError("");

            await deleteProject(project.id);
            navigate("/projects");
        } catch (err) {
            console.error(err);
            setError("Не удалось удалить проект.");
            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <section>
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    Загрузка проекта...
                </div>
            </section>
        );
    }

    if (error && !project) {
        return (
            <section className="space-y-4">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            </section>
        );
    }

    if (!project) {
        return (
            <section className="space-y-4">
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    Проект не найден.
                </div>
            </section>
        );
    }

    const imageUrl = project.main_image
        ? project.main_image.startsWith("http")
            ? project.main_image
            : `${
                import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"
            }${project.main_image}`
        : null;

    return (
        <div className="space-y-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Link to="/projects" className="transition hover:text-slate-700">
                                Проекты
                            </Link>
                            <span>/</span>
                            <span className="truncate text-slate-500">{project.title}</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                                {project.title}
                            </h1>

                            <p className="text-base leading-7 text-slate-600">
                                {project.short_description || "Краткое описание отсутствует."}
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to={`/projects/${project.slug}/edit`}
                                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Редактировать проект
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteConfirmation("");
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="inline-flex rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                    Удалить проект
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                            {error}
                        </div>
                    )}

                    <article className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={project.title}
                                className="h-[360px] w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-[360px] items-center justify-center bg-slate-200 text-slate-500">
                                Изображение проекта отсутствует
                            </div>
                        )}

                        <div className="space-y-5 p-6">
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  География:{" "}
                    {project.geojson?.properties?.label || "Не указана"}
                </span>
                                <span>
                  Обновлено{" "}
                                    {project.updated_at
                                        ? new Date(project.updated_at).toLocaleDateString("ru-RU")
                                        : "—"}
                </span>
                            </div>

                            <div className="space-y-4 text-sm leading-7 text-slate-700">
                                <p>
                                    {project.full_description || "Полное описание отсутствует."}
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                <aside className="space-y-6">
                    <section className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Карта
              </span>

                            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Карта проекта
              </span>
                        </div>

                        <div className="px-5 pb-5">
                            <ProjectMiniMap geojson={project.geojson} />
                        </div>
                    </section>

                    <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Управление
            </span>

                        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                            <p>
                                По ТЗ проекты редактируются администратором. Пользовательский
                                фронтенд здесь даёт быстрый просмотр и навигацию.
                            </p>
                            <p>
                                Позже сюда можно добавить служебные поля, ссылки и связанный
                                контент проекта.
                            </p>
                        </div>
                    </section>
                </aside>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Подтвердите удаление проекта
                            </h2>

                            <p className="text-sm leading-6 text-slate-600">
                                Чтобы удалить проект, введите его название точно так же, как оно
                                указано ниже:
                            </p>

                            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                                {project.title}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="delete-confirmation"
                                    className="block text-sm font-medium text-slate-700"
                                >
                                    Название проекта
                                </label>

                                <input
                                    id="delete-confirmation"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) =>
                                        setDeleteConfirmation(event.target.value)
                                    }
                                    placeholder="Введите точное название проекта"
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteProject}
                                    disabled={isDeleting || deleteConfirmation !== project.title}
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