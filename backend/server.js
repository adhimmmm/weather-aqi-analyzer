// import library
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


// import file
import { fetchWeatherData } from './services/weatherService.js';
import { generateRecommendations } from './utils/recommender.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// endpoint utama
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if(!lat || !lon) {
            return res.status(400).json({status: "error", message: "Koordinat lat dan lon wajib diisi!"});
        }

        // ambil data asli dari OpenWeather melalu services
        const rawData = await fetchWeatherData(lat, lon);

        // ambil nilai penting untuk kalkulasi rekomendasi
        const aqiValue = rawData.air.list[0].main.aqi;
        const temperature = rawData.weather.main.temp;

        // hitung rekomendasi kegiatan harian
        const recommendations = generateRecommendations(aqiValue, temperature);

        // susun struktur data json yang bersih
        const cleanResponse = {
      status: "success",
      location: {
        city: rawData.weather.name,
        country: rawData.weather.sys.country
      },
      weather: {
        temperature_celsius: temperature,
        humidity_percentage: rawData.weather.main.humidity,
        condition: rawData.weather.weather[0].main
      },
      air_quality: {
        aqi_value: aqiValue,
        aqi_label: recommendations.aqi_label,
        pm2_5: rawData.air.list[0].components.pm2_5
      },
      recommendations: {
        status_level: recommendations.status_level,
        headline: recommendations.headline,
        activities: recommendations.activities
      }
    };

    res.json(cleanResponse);

 
    } catch (error) {
        console.error(error);
        res.status(500).json({status: "error", message: "Gagal mengambil data dari server"});
    }
});


    app.listen(PORT, () => {
        console.log(`Server backend berjalan`)
    })