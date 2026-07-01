export interface WeatherLocation {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  time: string;
}

export interface DailyForecastEntry {
  date: string;
  weatherCode: number;
  weatherDescription: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  precipitationProbabilityMax: number | null;
  windSpeedMaxKmh: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherForecast {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecastEntry[];
}

export interface WeatherForecastOptions {
  days?: number;
}
