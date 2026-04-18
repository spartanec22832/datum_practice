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

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="projects/:slug" element={<ProjectDetailPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                        <Route path="sections/:slug" element={<SectionPage />} />
                        <Route path="cards/:slug" element={<CardPage />} />
                        <Route path="sections" element={<SectionsPage />} />
                        <Route path="projects/:slug/edit" element={<ProjectEditPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}