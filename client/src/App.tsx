function App() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      {/* Banner Utama */}
      <header className="pixel-panel p-6 mb-12 text-center w-full max-w-3xl">
        <h1 className="text-6xl uppercase tracking-widest text-pc-cream">
          PC Builder
        </h1>
        <div className="mt-4 bg-pc-cream text-pc-darkest inline-block px-4 py-1 text-2xl font-bold">
          SYSTEM_READY :: V 1.0.0
        </div>
      </header>

      {/* Konten Simulasi */}
      <main className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="pixel-panel p-6">
          <h2 className="text-3xl mb-4 border-b-4 border-pc-blue pb-2">Status Sistem</h2>
          <ul className="text-2xl space-y-2 text-pc-cream/80">
            <li> CPU: [ KOSONG ]</li>
            <li> MOBO: [ KOSONG ]</li>
            <li> RAM: [ KOSONG ]</li>
          </ul>
        </div>

        <div className="flex flex-col justify-center items-center pixel-panel p-6 bg-pc-blue border-pc-cream">
          <p className="text-2xl text-center mb-6 text-pc-cream">
            Inisialisasi perakitan perangkat keras sekarang?
          </p>
          <button className="pixel-btn text-3xl uppercase">
            Mulai Rakit_
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;