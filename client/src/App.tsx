import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/useAuthStore';
import { apiClient } from './api/client';
import MyBuilds from './pages/MyBuilds';

// Komponen Navbar Ringkas
function Navbar() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
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
}

// Komponen Pembungkus Utama
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* TAMBAHAN: Route ke My Builds */}
        <Route path="/my-builds" element={<MyBuilds />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;