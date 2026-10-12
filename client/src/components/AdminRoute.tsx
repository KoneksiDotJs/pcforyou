import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AdminRoute = () => {
    const { user, isAdmin } = useAuthStore();

    // Jika belum login, lempar ke login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Jika login tapi bukan admin, kembalikan ke home atau halaman unauthorized
    if (!isAdmin()) {
        return <Navigate to="/" replace />;
    }

    // Jika admin, izinkan masuk ke halaman anak (Outlet)
    return <Outlet />;
};

export default AdminRoute;