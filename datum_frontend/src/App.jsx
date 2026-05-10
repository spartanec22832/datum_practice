import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import { AuthProvider } from "./context/AuthContext";
import SectionPage from "./pages/SectionPage";
import CardPage from "./pages/CardPage";
import SectionsPage from "./pages/SectionsPage";
import ProjectEditPage from "./pages/ProjectEditPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectCreatePage from "./pages/ProjectCreatePage";
import SectionCreatePage from "./pages/SectionCreatePage";
import SectionEditPage from "./pages/SectionEditPage";
import CardCreatePage from "./pages/CardCreatePage";
import CardEditPage from "./pages/CardEditPage";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="projects/:slug" element={<ProjectDetailPage />} />
                        <Route element={<PublicOnlyRoute redirectTo="/sections" />}>
                            <Route path="login" element={<LoginPage />} />
                        </Route>
                        <Route path="projects/:slug/edit" element={<ProjectEditPage />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="sections" element={<SectionsPage />} />
                            <Route path="sections/create" element={<SectionCreatePage />} />

                            <Route path="sections/:slug/edit" element={<SectionEditPage />} />
                            <Route path="sections/:slug/cards/create" element={<CardCreatePage />} />

                            <Route path="sections/*" element={<SectionPage />} />

                            <Route path="cards/:slug" element={<CardPage />} />
                            <Route path="cards/:slug/edit" element={<CardEditPage />} />

                            <Route path="projects/create" element={<ProjectCreatePage />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}