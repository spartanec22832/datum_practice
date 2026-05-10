import { startTransition, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { getProjects } from "../services/projects";
import ProjectsMap from "../components/ProjectsMap";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessages } from "../utils/apiError";

function ProjectCard({ project, isAdmin, isActive, onSelectProject }) {
    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectProject(project);
        }
    }

    return (
        <article
            onClick={() => onSelectProject(project)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className={`flex h-full cursor-pointer flex-col rounded-3xl border bg-white p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 dark:bg-slate-900/90 ${
                isActive
                    ? "border-cyan-400 shadow-md ring-2 ring-cyan-500/20"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
            }`}
        >
            <div className="flex h-full flex-col space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">

                        {isAdmin &&
                            (project.is_published ? (
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

                    <h2 className="break-words text-2xl font-bold text-slate-900 [overflow-wrap:anywhere] dark:text-slate-50">
                        {project.title}
                    </h2>
                </div>

                <p className="break-words text-sm leading-7 text-slate-600 [overflow-wrap:anywhere] dark:text-slate-300">
                    {project.short_description || "Краткое описание пока не заполнено."}
                </p>

                <div className="mt-auto flex justify-end pt-2">
                    <Link
                        to={`/projects/${project.slug}`}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                    >
                        Открыть
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ProjectsPage() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeProject, setActiveProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadProjects() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getProjects();

                if (Array.isArray(data)) {
                    setProjects(data);
                } else if (Array.isArray(data.results)) {
                    setProjects(data.results);
                } else {
                    setProjects([]);
                }
            } catch (err) {
                console.error(err);
                setError(
                    getApiErrorMessages(
                        err,
                        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0440\u043e\u0435\u043a\u0442\u043e\u0432."
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return projects;
        }

        return projects.filter((project) => {
            const title = project.title?.toLowerCase() || "";
            const slug = project.slug?.toLowerCase() || "";
            const shortDescription = project.short_description?.toLowerCase() || "";
            const fullDescription = project.full_description?.toLowerCase() || "";

            return (
                title.includes(query) ||
                slug.includes(query) ||
                shortDescription.includes(query) ||
                fullDescription.includes(query)
            );
        });
    }, [projects, searchQuery]);

    useEffect(() => {
        if (
            activeProject &&
            !filteredProjects.some((project) => project.id === activeProject.id)
        ) {
            startTransition(() => {
                setActiveProject(null);
            });
        }
    }, [filteredProjects, activeProject]);

    function handleProjectClick(project) {
        navigate(`/projects/${project.slug}`);
    }

    function handleProjectSelect(project) {
        setActiveProject(project);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                    Проекты
                </span>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
                    Карта и список проектных карточек
                </h1>

                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Нажмите на карточку проекта или воспользуйтесь поиском, чтобы увидеть его геометрию на карте.
                </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                <label
                    htmlFor="projects-search"
                    className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                    Поиск по проектам
                </label>

                <input
                    id="projects-search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Введите название, slug или описание проекта"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-950"
                />
            </section>

            {isLoading && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                    Загрузка проектов...
                </div>
            )}

            {!isLoading && <ErrorAlertStack error={error} />}

            {!isLoading && !error && (
                <>
                    <ProjectsMap
                        projects={filteredProjects}
                        activeProject={activeProject}
                        onProjectClick={handleProjectClick}
                    />

                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    Карточки проектов
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Найдено: {filteredProjects.length}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-400">
                                    Всего: {projects.length}
                                </div>

                                {isAdmin && (
                                    <Link
                                        to="/projects/create"
                                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                                    >
                                        + Добавить проект
                                    </Link>
                                )}
                            </div>
                        </div>

                        {filteredProjects.length === 0 ? (
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                                По вашему запросу ничего не найдено.
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredProjects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        isAdmin={isAdmin}
                                        isActive={activeProject?.id === project.id}
                                        onSelectProject={handleProjectSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
