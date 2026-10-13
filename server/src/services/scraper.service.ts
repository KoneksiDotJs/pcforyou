import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Marketplace } from '../../generated/prisma/client';

// Gunakan plugin stealth untuk memanipulasi sidik jari browser agar tidak terdeteksi sebagai bot
puppeteer.use(StealthPlugin());

export interface ScrapedProduct {
  marketplace: Marketplace;
  sellerName: string;
  productUrl: string;
  price: number;
  isAvailable: boolean;
}

// Fungsi pembantu untuk membersihkan format harga (Rp 2.500.000 -> 2500000)
const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
};

export const scrapeTokopedia = async (keyword: string): Promise<ScrapedProduct> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const searchUrl = `https://www.tokopedia.com/search?q=${encodeURIComponent(keyword)}&st=product`;
    console.log(`[Scraper] Membuka URL: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));

    // 1. TEKNIK SCROLLING ALA MANUSIA (Sangat Krusial)
    console.log(`[Scraper] Menggulir halaman untuk memuat produk organik...`);
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 400;

        const timer = setInterval(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 5000) {
            clearInterval(timer);
            resolve();
          }
        }, 800);
      });
    });

    await new Promise(r => setTimeout(r, 2000));

    // 2. Tarik SEMUA kartu produk yang berhasil dimuat ke Node.js
    const scrapedItems = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(`[data-testid="divProductWrapper"], 
        [data-testid="master-product-card"],
        [class="pcv3__container"], [class="css-jza1fo"]`));

      const items: any[] = [];
      //   return cards.map(card => {
      //     const titleEl = card.querySelector('[class="+tnoqZhn89+NHUA43BpiJg=="]');
      //     const priceEl = card.querySelector('[class="YZHqvX+8TVU2YltRC9S+oA=="]');
      //     const linkEl = card.querySelector('a');
      //     const shopEl = card.querySelector('[class="si3CNdiG8AR0EaXvf6bFbQ== gxi+fsEljOjqhjSKqjE+sw== flip"]');

      //     if (!titleEl || !priceEl) return null;

      //     return {
      //       title: (titleEl as HTMLElement).innerText,
      //       priceText: (priceEl as HTMLElement).innerText,
      //       url: linkEl ? linkEl.href : '',
      //       seller: shopEl ? (shopEl as HTMLElement).innerText : 'Toko Tokopedia'
      //     };
      //   }).filter(item => item !== null);
      // });
      cards.forEach(card => {
        // Fallback selector berlapis untuk mengatasi perubahan nama class
        const titleEl = card.querySelector('[data-testid="spnSRPProdName"], [class="+tnoqZhn89+NHUA43BpiJg=="], .prd_link-product-name');
        const priceEl = card.querySelector('[data-testid="spnSRPProdPrice"], [class="YZHqvX+8TVU2YltRC9S+oA=="], .prd_link-product-price');
        const linkEl = card.querySelector('a');
        const shopEl = card.querySelector('[data-testid="spnSRPProdTabShopLoc"], [class="si3CNdiG8AR0EaXvf6bFbQ== gxi+fsEljOjqhjSKqjE+sw== flip"], .prd_link-shop-name, .shop-name');

        if (titleEl && priceEl && linkEl) {
          items.push({
            title: (titleEl as HTMLElement).innerText.trim(),
            priceText: (priceEl as HTMLElement).innerText.trim(),
            url: linkEl.href,
            seller: shopEl ? (shopEl as HTMLElement).innerText.trim() : 'Toko Tokopedia'
          });
        }
      });

      // Menghapus duplikasi jika satu produk terdeteksi dua kali oleh multi-selector
      return Array.from(new Map(items.map(item => [item.url, item])).values());
    });

    console.log(`[Scraper] Berhasil menarik ${scrapedItems.length} produk dari halaman.`);

    if (!scrapedItems || scrapedItems.length === 0) {
      throw new Error(`Data komponen tidak ditemukan sama sekali di halaman.`);
    }

    // 3. Lakukan Penyaringan Cerdas (Filtering)
    const validItems = scrapedItems.filter(item => {
      const titleLower = item!.title.toLowerCase();
      // Mengabaikan item yang kemungkinan besar adalah PC Fullset
      return !titleLower.includes('pc ') &&
        !titleLower.includes('rakitan') &&
        !titleLower.includes('fullset') &&
        !titleLower.includes('paket') &&
        !titleLower.includes('build') &&
        !titleLower.includes('pc rakitan') &&
        !titleLower.includes('mini pc');
    });

    // 4. Pilih Produk Terbaik
    // Jika ada yang lolos filter, ambil yang pertama. Jika semuanya terfilter (sangat jarang), gunakan fallback array awal.
    const selectedProduct = validItems.length > 0 ? validItems[0] : scrapedItems[0];

    if (validItems.length === 0) {
      console.log(`[Scraper] Peringatan: Semua hasil mengandung kata terlarang. Menggunakan fallback produk pertama.`);
    }

    console.log(`[Scraper Tokopedia] Memilih: ${selectedProduct!.title} | Harga: ${selectedProduct!.priceText} | Toko: ${selectedProduct!.seller}`);

    const finalPrice = parsePrice(selectedProduct!.priceText);

    return {
      marketplace: 'TOKOPEDIA',
      sellerName: selectedProduct!.seller,
      productUrl: selectedProduct!.url,
      price: finalPrice,
      isAvailable: finalPrice > 0,
    };

  } catch (error: any) {
    console.error(`[Scraper Tokopedia Error] Gagal memproses ${keyword}:`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
};

export const fetchMarketplacePrices = async (keyword: string): Promise<ScrapedProduct[]> => {
  console.log(`[Scraper Service] Mengambil data dari berbagai sumber untuk: ${keyword}`);

  // Menjalankan pencarian secara paralel (bersamaan) untuk mempercepat waktu respons
  const results = await Promise.allSettled([
    scrapeTokopedia(keyword),
    // scrapeShopee(keyword)
  ]);

  const validProducts: ScrapedProduct[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      validProducts.push(result.value);
    }
  });

  return validProducts;
};