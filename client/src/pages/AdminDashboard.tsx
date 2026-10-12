import { useState, useEffect, useRef } from "react";
import { createComponent, triggerSync } from "../api/admin.api";
import { apiClient } from "../api/client";

export default function AdminDashboard() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    // --- STATE UNTUK SEARCHABLE DROPDOWN ---
    const [componentList, setComponentList] = useState<{ id: string, name: string }[]>([]);
    const [selectedSyncId, setSelectedSyncId] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('ALL_COMPONENTS (BATCH SYNC)');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Ref untuk mendeteksi klik di luar dropdown agar menu tertutup
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [baseData, setBaseData] = useState({ name: '', brand: '', category: 'CPU', price: 0, imageUrl: '' });
    const [detailData, setDetailData] = useState<any>({ socket: '', cores: 0, threads: 0, tdp: 0, hasGraphics: false });

    // Fetch daftar komponen saat halaman dashboard dibuka
    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const response = await apiClient.get('/components');
                setComponentList(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil daftar komponen:", error);
            }
        };
        fetchComponents();
    }, []);

    // Effect untuk menutup dropdown saat user mengklik area luar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fungsi memfilter list berdasarkan input text
const filteredComponents = componentList.filter(comp => {
        // Jika teks masih default, tampilkan semua
        if (searchQuery === 'ALL_COMPONENTS (BATCH SYNC)') return true;
        // Jika user sudah mengetik, filter berdasarkan nama
        return comp.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Fungsi saat item di dropdown dipilih
    const handleSelectComponent = (id: string, name: string) => {
        setSelectedSyncId(id);
        setSearchQuery(name);
        setIsDropdownOpen(false);
    };

    // --- HANDLERS LAINNYA ---
    const handleTriggerSync = async () => {
        setIsSyncing(true);
        setSyncMessage('');
        try {
            const result = await triggerSync(selectedSyncId);
            setSyncMessage(result.message || '[ SYSTEM: SYNC INITIATED SUCCESSFULLY ]');
        } catch (error: any) {
            setSyncMessage(error.response?.data?.message || '[ ERROR: SYNC INITIATION FAILED ]');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBaseData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));

        if (name === 'category') {
            if (value === 'CPU') setDetailData({ socket: '', cores: 0, threads: 0, tdp: 0, hasGraphics: false });
            else if (value === 'MOTHERBOARD') setDetailData({ socket: '', formFactor: '', memoryType: '', maxMemory: 0 });
            else if (value === 'RAM') setDetailData({ memoryType: '', speed: 0, capacity: 0 });
            else if (value === 'GPU') setDetailData({ length: 0, tdp: 0 });
            else if (value === 'PSU') setDetailData({ wattage: 0, efficiency: '' });
            else setDetailData({});
        }
    };

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setDetailData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleCreateComponent = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...baseData,
            imageUrl: baseData.imageUrl.trim() === '' ? undefined : baseData.imageUrl,
            ...(baseData.category === 'CPU' && { cpuDetail: detailData }),
            ...(baseData.category === 'MOTHERBOARD' && { motherboardDetail: detailData }),
            ...(baseData.category === 'RAM' && { ramDetail: detailData }),
            ...(baseData.category === 'GPU' && { gpuDetail: detailData }),
            ...(baseData.category === 'PSU' && { psuDetail: detailData }),
        };

        try {
            await createComponent(payload);
            alert('[ SYSTEM: NEW COMPONENT ADDED TO DATABASE ]');
            setBaseData({ name: '', brand: '', category: 'CPU', price: 0, imageUrl: '' });
            setDetailData({ socket: '', cores: 0, threads: 0, tdp: 0, hasGraphics: false });
        } catch (error: any) {
            alert('[ ERROR: FAILED TO ADD COMPONENT ]\n' + (error.response?.data?.message || JSON.stringify(error.response?.data?.errors) || error.message));
        }
    };

    const renderDetailFields = () => {
        const inputClass = "bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none w-full";
        const labelClass = "text-xl text-pc-cream/80 mb-2 block";

        switch (baseData.category) {
            case 'CPU':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-pc-blue/20 p-4 border-2 border-pc-blue">
                        <div><label className={labelClass}>Socket_</label><input type="text" name="socket" value={detailData.socket} onChange={handleDetailChange} required className={inputClass} placeholder="AM4, LGA1700" /></div>
                        <div><label className={labelClass}>Cores_</label><input type="number" name="cores" value={detailData.cores} onChange={handleDetailChange} required min="1" className={inputClass} /></div>
                        <div><label className={labelClass}>Threads_</label><input type="number" name="threads" value={detailData.threads} onChange={handleDetailChange} required min="1" className={inputClass} /></div>
                        <div><label className={labelClass}>TDP (W)_</label><input type="number" name="tdp" value={detailData.tdp} onChange={handleDetailChange} required min="0" className={inputClass} /></div>
                        <div className="col-span-2 flex items-center gap-3">
                            <input type="checkbox" name="hasGraphics" checked={detailData.hasGraphics} onChange={handleDetailChange} className="w-6 h-6 accent-pc-blue" />
                            <label className={labelClass} style={{ marginBottom: 0 }}>Has Integrated Graphics (IGPU)_</label>
                        </div>
                    </div>
                );
            case 'MOTHERBOARD':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-pc-blue/20 p-4 border-2 border-pc-blue">
                        <div><label className={labelClass}>Socket_</label><input type="text" name="socket" value={detailData.socket} onChange={handleDetailChange} required className={inputClass} placeholder="AM4, LGA1700" /></div>
                        <div><label className={labelClass}>Form Factor_</label><input type="text" name="formFactor" value={detailData.formFactor} onChange={handleDetailChange} required className={inputClass} placeholder="ATX, Micro-ATX" /></div>
                        <div><label className={labelClass}>Memory Type_</label><input type="text" name="memoryType" value={detailData.memoryType} onChange={handleDetailChange} required className={inputClass} placeholder="DDR4, DDR5" /></div>
                        <div><label className={labelClass}>Max Memory (GB)_</label><input type="number" name="maxMemory" value={detailData.maxMemory} onChange={handleDetailChange} required min="1" className={inputClass} /></div>
                    </div>
                );
            case 'RAM':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-pc-blue/20 p-4 border-2 border-pc-blue">
                        <div className="col-span-2"><label className={labelClass}>Memory Type_</label><input type="text" name="memoryType" value={detailData.memoryType} onChange={handleDetailChange} required className={inputClass} placeholder="DDR4, DDR5" /></div>
                        <div><label className={labelClass}>Speed (MHz)_</label><input type="number" name="speed" value={detailData.speed} onChange={handleDetailChange} required min="0" className={inputClass} placeholder="3200" /></div>
                        <div><label className={labelClass}>Capacity (GB)_</label><input type="number" name="capacity" value={detailData.capacity} onChange={handleDetailChange} required min="1" className={inputClass} /></div>
                    </div>
                );
            case 'GPU':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-pc-blue/20 p-4 border-2 border-pc-blue">
                        <div><label className={labelClass}>Length (mm)_</label><input type="number" name="length" value={detailData.length} onChange={handleDetailChange} required min="0" className={inputClass} placeholder="Cth: 280" /></div>
                        <div><label className={labelClass}>TDP (W)_</label><input type="number" name="tdp" value={detailData.tdp} onChange={handleDetailChange} required min="0" className={inputClass} placeholder="Cth: 200" /></div>
                    </div>
                );
            case 'PSU':
                return (
                    <div className="grid grid-cols-2 gap-4 bg-pc-blue/20 p-4 border-2 border-pc-blue">
                        <div><label className={labelClass}>Wattage (W)_</label><input type="number" name="wattage" value={detailData.wattage} onChange={handleDetailChange} required min="0" className={inputClass} placeholder="Cth: 650" /></div>
                        <div><label className={labelClass}>Efficiency Rating_</label><input type="text" name="efficiency" value={detailData.efficiency} onChange={handleDetailChange} required className={inputClass} placeholder="80+ Gold, 80+ Bronze" /></div>
                    </div>
                );
            default:
                return (
                    <div className="bg-pc-blue/20 p-4 border-2 border-pc-blue text-pc-cream/60 text-lg">
                        [ SYSTEM: NO SPECIFIC DETAIL REQUIRED FOR THIS CATEGORY ]
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">

            <header className="pixel-panel p-4 mb-8 text-center w-full max-w-6xl">
                <h1 className="text-4xl md:text-5xl uppercase tracking-widest text-yellow-400">
                    [ ADMIN_CONTROL_PANEL ]
                </h1>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* BAGIAN 1: KONTROL SINKRONISASI */}
                <div className="md:col-span-5 pixel-panel p-6 h-fit">
                    <h2 className="text-3xl mb-4 border-b-4 border-pc-blue pb-2 uppercase text-pc-cream">
                        SYS_SYNC_MODULE
                    </h2>
                    <p className="text-xl text-pc-cream/60 mb-6 font-pixel">
                        &gt; Memicu web-scraper secara manual untuk memperbarui riwayat harga marketplace.
                    </p>

                    {/* --- CUSTOM SEARCHABLE DROPDOWN --- */}
                    <div className="flex flex-col gap-2 mb-6 relative" ref={dropdownRef}>
                        <label className="text-xl text-pc-cream/80">TARGET_COMPONENT_</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={(e) => {
                                setIsDropdownOpen(true);
                                e.target.select();
                            }}
                            placeholder="Ketik nama komponen..."
                            className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none w-full placeholder-pc-cream/30"
                        />

                        {isDropdownOpen && (
                            <div className="absolute top-[100%] left-0 w-full mt-1 bg-pc-darkest border-4 border-pc-blue shadow-retro max-h-60 overflow-y-auto z-50">
                                <div
                                    className="p-3 text-yellow-400 hover:bg-pc-blue hover:text-pc-cream cursor-pointer border-b-2 border-pc-blue/50"
                                    onClick={() => handleSelectComponent('ALL', 'ALL_COMPONENTS (BATCH SYNC)')}
                                >
                                    &gt; ALL_COMPONENTS (BATCH SYNC)
                                </div>
                                {filteredComponents.length > 0 ? (
                                    filteredComponents.map(comp => (
                                        <div
                                            key={comp.id}
                                            className="p-3 text-pc-cream hover:bg-pc-blue cursor-pointer border-b border-pc-blue/30"
                                            onClick={() => handleSelectComponent(comp.id, comp.name)}
                                        >
                                            - {comp.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-red-400 text-center">
                                        [ COMPONENT NOT FOUND ]
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* ------------------------------------------- */}

                    <button
                        onClick={handleTriggerSync}
                        disabled={isSyncing}
                        className={`pixel-btn w-full text-2xl py-3 flex justify-center items-center ${isSyncing
                                ? 'opacity-50 cursor-not-allowed bg-pc-dark border-pc-cream/30 text-pc-cream/50'
                                : 'bg-yellow-900 border-yellow-400 hover:bg-yellow-400 hover:text-pc-darkest text-yellow-400'
                            }`}
                    >
                        {isSyncing ? 'EXECUTING_SCRAPER...' : 'RUN_SYNC_PROTOCOL'}
                    </button>

                    {syncMessage && (
                        <div className={`mt-6 p-4 border-4 text-xl ${syncMessage.includes('ERROR') || syncMessage.includes('Gagal')
                                ? 'bg-red-950 border-red-900 text-red-400'
                                : 'bg-green-950 border-green-900 text-green-400 blink'
                            }`}>
                            {syncMessage}
                        </div>
                    )}
                </div>

                {/* BAGIAN 2: TAMBAH KOMPONEN MANUAL */}
                <div className="md:col-span-7 pixel-panel p-6">
                    <h2 className="text-3xl mb-4 border-b-4 border-pc-blue pb-2 uppercase text-pc-cream">
                        MANUAL_DATA_ENTRY
                    </h2>

                    <form onSubmit={handleCreateComponent} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xl text-pc-cream/80">BRAND_</label>
                                <input type="text" name="brand" required value={baseData.brand} onChange={handleBaseChange} className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none" placeholder="Cth: AMD, Intel, MSI" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xl text-pc-cream/80">COMPONENT_NAME_</label>
                                <input type="text" name="name" required value={baseData.name} onChange={handleBaseChange} className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none" placeholder="Cth: Ryzen 5 5600X" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xl text-pc-cream/80">CATEGORY_CLASS_</label>
                                <select name="category" value={baseData.category} onChange={handleBaseChange} className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none appearance-none cursor-pointer">
                                    <option value="CPU">CPU</option>
                                    <option value="MOTHERBOARD">Motherboard</option>
                                    <option value="RAM">RAM</option>
                                    <option value="GPU">GPU</option>
                                    <option value="PSU">PSU</option>
                                    <option value="STORAGE">Storage</option>
                                    <option value="CASE">Case</option>
                                    <option value="COOLER">Cooler</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xl text-pc-cream/80">BASE_PRICE_(IDR)_</label>
                                <input type="number" name="price" required min="0" value={baseData.price} onChange={handleBaseChange} className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xl text-pc-cream/80">IMAGE_URL_[OPTIONAL]_</label>
                            <input type="url" name="imageUrl" value={baseData.imageUrl} onChange={handleBaseChange} className="bg-pc-darkest border-4 border-pc-blue text-pc-cream p-2 text-xl focus:outline-none focus:border-pc-cream transition-none" placeholder="https://..." />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-2xl mb-2 text-pc-cream uppercase">HARDWARE_SPECIFICATIONS</h3>
                            {renderDetailFields()}
                        </div>

                        <button type="submit" className="pixel-btn w-full mt-4 text-2xl py-3 bg-green-800 border-green-400 hover:bg-green-400 hover:text-pc-darkest text-green-400">
                            INJECT_DATA_TO_SYSTEM
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}