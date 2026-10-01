import { prisma } from "../lib/prisma";

interface BuildPayload {
  cpuId?: string;
  motherboardId?: string;
  ramId?: string;
  gpuId?: string;
  psuId?: string;
}

export const checkCompatibility = async (build: BuildPayload) => {
  const result = {
    isCompatible: true,
    estimatedWattage: 0,
    errors: [] as string[],
    warnings: [] as string[],
  };

// Mengambil data komponen yang ada di payload (Parallel Fetching agar cepat)
  const [cpu, mobo, ram, gpu, psu] = await Promise.all([
    build.cpuId ? prisma.component.findUnique({ where: { id: build.cpuId }, include: { cpuDetail: true } }) : null,
    build.motherboardId ? prisma.component.findUnique({ where: { id: build.motherboardId }, include: { motherboardDetail: true } }) : null,
    build.ramId ? prisma.component.findUnique({ where: { id: build.ramId }, include: { ramDetail: true } }) : null,
    build.gpuId ? prisma.component.findUnique({ where: { id: build.gpuId }, include: { gpuDetail: true } }) : null,
    build.psuId ? prisma.component.findUnique({ where: { id: build.psuId }, include: { psuDetail: true } }) : null,
  ]);

  // Kalkulasi Estimasi Daya Total (TDP)
  // Menambahkan konstanta statis 50 Watt untuk Motherboard, RAM, dan Kipas Casing
  const baseSystemWattage = 50; 
  if (cpu?.cpuDetail) result.estimatedWattage += cpu.cpuDetail.tdp;
  if (gpu?.gpuDetail) result.estimatedWattage += gpu.gpuDetail.tdp;
  if (cpu || gpu) result.estimatedWattage += baseSystemWattage;

  // 1. Validasi CPU vs Motherboard (Socket)
  if (cpu?.cpuDetail && mobo?.motherboardDetail) {
    if (cpu.cpuDetail.socket !== mobo.motherboardDetail.socket) {
      result.isCompatible = false;
      result.errors.push(`Socket tidak cocok: ${cpu.name} (${cpu.cpuDetail.socket}) vs ${mobo.name} (${mobo.motherboardDetail.socket}).`);
    }
  }

  // 2. Validasi Motherboard vs RAM (Memory Type & Capacity)
  if (mobo?.motherboardDetail && ram?.ramDetail) {
    if (mobo.motherboardDetail.memoryType !== ram.ramDetail.memoryType) {
      result.isCompatible = false;
      result.errors.push(`Tipe RAM tidak didukung: ${mobo.name} hanya mendukung ${mobo.motherboardDetail.memoryType}, sedangkan RAM adalah ${ram.ramDetail.memoryType}.`);
    }

    if (ram.ramDetail.capacity > mobo.motherboardDetail.maxMemory) {
      result.isCompatible = false;
      result.errors.push(`Kapasitas RAM berlebih: ${mobo.name} hanya menampung maksimal ${mobo.motherboardDetail.maxMemory}GB.`);
    }
  }

  // 3. Validasi PSU vs Total Estimasi Daya
  if (psu?.psuDetail && result.estimatedWattage > 0) {
    // Memberikan headroom/batasan aman 20% untuk menghindari PSU meledak/spike voltage
    const recommendedWattage = result.estimatedWattage * 1.2;
    
    if (psu.psuDetail.wattage < result.estimatedWattage) {
      result.isCompatible = false;
      result.errors.push(`Bahaya! Kapasitas PSU (${psu.psuDetail.wattage}W) lebih kecil dari kebutuhan sistem (${result.estimatedWattage}W). PC akan mati mendadak saat full load.`);
    } else if (psu.psuDetail.wattage < recommendedWattage) {
      result.warnings.push(`Kapasitas PSU (${psu.psuDetail.wattage}W) cukup, tetapi disarankan menggunakan setidaknya ${Math.ceil(recommendedWattage)}W untuk margin keamanan.`);
    }
  }

  // 4. Validasi Display Output (Peringatan Jika tidak ada pengolah grafis)
  if (cpu?.cpuDetail && !gpu?.gpuDetail && !cpu.cpuDetail.hasGraphics) {
    result.warnings.push(`Sistem ini tidak memiliki pengolah grafis. Prosesor ${cpu.name} tidak memiliki Integrated Graphics, jadi kamu wajib memasang GPU eksternal untuk menampilkan gambar ke monitor.`);
  }

  return result;
};