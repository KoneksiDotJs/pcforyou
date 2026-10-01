export type ComponentCategory = 'CPU' | 'MOTHERBOARD' | 'RAM' | 'GPU' | 'PSU' | 'STORAGE' | 'CASE' | 'COOLER';

export interface PriceHistory {
  id: string;
  price: number;
  recordedAt: string;
}

export interface ProductListing {
  id: string;
  marketplace: 'SHOPEE' | 'TOKOPEDIA' | 'MANUAL';
  sellerName: string;
  productUrl: string;
  price: number;
  isAvailable: boolean;
  priceHistories?: PriceHistory[];
}

export interface Component {
  id: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  imageUrl: string | null;
  // Detail spesifikasi (opsional karena bergantung kategori)
  cpuDetail?: any; 
  motherboardDetail?: any;
  ramDetail?: any;
  gpuDetail?: any;
  psuDetail?: any;
  // Data harga dari backend
  listings?: ProductListing[];
}