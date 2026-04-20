import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProjectBySlug } from "../services/projects";
import ProjectMiniMap from "../components/ProjectMiniMap";
import { useAuth } from "../context/AuthContext";

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
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);

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

    useEffect(() => {
        if (!isImagePreviewOpen && !isMapPreviewOpen) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setIsImagePreviewOpen(false);
                setIsMapPreviewOpen(false);
            }
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isImagePreviewOpen, isMapPreviewOpen]);

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
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                    Загрузка проекта...
                </div>
            </section>
        );
    }

    if (error && !project) {
        return (
            <section className="space-y-4">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                </div>
            </section>
        );
    }

    if (!project) {
        return (
            <section className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                    Проект не найден.
                </div>
            </section>
        );
    }

    const imageUrl = project.main_image
        ? project.main_image.startsWith("http")
            ? project.main_image
            : `${import.meta.env.VITE_MEDIA_BASE_URL || "http://127.0.0.1:8000"}${project.main_image}`
        : null;

    const hasGeojson =
        project.geojson && typeof project.geojson === "object" && project.geojson.type;

    return (
        <div className="space-y-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
                            <Link to="/projects" className="transition hover:text-slate-700 dark:text-slate-200">
                                Проекты
                            </Link>
                            <span>/</span>
                            <span className="min-w-0 truncate text-slate-500 dark:text-slate-400">
                                {project.title}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="break-words text-4xl font-bold tracking-tight text-slate-900 [overflow-wrap:anywhere] dark:text-slate-50">
                                {project.title}
                            </h1>

                            <p className="break-words text-base leading-7 text-slate-600 [overflow-wrap:anywhere] dark:text-slate-300">
                                {project.short_description || "Краткое описание отсутствует."}
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to={`/projects/${project.slug}/edit`}
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                                >
                                    Редактировать проект
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteConfirmation("");
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                >
                                    Удалить проект
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <article className="overflow-hidden rounded-b-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                        {imageUrl ? (
                            <button
                                type="button"
                                onClick={() => setIsImagePreviewOpen(true)}
                                className="block w-full cursor-zoom-in bg-transparent text-left transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                                aria-label="Открыть изображение проекта"
                            >
                                <img
                                    src={imageUrl}
                                    alt={project.title}
                                    className="h-[360px] w-full object-cover"
                                />
                            </button>
                        ) : (
                            <div className="flex h-[360px] items-center justify-center bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Изображение проекта отсутствует
                            </div>
                        )}

                        <div className="space-y-5 p-6">
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <span>
                                    География: {project.geojson?.properties?.label || "Не указана"}
                                </span>
                                <span>
                                    Обновлено{" "}
                                    {project.updated_at
                                        ? new Date(project.updated_at).toLocaleDateString("ru-RU")
                                        : "—"}
                                </span>
                            </div>

                            <div className="space-y-4 break-words text-sm leading-7 text-slate-700 [overflow-wrap:anywhere] dark:text-slate-200">
                                <p>
                                    {project.full_description || "Полное описание отсутствует."}
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                {hasGeojson && (
                    <aside className="space-y-6">
                        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                            <div className="space-y-4 px-5 py-5">
                                <div className="flex justify-center gap-3">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-base font-medium text-slate-600 dark:bg-slate-900/80 dark:text-slate-400">
                                        Локация текущего проекта
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsMapPreviewOpen(true)}
                                    className="block w-full overflow-hidden rounded-3xl bg-transparent text-left transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                                    aria-label="Открыть большую карту проекта"
                                >
                                    <ProjectMiniMap
                                        geojson={project.geojson}
                                        interactive={false}
                                        className="h-[220px] w-full overflow-hidden rounded-3xl"
                                    />
                                </button>

                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsMapPreviewOpen(true)}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                                    >
                                        Открыть большую карту
                                    </button>
                                </div>
                            </div>
                        </section>
                    </aside>
                )}
            </div>

            {isImagePreviewOpen && imageUrl && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/90 p-4 backdrop-blur-sm sm:p-6"
                    onClick={() => setIsImagePreviewOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Увеличенное изображение проекта"
                >
                    <button
                        type="button"
                        onClick={() => setIsImagePreviewOpen(false)}
                        className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:right-6 sm:top-6"
                        aria-label="Закрыть просмотр изображения"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    <div
                        className="flex h-full items-center justify-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={imageUrl}
                            alt={project.title}
                            className="max-h-[90vh] w-auto max-w-[94vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {isMapPreviewOpen && hasGeojson && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/88 p-4 backdrop-blur-sm sm:p-6"
                    onClick={() => setIsMapPreviewOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Большая карта проекта"
                >
                    <button
                        type="button"
                        onClick={() => setIsMapPreviewOpen(false)}
                        className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:right-6 sm:top-6"
                        aria-label="Закрыть большую карту"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    <div
                        className="mx-auto flex h-full w-full max-w-6xl items-center justify-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="w-full overflow-hidden rounded-[32px] border border-slate-800 bg-white shadow-2xl dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Большая карта проекта
                                    </p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">
                                        {project.geojson?.properties?.label || "География проекта"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsMapPreviewOpen(false)}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                                >
                                    Закрыть
                                </button>
                            </div>

                            <div className="p-6">
                                <ProjectMiniMap
                                    geojson={project.geojson}
                                    interactive={true}
                                    className="h-[72vh] w-full overflow-hidden rounded-[28px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                Подтвердите удаление проекта
                            </h2>

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Чтобы удалить проект, введите его название точно так же, как оно
                                указано ниже:
                            </p>

                            <div className="break-words rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 [overflow-wrap:anywhere] dark:border dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100">
                                {project.title}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="delete-confirmation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    Название проекта
                                </label>

                                <input
                                    id="delete-confirmation"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    placeholder="Введите точное название проекта"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
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
