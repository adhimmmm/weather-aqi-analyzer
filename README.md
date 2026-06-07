# 🌍 Weather & Air Quality Analyzer

Aplikasi web *Fullstack* modern yang berfungsi untuk menganalisis cuaca dan tingkat polusi kualitas udara (AQI) secara *real-time* berdasarkan lokasi pengguna atau melalui titik koordinat yang dipilih langsung pada peta interaktif. Aplikasi ini juga dilengkapi dengan sistem logika yang memberikan rekomendasi aktivitas harian yang aman bagi kesehatan.

---

## 🚀 Fitur Utama

- **📍 HTML5 Geolocation Otomatis**: Mendeteksi lokasi terkini pengguna menggunakan GPS bawaan browser saat aplikasi pertama kali dibuka.
- **🗺️ Peta Interaktif Leaflet**: Memungkinkan pengguna untuk menjelajah dan mengklik area atau kota mana pun di seluruh dunia untuk memperbarui analisis data cuaca secara instan.
- **☁️ Dasbor Cuaca Real-Time**: Menampilkan informasi suhu (°C), kondisi cuaca (berawan, hujan, cerah), dan persentase kelembapan.
- **🧬 Indikator AQI (Air Quality Index) Dinamis**: Menampilkan tingkat keparahan polusi udara skala 1-5 dan kadar partikel PM2.5, lengkap dengan perubahan tema warna otomatis (*Glow Effect*) sesuai tingkat bahaya polusi.
- **💡 Rekomendasi Aktivitas Sehat**: Memberikan panduan aktivitas harian yang dikalkulasi secara cerdas di sisi *backend* (misalnya: izin berolahraga di luar ruangan atau membuka jendela rumah).
- **🔒 Backend API Proxy (Security Key)**: Mengamankan kredensial API Key pihak ketiga agar tidak bocor atau diintip melalui browser.

---

## 🛠️ Pustaka & Teknologi (Tech Stack)

### Sisi Backend
- **Runtime**: Node.js (ES Modules - modern syntax)
- **Framework**: Express.js
- **HTTP Client**: Axios (untuk *dual-fetch* API OpenWeatherMap secara asinkron via `Promise.all`)
- **Utilitas**: Dotenv (manajemen variabel lingkungan) & CORS (izin jembatan data lintas port)
- **Development Tool**: Nodemon (auto-restart server)

### Sisi Frontend
- **Framework**: React.js (di-build menggunakan bundler super cepat Vite)
- **Styling**: Tailwind CSS v4 (integrasi mutakhir langsung di `vite.config.js`)
- **Mapping Library**: Leaflet & React-Leaflet (peta interaktif global gratis tanpa API Key)

---

## 📁 Struktur Folder Proyek

```text
weather-aqi-analyzer/
├── backend/
│   ├── services/
│   │   └── weatherService.js   # Modul fetch data OpenWeatherMap
│   ├── utils/
│   │   └── recommender.js      # Algoritma logika rekomendasi kegiatan
│   ├── .env                    # Berkas rahasia API Key & Port (Jangan di-push ke Git)
│   ├── .env.example            # Berkas contoh konfigurasi lingkungan
│   ├── server.js               # Gerbang utama server API Express
│   └── package.json            # Konfigurasi dependensi backend
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Komponen visual utama & logika state React
│   │   ├── main.jsx            # Entry point aplikasi React
│   │   └── index.css           # Konfigurasi impor dasar Tailwind CSS
│   ├── index.html
│   ├── vite.config.js          # Pengaturan Vite & integrasi compiler Tailwind v4
│   └── package.json            # Konfigurasi dependensi frontend
└── .gitignore                  # Berkas proteksi pengabaian unggahan berkas sensitif
