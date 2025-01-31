const API_KEY = 'tu_api_key_de_openweathermap';

export async function getWeather(destination: string, date: string): Promise<string> {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${destination}&appid=${API_KEY}`
    );
    const data: any = await response.json();
    return `El clima en ${destination} para la fecha ${date} es de ${data.weather[0].description}`;
}