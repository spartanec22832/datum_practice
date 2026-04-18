import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProject } from "../services/projects";
import { useAuth } from "../context/AuthContext";

export default function ProjectCreatePage() {
    const navigate = useNavigate();
    const { isAdmin, isAuthLoading } = useAuth();

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
                } catch (error) {
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
            setError("Не удалось создать проект.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/projects" className="transition hover:text-slate-700">
                    Проекты
                </Link>
                <span>/</span>
                <span className="text-slate-500">Создание</span>
            </div>

            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Создание проекта
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600">
                    Здесь администратор может создать новый проект.
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
                        htmlFor="geojson"
                        className="block text-sm font-medium text-slate-700"
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
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none transition focus:border-slate-500"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="geojson_file"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Загрузить GeoJSON-файл
                    </label>

                    <input
                        id="geojson_file"
                        name="geojson_file"
                        type="file"
                        accept=".json,.geojson,application/json"
                        onChange={handleGeoJsonFileChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    />

                    <p className="text-sm text-slate-500">
                        Можно загрузить файл .json или .geojson — его содержимое подставится в поле ниже.
                    </p>
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
                        {isSaving ? "Создаём..." : "Создать проект"}
                    </button>

                    <Link
                        to="/projects"
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
}