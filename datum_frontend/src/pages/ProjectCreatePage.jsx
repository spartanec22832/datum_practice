import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { useAuth } from "../context/AuthContext";
import { createProject } from "../services/projects";
import { getApiErrorMessages } from "../utils/apiError";

export default function ProjectCreatePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin" || user?.is_staff;

    const [formData, setFormData] = useState({
        title: "",
        short_description: "",
        full_description: "",
        is_published: false,
        geojson: "",
        main_image: null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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

    function handleGeoJsonFileChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = reader.result;

                if (typeof text !== "string") {
                    throw new Error("Файл не удалось прочитать как текст.");
                }

                JSON.parse(text);

                setFormData((prev) => ({
                    ...prev,
                    geojson: text,
                }));

                setError("");
            } catch (error) {
                console.error(error);
                setError("Файл GeoJSON содержит некорректный JSON.");
            }
        };

        reader.onerror = () => {
            setError("Не удалось прочитать файл GeoJSON.");
        };

        reader.readAsText(file, "utf-8");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            let geojsonValue = null;

            if (formData.geojson.trim()) {
                try {
                    geojsonValue = JSON.parse(formData.geojson);
                } catch {
                    setError("GeoJSON должен быть корректным JSON.");
                    setIsSaving(false);
                    return;
                }
            }

            if (!formData.main_image) {
                const payload = {
                    title: formData.title,
                    short_description: formData.short_description,
                    full_description: formData.full_description,
                    is_published: formData.is_published,
                    geojson: geojsonValue,
                };

                const created = await createProject(payload, false);

                setSuccessMessage("Проект успешно создан.");

                setTimeout(() => {
                    navigate(`/projects/${created.slug}`);
                }, 700);

                return;
            }

            const payload = new FormData();
            payload.append("title", formData.title);
            payload.append("short_description", formData.short_description);
            payload.append("full_description", formData.full_description);
            payload.append("is_published", formData.is_published);

            if (formData.main_image) {
                payload.append("main_image", formData.main_image);
            }

            if (geojsonValue) {
                payload.append("geojson", JSON.stringify(geojsonValue));
            }

            const created = await createProject(payload, true);

            setSuccessMessage("Проект успешно создан.");

            setTimeout(() => {
                navigate(`/projects/${created.slug}`);
            }, 700);
        } catch (err) {
            console.error(err);
            setError(
                getApiErrorMessages(
                    err,
                    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442."
                )
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link to="/projects" className="transition hover:text-slate-700 dark:text-slate-200">
                        Проекты
                    </Link>
                    <span>/</span>
                    <span className="text-slate-500 dark:text-slate-400">Создание</span>
                </div>

                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    У вас нет прав для создания проектов.
                </div>

                <Link
                    to="/projects"
                    className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                    Вернуться к проектам
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/projects" className="transition hover:text-slate-700 dark:text-slate-200">
                    Проекты
                </Link>
                <span>/</span>
                <span className="text-slate-500 dark:text-slate-400">Создание</span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Создание проекта
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Здесь администратор может создать новый проект.
                </p>
            </section>

            <ErrorAlertStack error={error} />

            {successMessage && (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
            >
                <div className="space-y-2">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Название проекта
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
                        htmlFor="short_description"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Краткое описание
                    </label>
                    <textarea
                        id="short_description"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="full_description"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Полное описание
                    </label>
                    <textarea
                        id="full_description"
                        name="full_description"
                        value={formData.full_description}
                        onChange={handleChange}
                        rows={10}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="geojson"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        GeoJSON
                    </label>
                    <textarea
                        id="geojson"
                        name="geojson"
                        value={formData.geojson}
                        onChange={handleChange}
                        rows={8}
                        placeholder='Например: {"type":"Feature","geometry":{"type":"Point","coordinates":[39.7015,47.2357]},"properties":{"label":"Ростов-на-Дону"}}'
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="geojson_file"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Загрузить GeoJSON-файл
                    </label>

                    <input
                        id="geojson_file"
                        name="geojson_file"
                        type="file"
                        accept=".json,.geojson,application/json"
                        onChange={handleGeoJsonFileChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Можно загрузить файл .json или .geojson — его содержимое подставится в поле ниже.
                    </p>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="main_image"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Фото проекта
                    </label>

                    <input
                        id="main_image"
                        name="main_image"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                    <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Опубликован</span>
                </label>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 disabled:opacity-70"
                    >
                        {isSaving ? "Создаём..." : "Создать проект"}
                    </button>

                    <Link
                        to="/projects"
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}
