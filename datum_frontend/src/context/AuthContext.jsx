import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../services/auth";
import { clearTokens, getAccessToken } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    async function loadUser() {
        const token = getAccessToken();

        if (!token) {
            setUser(null);
            setIsAuthLoading(false);
            return;
        }

        try {
            setIsAuthLoading(true);
            const me = await getMe();
            console.log("ME:", me);
            setUser(me);
        } catch (error) {
            console.error(error);
            clearTokens();
            setUser(null);
        } finally {
            setIsAuthLoading(false);
        }
    }

    function logout() {
        clearTokens();
        setUser(null);
    }

    useEffect(() => {
        loadUser();
    }, []);

    const value = useMemo(() => {
        const isAdmin = Boolean(user?.is_staff || user?.role === "admin");

        return {
            user,
            setUser,
            isAuthLoading,
            loadUser,
            logout,
            isAuthenticated: Boolean(user),
            isAdmin,
            isUser: Boolean(user?.role === "user"),
            canCreateKnowledge: Boolean(isAdmin || user?.role === "user"),
            canManageKnowledgeItem: (item) => {
                if (!user || !item) {
                    return false;
                }

                const authorId =
                    typeof item.author === "object" ? item.author?.id : item.author;

                return Boolean(isAdmin || Number(authorId) === Number(user.id));
            },
        };
    }, [user, isAuthLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}