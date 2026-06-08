import axios from "axios";

export const fetchWeatherData = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // url untuk data cuaca dalam satuan celcius
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    // URL data Kualitas Udara (AQI)
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // url untuk menampilkan ramalam cuaca
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    // memanggil kedua api secara bersamaan
    const [weatherResponse, airResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(airPollutionUrl),
        axios.get(forecastUrl)
    ]);

    return {
        weather: weatherResponse.data,
        air: airResponse.data,
        forecast: forecastResponse.data
    };
};