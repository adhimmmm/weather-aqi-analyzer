export const generateRecommendations = (aqi, temp) => {
  const aqiLabels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
  const label = aqiLabels[aqi] || "Unknown";

  let statusLevel = "success"; 
  let headline = "Kondisi sangat baik untuk beraktivitas di luar ruangan!";
  let allowedSports = true;
  let allowedWindow = true;

  if (aqi >= 3) {
    statusLevel = "warning";
    headline = "Kualitas udara sedang kurang sehat. Batasi aktivitas luar bagi kelompok sensitif.";
    allowedWindow = false;
  }
  
  if (aqi >= 4) {
    statusLevel = "danger";
    headline = "Kualitas udara buruk! Sebaiknya tetap berada di dalam ruangan.";
    allowedSports = false;
    allowedWindow = false;
  }

  return {
    aqi_label: label,
    status_level: statusLevel,
    headline: headline,
    activities: [
      { 
        name: "Olahraga Luar Ruangan", 
        allowed: allowedSports, 
        note: allowedSports ? "Aman dilakukan." : "Disarankan ganti dengan olahraga indoor." 
      },
      { 
        name: "Ventilasi Rumah (Buka Jendela)", 
        allowed: allowedWindow, 
        note: allowedWindow ? "Bagus untuk sirkulasi udara kamar." : "Tutup jendela untuk menghindari polutan masuk." 
      }
    ]
  };
};