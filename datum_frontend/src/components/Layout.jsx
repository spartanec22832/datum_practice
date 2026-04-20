import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const THEME_STORAGE_KEY = "datum-theme";

function SunIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2.75v2.5" />
            <path d="M12 18.75v2.5" />
            <path d="m5.46 5.46 1.77 1.77" />
            <path d="m16.77 16.77 1.77 1.77" />
            <path d="M2.75 12h2.5" />
            <path d="M18.75 12h2.5" />
            <path d="m5.46 18.54 1.77-1.77" />
            <path d="m16.77 7.23 1.77-1.77" />
        </svg>
    );
}

function MoonIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M21 12.55A8.5 8.5 0 1 1 11.45 3a6.5 6.5 0 0 0 9.55 9.55Z" />
        </svg>
    );
}

function getInitialTheme() {
    if (typeof window === "undefined") {
        return "dark";
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const theme = savedTheme === "light" ? "light" : "dark";

    if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = theme;
    }

    return theme;
}

export default function Layout() {
    const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
    const [theme, setTheme] = useState(getInitialTheme);

    const navLinkClass = ({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive
                ? "bg-slate-900 text-white dark:bg-cyan-400/15 dark:text-cyan-200"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        }`;

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-[#11192e]/95">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">Datum</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Банк знаний компании
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-2">
                            <NavLink to="/" className={navLinkClass} end>
                                Главная
                            </NavLink>
                            <NavLink to="/projects" className={navLinkClass}>
                                Проекты
                            </NavLink>
                            {isAuthenticated && (
                                <NavLink to="/sections" className={navLinkClass}>
                                    Справочник
                                </NavLink>
                            )}
                            {!isAuthenticated && (
                                <NavLink to="/login" className={navLinkClass}>
                                    Вход
                                </NavLink>
                            )}
                        </nav>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-pressed={theme === "dark"}
                            aria-label={
                                theme === "dark"
                                    ? "Переключить на светлую тему"
                                    : "Переключить на тёмную тему"
                            }
                            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                            className="group relative inline-flex h-12 w-[92px] items-center rounded-full border border-slate-300 bg-white/95 p-1 text-slate-500 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
                        >
                            <span
                                className={`absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ${
                                    theme === "dark"
                                        ? "translate-x-10 bg-cyan-300 text-slate-950"
                                        : "translate-x-0 bg-slate-900 text-white"
                                }`}
                            >
                                {theme === "dark" ? (
                                    <MoonIcon className="h-4 w-4" />
                                ) : (
                                    <SunIcon className="h-4 w-4" />
                                )}
                            </span>

                            <span className="flex w-full items-center justify-between px-3">
                                <SunIcon
                                    className={`h-4 w-4 transition ${
                                        theme === "light"
                                            ? "text-amber-500"
                                            : "text-slate-400 dark:text-slate-500"
                                    }`}
                                />
                                <MoonIcon
                                    className={`h-4 w-4 transition ${
                                        theme === "dark"
                                            ? "text-cyan-300"
                                            : "text-slate-400 dark:text-slate-500"
                                    }`}
                                />
                            </span>

                            <span className="sr-only">
                                {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                            </span>
                        </button>

                        <div className="min-w-[180px] text-right">
                            {isAuthLoading ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Проверка входа...
                                </p>
                            ) : isAuthenticated ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                        {user?.username || "Пользователь"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-cyan-200"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Гость
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <Outlet />
            </main>
        </div>
    );
}
