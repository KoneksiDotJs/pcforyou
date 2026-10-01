import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post('/auth/register', { name, email, password });
            return response.data.data;
        },
        onSuccess: () => {
            // Jika sukses, arahkan ke login
            navigate('/login');
        },
        onError: (error: any) => {
            setErrorMsg(error.response?.data?.message || 'Registrasi gagal');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        registerMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="pixel-panel p-8 w-full max-w-md">
                <h1 className="text-4xl text-center mb-8 border-b-4 border-pc-blue pb-4 uppercase">
                    NEW_USER_REGISTRATION
                </h1>

                {errorMsg && (
                    <div className="bg-red-950 border-4 border-red-900 text-red-400 p-2 mb-6 text-xl text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-2xl text-pc-cream/80">NAMA_</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-2xl focus:outline-none focus:border-pc-cream transition-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-2xl text-pc-cream/80">EMAIL_</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-2xl focus:outline-none focus:border-pc-cream transition-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-2xl text-pc-cream/80">PASSWORD_</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-2xl focus:outline-none focus:border-pc-cream transition-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="pixel-btn text-2xl mt-4"
                    >
                        {registerMutation.isPending ? 'PROCESSING...' : 'REGISTER'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xl text-pc-cream/70">
                    Sudah punya akses? <Link to="/login" className="text-pc-cream underline hover:text-pc-blue">Login di sini</Link>
                </div>
            </div>
        </div>
    );
}