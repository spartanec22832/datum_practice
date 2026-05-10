import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlertStack from "../components/ErrorAlertStack";
import { loginUser } from "../services/auth";
import { saveTokens } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessages } from "../utils/apiError";

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
            setError(
                getApiErrorMessages(
                    err,
                    "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u043e\u0439\u0442\u0438."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                <div className="mb-6 space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Вход</h1>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Авторизуйся, чтобы получить доступ к защищённым возможностям системы.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Логин
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                            placeholder="Введите логин"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Пароль
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                            placeholder="Введите пароль"
                            required
                        />
                    </div>

                    <ErrorAlertStack
                        error={error}
                        itemClassName="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Входим..." : "Войти"}
                    </button>
                </form>
            </div>
        </section>
    );
}
