import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Perbaikan bug ikon marker Leaflet yang sering hilang saat di-bundle oleh Vite
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: -6.2088, lon: 106.8456 });

  // Fungsi reusable untuk mengambil data dari backend berdasarkan koordinat
  const fetchWeatherAndAir = (latitude, longitude) => {
    setLoading(true);
    setError(null); // Bersihkan error lama setiap kali ganti lokasi
    fetch(`http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        return res.json();
      })
      .then((result) => {
        // PERBAIKAN 1: Pengecekan properti status dari dalam objek JSON
        if (result.status === "success") {
          setData(result);
        } else {
          throw new Error(
            result.message || "Terjadi kesalahan pada data server",
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Deteksi lokasi awal otomatis lewat GPS Browser
  useEffect(() => {
    if (!navigator.geolocation) {
      fetchWeatherAndAir(coords.lat, coords.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        fetchWeatherAndAir(latitude, longitude);
      },
      () => {
        // Jika izin ditolak, tetap panggil data menggunakan koordinat default
        fetchWeatherAndAir(coords.lat, coords.lon);
      },
    );
  }, []);

  // Komponen internal untuk menangkap event klik pada peta Leaflet
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lon: lng });
        fetchWeatherAndAir(lat, lng);
      },
    });
    return null;
  }

  // Pengatur tema warna dinamis berdasarkan tingkat bahaya kualitas udara
  const getThemeConfig = (level) => {
    if (level === "success")
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        glow: "shadow-emerald-500/5",
      };
    if (level === "warning")
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        glow: "shadow-amber-500/5",
      };
    return {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      glow: "shadow-rose-500/5",
    };
  };

  // SCREEN AMAN 1: Tampilan Awal saat data pertama kali loading (mencegah properti null)
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-slate-300 tracking-wide animate-pulse">
          Mendeteksi Lokasi & Memuat Data...
        </p>
      </div>
    );
  }

  // SCREEN AMAN 2: Tampilan Error (Jika fetch gagal total)
  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center max-w-md shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✕
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Variabel tema baru boleh diinisialisasi setelah dipastikan objek data tidak null
  const theme = data ? getThemeConfig(data.recommendations.status_level) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:p-12 flex flex-col items-center selection:bg-blue-500/30">
      {/* HEADER INFORMASI LOKASI */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-900">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-blue-400 text-xl">📍</span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {data ? `${data.location.city}, ` : "Memuat Lokasi..."}
              {data && (
                <span className="text-slate-400 font-semibold">
                  {data.location.country}
                </span>
              )}
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Klik titik mana saja di peta untuk menganalisis daerah tersebut
            [cite: 551]
          </p>
        </div>
        <div className="flex items-center gap-4">
          {loading && (
            <div className="text-xs font-semibold text-blue-400 animate-pulse uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
              🔄 Menyingkronkan Data... [cite: 550]
            </div>
          )}
          <div className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-400 tracking-wider uppercase shadow-inner">
            ✨ Live Data [cite: 67]
          </div>
        </div>
      </header>

      {/* PERBAIKAN 2: SELURUH KOMPONEN UTAMA WAJIB DIBUNGKUS KONDISI AGAR AMAN DARI EROR NULL */}
      {data && theme && (
        <div className="w-full max-w-5xl space-y-6">
          {/* GRID CONTAINER DASHBOARD UTAMA */}
          <main className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* UTAMA KIRI: KARTU CUACA */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                    Cuaca Terkini [cite: 143]
                  </h2>
                  <span className="text-2xl animate-bounce duration-1000">
                    ☁️
                  </span>
                </div>
                <div className="my-4">
                  <p className="text-6xl font-black text-white tracking-tighter inline-block relative">
                    {data.weather.temperature_celsius}
                    <span className="text-3xl font-light text-blue-400 absolute -top-2 -right-6">
                      °C
                    </span>
                  </p>
                  <p className="text-slate-300 mt-2 text-lg font-semibold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {data.weather.condition} [cite: 143]
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Kelembapan [cite: 143]
                  </p>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">
                    {data.weather.humidity_percentage}% [cite: 143]
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Suhu Sensasi
                  </p>
                  <p className="text-lg font-bold text-slate-200 mt-0.5">
                    {data.weather.temperature_celsius}°C
                  </p>
                </div>
              </div>
            </div>

            {/* UTAMA TENGAH & KANAN: KARTU KUALITAS UDARA */}
            <div
              className={`md:col-span-2 border rounded-3xl p-6 shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${theme.bg} ${theme.glow}`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold opacity-60 tracking-widest uppercase">
                    Indeks Kualitas Udara (AQI) [cite: 1, 144]
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${theme.badge}`}
                  >
                    {data.air_quality.aqi_label} [cite: 144]
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 my-2">
                  <div>
                    <p className="text-7xl font-black tracking-tighter">
                      {data.air_quality.aqi_value}
                      <span className="text-xl font-normal opacity-40 ml-2">
                        / 5
                      </span>
                    </p>
                    <p className="text-sm font-medium opacity-80 mt-2 max-w-sm leading-relaxed">
                      Tingkat polusi udara saat ini berada pada kategori
                      berkadar{" "}
                      <span className="font-bold underline">
                        {data.air_quality.aqi_label}
                      </span>
                      . [cite: 144]
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-2xl min-w-35 text-center sm:text-right">
                    <p className="text-xs opacity-50 font-medium uppercase tracking-wider mb-0.5">
                      Partikel PM2.5
                    </p>
                    <p className="text-3xl font-black text-white">
                      {data.air_quality.pm2_5}
                    </p>
                    <p className="text-[10px] opacity-40 mt-0.5">µg/m³</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar Visual Mini skala 1 - 5 */}
              <div className="mt-6 w-full bg-slate-950/50 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800/40">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    data.air_quality.aqi_value <= 2
                      ? "bg-emerald-400"
                      : data.air_quality.aqi_value === 3
                        ? "bg-amber-400"
                        : "bg-rose-500"
                  }`}
                  style={{
                    width: `${(data.air_quality.aqi_value / 5) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </main>

          {/* PERBAIKAN 3: MEMASUKKAN KEMBALI STRUKTUR PETA INTERAKTIF YANG SEMPAT HILANG */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 px-2">
              Peta Penjelajah Wilayah{" "}
            </h2>
            <div className="h-87.5 w-full rounded-2xl overflow-hidden z-0 border border-slate-800">
              <MapContainer
                center={[coords.lat, coords.lon]}
                zoom={9}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coords.lat, coords.lon]} />
                <MapClickHandler />
              </MapContainer>
            </div>
          </div>

          {/* Button untuk reload halaman */}
          <div className="flex justify-center py-3">
            <button onClick={() => window.location.reload() } className=" cursor-pointer px-20 py-3 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-400 tracking-wider shadow-inner hover:bg-slate-600">RELOAD</button>
          </div>

          {/* KARTU BAWAH: ANALISIS REKOMENDASI KEGIATAN */}
          <section className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">💡</span>
              <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                Rekomendasi Aktivitas Sehat [cite: 145]
              </h2>
            </div>

            <div className="bg-slate-950 border border-slate-800/60 p-4 md:p-5 rounded-2xl mb-6 shadow-inner flex items-center gap-4">
              <div
                className={`w-3 h-12 rounded-full shrink-0 ${
                  data.recommendations.status_level === "success"
                    ? "bg-emerald-500"
                    : data.recommendations.status_level === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
              ></div>
              <p className="text-slate-100 text-sm md:text-base font-semibold leading-relaxed">
                {data.recommendations.headline}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recommendations.activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    activity.allowed
                      ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30"
                      : "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${
                      activity.allowed
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {activity.allowed ? "✓" : "✕"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                      {activity.name} [cite: 145]
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wide uppercase ${
                          activity.allowed
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {activity.allowed ? "Disarankan" : "Hindari"}
                      </span>
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed font-medium">
                      {activity.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="mt-12 text-center text-xs font-medium text-slate-600 tracking-wider">
        Weather & Air Quality Analyzer © 2026 • Portofolio Project [cite: 1, 9]
      </footer>
    </div>
  );
}

export default App;
