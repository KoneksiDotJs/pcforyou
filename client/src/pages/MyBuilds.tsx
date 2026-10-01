import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../store/useBuilderStore';
import { useState } from 'react';
import type { ComponentCategory } from '../types';

// Interface menyesuaikan dengan skema Prisma SavedBuild
interface SavedBuild {
    id: string;
    buildName: string;
    cpuId: string | null;
    motherboardId: string | null;
    ramId: string | null;
    gpuId: string | null;
    psuId: string | null;
    createdAt: string;
}

export default function MyBuilds() {
    const { user } = useAuthStore();
    const { setPart, clearBuild } = useBuilderStore(); // Mengambil fungsi Zustand
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Jika user belum login, paksa lempar ke halaman login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Fetch daftar rakitan milik user ini
    const { data: builds, isLoading, isError } = useQuery({
        queryKey: ['my-builds'],
        queryFn: async () => {
            const response = await apiClient.get('/builds/my-builds');
            return response.data.data as SavedBuild[];
        },
    });
    const handleLoadBuild = async (build: SavedBuild) => {
        setLoadingId(build.id);

        try {
            clearBuild(); // Kosongkan meja rakitan terlebih dahulu

            // Siapkan daftar ID komponen yang ada di rakitan ini
            const partsToLoad = [
                { category: 'CPU', id: build.cpuId },
                { category: 'MOTHERBOARD', id: build.motherboardId },
                { category: 'RAM', id: build.ramId },
                { category: 'GPU', id: build.gpuId },
                { category: 'PSU', id: build.psuId },
            ];

            // Fetch detail tiap komponen yang memiliki ID secara berurutan
            for (const part of partsToLoad) {
                if (part.id) {
                    const response = await apiClient.get(`/components/${part.id}`);
                    const componentData = response.data.data;
                    // Masukkan ke Zustand
                    setPart(part.category as ComponentCategory, componentData);
                }
            }

            // Lempar user ke halaman Builder utama
            navigate('/');
        } catch (error) {
            console.error('Gagal meload rakitan:', error);
            alert('Gagal memuat komponen rakitan dari server.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <div className="pixel-panel p-6 md:p-8 w-full max-w-5xl min-h-[600px]">
                <h1 className="text-4xl mb-8 border-b-4 border-pc-blue pb-4 uppercase flex justify-between items-end">
                    <span>ARCHIVE_DATABASE</span>
                    <span className="text-xl text-pc-cream/60">USER: {user.name}</span>
                </h1>

                {isLoading ? (
                    <div className="text-3xl text-center py-20 animate-pulse text-pc-blue">
                        SCANNING_ARCHIVES...
                    </div>
                ) : isError ? (
                    <div className="text-2xl text-red-400 text-center py-20 bg-red-950 border-4 border-red-900">
                        [ ERROR: GAGAL MENGAMBIL DATA RAKITAN ]
                    </div>
                ) : builds?.length === 0 ? (
                    <div className="text-2xl text-center py-20 text-pc-cream/50">
                        [ DATABASE KOSONG: BELUM ADA RAKITAN TERSIMPAN ]
                        <br />
                        <Link to="/" className="text-pc-blue hover:text-pc-cream underline mt-4 inline-block">
                            Mulai Rakit PC Baru
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {builds?.map((build) => (
                            <div
                                key={build.id}
                                className="border-4 border-pc-blue p-4 bg-pc-darkest hover:border-pc-cream transition-none group"
                            >
                                <div className="text-3xl font-bold mb-2 text-pc-cream group-hover:text-green-400">
                                    {build.buildName}
                                </div>
                                <div className="text-lg text-pc-cream/50 mb-4 border-b-2 border-pc-blue pb-2">
                                    Dibuat pada: {new Date(build.createdAt).toLocaleDateString('id-ID', {
                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>

                                {/* Visualisasi status komponen yang terpasang */}
                                <div className="space-y-1 text-xl font-pixel">
                                    <div className={build.cpuId ? 'text-green-400' : 'text-pc-cream/30'}>
                                        CPU: {build.cpuId ? '[ INSTALLED ]' : '[ EMPTY ]'}
                                    </div>
                                    <div className={build.motherboardId ? 'text-green-400' : 'text-pc-cream/30'}>
                                        MOBO: {build.motherboardId ? '[ INSTALLED ]' : '[ EMPTY ]'}
                                    </div>
                                    <div className={build.ramId ? 'text-green-400' : 'text-pc-cream/30'}>
                                        RAM: {build.ramId ? '[ INSTALLED ]' : '[ EMPTY ]'}
                                    </div>
                                    <div className={build.gpuId ? 'text-green-400' : 'text-pc-cream/30'}>
                                        GPU: {build.gpuId ? '[ INSTALLED ]' : '[ EMPTY ]'}
                                    </div>
                                    <div className={build.psuId ? 'text-green-400' : 'text-pc-cream/30'}>
                                        PSU: {build.psuId ? '[ INSTALLED ]' : '[ EMPTY ]'}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => handleLoadBuild(build)}
                                        disabled={loadingId === build.id}
                                        className="pixel-btn text-lg bg-pc-darkest border-pc-blue text-pc-cream hover:bg-pc-blue disabled:opacity-50"
                                    >
                                        {loadingId === build.id ? 'LOADING_DATA...' : 'LOAD_BUILD'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}