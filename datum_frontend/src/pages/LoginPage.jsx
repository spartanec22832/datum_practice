import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { saveTokens } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { loadUser } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setError("");

            const data = await loginUser(formData);
            saveTokens(data);
            await loadUser();

            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Неверный логин или пароль.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-6 space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Вход</h1>
                    <p className="text-sm leading-6 text-slate-600">
                        Авторизуйся, чтобы получить доступ к защищённым возможностям системы.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Логин
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                            placeholder="Введите логин"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Пароль
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                            placeholder="Введите пароль"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Входим..." : "Войти"}
                    </button>
                </form>
            </div>
        </section>
    );
}