import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { user, isAuthenticated, isAuthLoading, logout } = useAuth();

    const navLinkClass = ({ isActive }) =>
        `rounded-lg px-4 py-2 text-sm font-medium transition ${
            isActive
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-200"
        }`;

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-xl font-bold">Datum</p>
                        <p className="text-sm text-slate-500">Банк знаний компании</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-2">
                            <NavLink to="/" className={navLinkClass} end>
                                Главная
                            </NavLink>
                            <NavLink to="/projects" className={navLinkClass}>
                                Проекты
                            </NavLink>
                            <NavLink to="/sections/" className={navLinkClass}>
                                Справочник
                            </NavLink>
                            {!isAuthenticated && (
                                <NavLink to="/login" className={navLinkClass}>
                                    Вход
                                </NavLink>
                            )}
                        </nav>

                        <div className="min-w-[180px] text-right">
                            {isAuthLoading ? (
                                <p className="text-sm text-slate-400">Проверка входа...</p>
                            ) : isAuthenticated ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {user?.username || "Пользователь"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="text-sm text-slate-500 transition hover:text-slate-900"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Гость</p>
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