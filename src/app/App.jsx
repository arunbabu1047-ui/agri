import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';
import HomePage from '../pages/public/HomePage';
import NewsPage from '../pages/public/NewsPage';
import NewsDetailPage from '../pages/public/NewsDetailPage';
import VideosPage from '../pages/public/VideosPage';
import VideoDetailPage from '../pages/public/VideoDetailPage';
import ResourcesPage from '../pages/public/ResourcesPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminContentListPage from '../pages/admin/AdminContentListPage';
import ContentEditorPage from '../pages/admin/ContentEditorPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import UsersPage from '../pages/admin/UsersPage';
import ProfilePage from '../pages/admin/ProfilePage';

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:slug" element={<NewsDetailPage />} />
      <Route path="/videos" element={<VideosPage />} />
      <Route path="/videos/:slug" element={<VideoDetailPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Route>
    <Route path="/admin/login" element={<LoginPage />} />
    <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="news" element={<AdminContentListPage type="news" />} />
        <Route path="news/new" element={<ContentEditorPage type="news" />} />
        <Route path="news/:id/edit" element={<ContentEditorPage type="news" />} />
        <Route path="videos" element={<AdminContentListPage type="videos" />} />
        <Route path="videos/new" element={<ContentEditorPage type="videos" />} />
        <Route path="videos/:id/edit" element={<ContentEditorPage type="videos" />} />
        <Route path="resources" element={<AdminContentListPage type="resources" />} />
        <Route path="resources/new" element={<ContentEditorPage type="resources" />} />
        <Route path="resources/:id/edit" element={<ContentEditorPage type="resources" />} />
        <Route element={<RoleGuard roles={['admin']} />}>
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
