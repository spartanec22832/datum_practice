import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const location = useLocation();

    if (isAuthLoading) {
        return (
            <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
                Проверка доступа...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}