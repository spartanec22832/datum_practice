import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProjects } from "../services/projects";
import ProjectsMap from "../components/ProjectsMap";
import { useAuth } from "../context/AuthContext";

function ProjectCard({ project, isAdmin, isActive, onHover, onLeave, onFocusProject }) {
    return (
        <article
            onMouseEnter={() => onHover(project)}
            onMouseLeave={onLeave}
            className={`rounded-3xl border bg-white p-6 shadow-sm transition ${
                isActive
                    ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                    : "border-slate-200 hover:shadow-md"
            }`}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Проект
                        </p>

                        {isAdmin &&
                            (project.is_published ? (
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
                        {project.title}
                    </h2>
                </div>

                <p className="text-sm leading-7 text-slate-600">
                    {project.short_description || "Краткое описание пока не заполнено."}
                </p>

                <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => onFocusProject(project)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Показать на карте
                    </button>

                    <Link
                        to={`/projects/${project.slug}`}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                setError("Не удалось загрузить список проектов.");
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
            setActiveProject(null);
        }
    }, [filteredProjects, activeProject]);

    function handleProjectClick(project) {
        navigate(`/projects/${project.slug}`);
    }

    function handleProjectHover(project) {
        setActiveProject(project);
    }

    function handleProjectLeave() {
        setActiveProject(null);
    }

    function handleProjectFocus(project) {
        setActiveProject(project);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Проекты
        </span>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                    Карта и список проектных карточек
                </h1>

                <p className="max-w-3xl text-base leading-7 text-slate-600">
                    Наведи на карточку проекта или начни вводить текст в поиск, чтобы
                    быстро найти нужный проект и увидеть его геометрию на карте.
                </p>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
                <label
                    htmlFor="projects-search"
                    className="mb-2 block text-sm font-medium text-slate-600"
                >
                    Поиск по проектам
                </label>

                <input
                    id="projects-search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Введите название, slug или описание проекта"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
            </section>

            {isLoading && (
                <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                    Загрузка проектов...
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

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
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Карточки проектов
                                </h2>
                                <p className="text-sm text-slate-500">
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
                                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        + Добавить проект
                                    </Link>
                                )}
                            </div>
                        </div>

                        {filteredProjects.length === 0 ? (
                            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
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
                                        onHover={handleProjectHover}
                                        onLeave={handleProjectLeave}
                                        onFocusProject={handleProjectFocus}
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