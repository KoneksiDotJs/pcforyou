import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/useAuthStore';
import { apiClient } from './api/client';
import MyBuilds from './pages/MyBuilds';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import { useEffect } from 'react';

// Komponen Navbar Ringkas
function Navbar() {
  // Ambil state dari Zustand
  const { user, setUser, logout, isAdmin, checkUserAuth } = useAuthStore(); 
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      // Memanggil fungsi logout dari store lebih rapi daripada memodifikasi state manual
      logout(); 
      navigate('/login');
    } catch (error) {
      console.error('Gagal logout', error);
    }
  };

  return (
    <nav className="bg-pc-dark border-b-4 border-pc-blue p-4 flex justify-between items-center">
      <Link to="/" className="text-3xl font-bold text-pc-cream hover:text-pc-cream/80">
        [ PC_BUILDER_OS ]
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-2xl text-green-400 hidden md:inline">WELCOME, {user.name.toUpperCase()}</span>
            
            {/* TAMBAHAN: Tombol My Builds */}
            <Link to="/my-builds" className="pixel-btn px-4 py-1 text-xl bg-pc-darkest border-pc-blue hover:bg-pc-cream hover:text-pc-darkest">
              MY_BUILDS
            </Link>

            {/* PERBAIKAN: Tombol Admin */}
            {/* Menggunakan fungsi isAdmin dari store yang sudah kamu buat */}
            {isAdmin() && (
              <Link to="/admin/dashboard" className="pixel-btn px-4 py-1 text-xl bg-yellow-900 border-yellow-400 hover:bg-yellow-400 hover:text-pc-darkest">
                ADMIN_DASHBOARD
              </Link>
            )}

            <button onClick={handleLogout} className="pixel-btn px-4 py-1 text-xl border-red-900 hover:bg-red-950 hover:text-red-400">
              LOGOUT
            </button>
          </>
        ) : (
          <Link to="/login" className="pixel-btn px-4 py-1 text-xl">LOGIN_</Link>
        )}
      </div>
    </nav>
  );
} // <--- Pastikan kurung penutup fungsi Navbar ada di sini

// Komponen Pembungkus Utama
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Rute Publik & User Biasa */}
        <Route path="/" element={<Builder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-builds" element={<MyBuilds />} />

        {/* Rute Khusus Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;