import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductListing } from '../types';
import { formatRupiah } from '../utils/format';

interface PriceChartProps {
    listings: ProductListing[];
}

export default function PriceChart({ listings }: PriceChartProps) {
    // 1. Transformasi Data: Menggabungkan riwayat harga dari semua toko
    // Untuk MVP, kita ambil riwayat harga dari listing pertama (termurah/utama)
    const mainListing = listings[0];

    if (!mainListing || !mainListing.priceHistories || mainListing.priceHistories.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center border-4 border-pc-blue bg-pc-darkest">
                <span className="text-xl text-pc-cream/50">[ DATA RIWAYAT HARGA TIDAK CUKUP ]</span>
            </div>
        );
    }

    // Format data untuk Recharts
    const chartData = mainListing.priceHistories.map((history) => {
        const date = new Date(history.recordedAt);
        return {
            // Menampilkan tanggal dan jam (cth: "27/09 14:00")
            time: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            price: history.price,
        };
    });

    // Kustomisasi Tooltip Recharts agar bergaya retro
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-pc-darkest border-4 border-pc-blue p-3 shadow-retro">
                    <p className="text-pc-cream/70 mb-1">{label}</p>
                    <p className="text-green-400 text-xl font-bold">
                        {formatRupiah(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-72 w-full bg-pc-darkest p-4 border-4 border-pc-blue font-pixel">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    {/* Grid bergaya terminal */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#22396F" opacity={0.5} />

                    <XAxis
                        dataKey="time"
                        stroke="#FCF1D0"
                        tick={{ fill: '#FCF1D0', fontSize: 14, opacity: 0.7 }}
                    />
                    <YAxis
                        stroke="#FCF1D0"
                        tick={{ fill: '#FCF1D0', fontSize: 14, opacity: 0.7 }}
                        tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}Jt`} // Format ringkas di sumbu Y
                        domain={['dataMin - 100000', 'dataMax + 100000']} // Agar grafik tidak terlalu mepet
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Garis grafik utama */}
                    <Line
                        type="stepAfter" // Gaya patah-patah khas retro (bukan kurva mulus)
                        dataKey="price"
                        stroke="#4ade80" // Warna hijau neon
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#010736', stroke: '#4ade80', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#4ade80' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}