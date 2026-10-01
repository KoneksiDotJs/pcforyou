import axios from 'axios';
import { Marketplace } from '../../generated/prisma/client';

export interface ScrapedProduct {
  marketplace: Marketplace;
  sellerName: string;
  productUrl: string;
  price: number;
  isAvailable: boolean;
}

// 1. Adapter Tokopedia (Contoh jika menggunakan Third-Party API seperti ReefAPI)
const scrapeTokopedia = async (keyword: string): Promise<ScrapedProduct> => {
  try {
    // REAL WORLD: Gunakan Axios untuk memanggil endpoint API
    // const response = await axios.get(`https://api.reefapi.com/search?q=${keyword}&api_key=SECRET`);
    // return { price: response.data.price, ... }

    // SIMULASI UNTUK MVP:
    return {
      marketplace: 'TOKOPEDIA',
      sellerName: 'Toko Official (Simulasi)',
      productUrl: `https://tokopedia.com/search?q=${encodeURIComponent(keyword)}`,
      price: Math.floor(Math.random() * (3000000 - 1500000 + 1)) + 1500000,
      isAvailable: true,
    };
  } catch (error) {
    console.error('[Scraper] Gagal fetch Tokopedia:', error);
    throw error;
  }
};

// 2. Adapter Shopee
const scrapeShopee = async (keyword: string): Promise<ScrapedProduct> => {
  return {
    marketplace: 'SHOPEE',
    sellerName: 'Shopee Mall (Simulasi)',
    productUrl: `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`,
    price: Math.floor(Math.random() * (2800000 - 1400000 + 1)) + 1400000, // Harga shopee seringkali sedikit berbeda
    isAvailable: true,
  };
};

// 3. Main Engine: Menggabungkan semua sumber
export const fetchMarketplacePrices = async (keyword: string): Promise<ScrapedProduct[]> => {
  console.log(`[Scraper Service] Mengambil data dari berbagai sumber untuk: ${keyword}`);
  
  // Menjalankan pencarian secara paralel (bersamaan) untuk mempercepat waktu respons
  const results = await Promise.allSettled([
    scrapeTokopedia(keyword),
    scrapeShopee(keyword)
  ]);

  const validProducts: ScrapedProduct[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      validProducts.push(result.value);
    }
  });

  return validProducts;
};