import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useBuilderStore } from '../store/useBuilderStore';
import { useAuthStore } from '../store/useAuthStore'; // TAMBAHAN
import type { Component, ComponentCategory } from '../types';
import { formatRupiah } from '../utils/format';

const CATEGORIES: ComponentCategory[] = [
    'CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE', 'COOLER'
];

export default function Builder() {
    const [activeCategory, setActiveCategory] = useState<ComponentCategory>('CPU');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buildName, setBuildName] = useState(''); // TAMBAHAN: State untuk nama rakitan
    const [saveSuccessMsg, setSaveSuccessMsg] = useState(''); // TAMBAHAN: Pesan sukses

    const { selectedParts, setPart, removePart, clearBuild, getTotalPrice } = useBuilderStore();
    const { user } = useAuthStore(); // TAMBAHAN: Cek user login

    // Fetch daftar komponen
    const { data: components, isLoading } = useQuery({
        queryKey: ['components', activeCategory],
        queryFn: async () => {
            const response = await apiClient.get(`/components?category=${activeCategory}`);
            return response.data.data as Component[];
        },
    });

    // Mutasi untuk Validasi
    const validateMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                cpuId: selectedParts.CPU?.id,
                motherboardId: selectedParts.MOTHERBOARD?.id,
                ramId: selectedParts.RAM?.id,
                gpuId: selectedParts.GPU?.id,
                psuId: selectedParts.PSU?.id,
            };
            const response = await apiClient.post('/builds/validate', payload);
            return response.data.data;
        },
        onSuccess: () => {
            setIsModalOpen(true);
            setSaveSuccessMsg(''); // Reset pesan sukses saat buka modal baru
        }
    });

    // TAMBAHAN: Mutasi untuk Menyimpan Rakitan
    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                buildName,
                cpuId: selectedParts.CPU?.id,
                motherboardId: selectedParts.MOTHERBOARD?.id,
                ramId: selectedParts.RAM?.id,
                gpuId: selectedParts.GPU?.id,
                psuId: selectedParts.PSU?.id,
            };
            const response = await apiClient.post('/builds/save', payload);
            return response.data;
        },
        onSuccess: () => {
            setSaveSuccessMsg('DATA_SAVED_SUCCESSFULLY!');
            setBuildName('');
            clearBuild(); // Opsional: Kosongkan build setelah disimpan
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'GAGAL MENYIMPAN RAKITAN');
        }
    });

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <header className="pixel-panel p-4 mb-8 text-center w-full max-w-6xl">
                <h1 className="text-4xl md:text-5xl uppercase tracking-widest text-pc-cream">
                    SYSTEM_BUILDER_
                </h1>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                {/* KOLOM KIRI (Tetap sama seperti sebelumnya) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="pixel-panel p-4">
                        <h2 className="text-3xl mb-4 border-b-4 border-pc-blue pb-2 uppercase">My Build</h2>

                        <div className="flex flex-col gap-3">
                            {CATEGORIES.map((cat) => {
                                const part = selectedParts[cat];
                                return (
                                    <div
                                        key={cat}
                                        className={`p-3 border-4 cursor-pointer transition-none ${activeCategory === cat ? 'border-pc-cream bg-pc-blue' : 'border-pc-blue bg-pc-darkest hover:border-pc-cream/50'
                                            }`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        <div className="text-sm text-pc-cream/70 font-bold mb-1">{cat}</div>
                                        {part ? (
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="text-lg leading-tight">{part.name}</div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removePart(cat); }}
                                                    className="text-red-400 hover:text-red-300 px-2 py-0.5 border-2 border-red-900 bg-red-950 cursor-pointer"
                                                >
                                                    [X]
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-lg text-pc-cream/40">[ KLIK UNTUK MEMILIH ]</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t-4 border-pc-blue">
                            <div className="text-xl text-pc-cream/80">TOTAL ESTIMASI</div>
                            <div className="text-4xl text-green-400">{formatRupiah(getTotalPrice())}</div>
                        </div>

                        <button
                            onClick={() => validateMutation.mutate()}
                            disabled={validateMutation.isPending}
                            className="pixel-btn w-full mt-6 text-2xl flex justify-center items-center"
                        >
                            {validateMutation.isPending ? 'PROCESSING...' : 'VALIDATE_BUILD'}
                        </button>
                    </div>
                </div>

                {/* KOLOM KANAN (Tetap sama seperti sebelumnya) */}
                <div className="lg:col-span-7">
                    <div className="pixel-panel p-4 min-h-[600px]">
                        <h2 className="text-3xl mb-4 border-b-4 border-pc-blue pb-2 uppercase">
                            SELECT {activeCategory}
                        </h2>

                        {isLoading ? (
                            <div className="text-2xl text-center py-20 animate-pulse">LOADING_DATA...</div>
                        ) : components?.length === 0 ? (
                            <div className="text-2xl text-center py-20 text-pc-cream/50">NO_DATA_FOUND</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {components?.map((comp) => {
                                    const lowestPrice = comp.listings?.[0]?.price;

                                    return (
                                        <div key={comp.id} className="border-4 border-pc-blue p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-pc-cream transition-none bg-pc-darkest">
                                            <div>
                                                <div className="text-xl font-bold">{comp.name}</div>
                                                <div className="text-pc-cream/60">Brand: {comp.brand}</div>
                                                {lowestPrice ? (
                                                    <div className="text-2xl text-green-400 mt-2">Mulai {formatRupiah(lowestPrice)}</div>
                                                ) : (
                                                    <div className="text-xl text-yellow-500 mt-2">Harga Belum Tersedia</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setPart(activeCategory, comp)}
                                                className="pixel-btn px-4 py-1 text-xl shrink-0"
                                            >
                                                [ ADD ]
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* MODAL VALIDASI RETRO */}
            {isModalOpen && validateMutation.data && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="pixel-panel p-6 max-w-2xl w-full">
                        <h2 className="text-4xl mb-6 border-b-4 border-pc-blue pb-2 text-center uppercase">
                            SYSTEM_DIAGNOSTIC
                        </h2>

                        <div className="space-y-6">
                            <div className="text-2xl">
                                Status: {' '}
                                {validateMutation.data.isCompatible ? (
                                    <span className="text-green-400 font-bold bg-green-950 px-2 py-1">[ COMPATIBLE ]</span>
                                ) : (
                                    <span className="text-red-500 font-bold bg-red-950 px-2 py-1">[ INCOMPATIBLE ]</span>
                                )}
                            </div>

                            <div className="text-2xl">
                                Estimasi Daya: <span className="text-yellow-400">{validateMutation.data.estimatedWattage} W</span>
                            </div>

                            {validateMutation.data.errors.length > 0 && (
                                <div className="bg-red-950 border-4 border-red-900 p-4">
                                    <h3 className="text-2xl text-red-400 mb-2">! ERROR_DETECTED !</h3>
                                    <ul className="list-disc list-inside text-xl space-y-1 text-red-200">
                                        {validateMutation.data.errors.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validateMutation.data.warnings.length > 0 && (
                                <div className="bg-yellow-950 border-4 border-yellow-900 p-4">
                                    <h3 className="text-2xl text-yellow-400 mb-2">? WARNINGS ?</h3>
                                    <ul className="list-disc list-inside text-xl space-y-1 text-yellow-200">
                                        {validateMutation.data.warnings.map((warn: string, i: number) => (
                                            <li key={i}>{warn}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* TAMBAHAN: FITUR SAVE BUILD JIKA KOMPATIBEL */}
                            {validateMutation.data.isCompatible && (
                                <div className="mt-6 p-4 border-4 border-green-900 bg-green-950/30">
                                    {saveSuccessMsg ? (
                                        <div className="text-3xl text-green-400 text-center blink animate-pulse">
                                            {saveSuccessMsg}
                                        </div>
                                    ) : user ? (
                                        <div className="flex flex-col gap-4">
                                            <label className="text-2xl text-green-400">ENTER_BUILD_NAME_</label>
                                            <input
                                                type="text"
                                                value={buildName}
                                                onChange={(e) => setBuildName(e.target.value)}
                                                placeholder="e.g. MONSTER_RIG_01"
                                                className="bg-pc-darkest border-4 border-green-700 text-pc-cream p-2 text-2xl focus:outline-none focus:border-green-400 transition-none"
                                            />
                                            <button
                                                onClick={() => saveMutation.mutate()}
                                                disabled={saveMutation.isPending || !buildName}
                                                className="pixel-btn bg-green-800 border-green-400 hover:bg-green-400 hover:text-pc-darkest disabled:opacity-50"
                                            >
                                                {saveMutation.isPending ? 'WRITING_TO_DATABASE...' : 'SAVE_TO_DATABASE'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-2xl text-yellow-400 text-center p-2 border-2 border-yellow-900">
                                            [ AUTH_REQUIRED: LOGIN TO SAVE BUILD ]
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="pixel-btn text-2xl"
                            >
                                CLOSE_TERMINAL
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}