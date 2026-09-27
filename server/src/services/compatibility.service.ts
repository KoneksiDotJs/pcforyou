import { prisma } from "../lib/prisma";

interface BuildPayload {
  cpuId?: string;
  motherboardId?: string;
}

export const checkCompatibility = async (build: BuildPayload) => {
  const result = {
    isCompatible: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  // Validasi CPU vs Motherboard (Jika keduanya dipilih oleh user)
  if (build.cpuId && build.motherboardId) {
    const cpu = await prisma.component.findUnique({
      where: { id: build.cpuId },
      include: { cpuDetail: true },
    });

    const mobo = await prisma.component.findUnique({
      where: { id: build.motherboardId },
      include: { motherboardDetail: true },
    });

    if (cpu?.cpuDetail && mobo?.motherboardDetail) {
      // Pengecekan Socket
      if (cpu.cpuDetail.socket !== mobo.motherboardDetail.socket) {
        result.isCompatible = false;
        result.errors.push(
          `Incompatible Socket: ${cpu.name} menggunakan socket ${cpu.cpuDetail.socket}, sedangkan ${mobo.name} menggunakan socket ${mobo.motherboardDetail.socket}.`
        );
      } else {
        // Contoh implementasi Warning untuk edge-case di masa depan
        if (cpu.cpuDetail.socket === 'AM4') {
          result.warnings.push(
            'Beberapa Motherboard AM4 mungkin membutuhkan update BIOS untuk prosesor seri tertentu.'
          );
        }
      }
    } else {
      result.errors.push('Data detail spesifikasi tidak ditemukan di database.');
    }
  }

  return result;
};