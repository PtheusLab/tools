import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import { buildUrl } from "../../../utils/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  WeatherLocation,
  WeatherForecast,
  WeatherForecastOptions,
} from "./types.js";

const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/";
const FORECAST_BASE = "https://api.open-meteo.com/v1/";

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function describeWeatherCode(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? "Unknown";
}

const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string().optional(),
        admin1: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
        timezone: z.string().optional(),
      })
    )
    .optional(),
});

const forecastSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    precipitation: z.number().nullable().optional(),
    weather_code: z.number(),
    is_day: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number().nullable()).optional(),
    precipitation_probability_max: z.array(z.number().nullable()).optional(),
    wind_speed_10m_max: z.array(z.number()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
  }),
});

async function resolveLocation(
  query: string,
  client: ReturnType<typeof createHttpClient>
): Promise<Result<WeatherLocation>> {
  const url = buildUrl(GEOCODING_BASE, "search", {
    name: query,
    count: 1,
    language: "en",
    format: "json",
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = geocodingSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected geocoding API response shape",
        cause: parsed.error,
      });
    }

    const first = parsed.data.results?.[0];

    if (!first) {
      return err({
        code: "NOT_FOUND",
        message: `Location not found: ${query}`,
      });
    }

    return ok({
      name: first.name,
      country: first.country ?? null,
      admin1: first.admin1 ?? null,
      latitude: first.latitude,
      longitude: first.longitude,
      timezone: first.timezone ?? "UTC",
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getWeatherForecast(
  location: string,
  forecastOptions: WeatherForecastOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WeatherForecast>> {
  const client = createHttpClient(scraperOptions);
  const days = Math.min(Math.max(forecastOptions.days ?? 7, 1), 16);

  const locationResult = await resolveLocation(location, client);
  if (!locationResult.success) {
    return err(locationResult.error);
  }

  const loc = locationResult.data;

  const url = buildUrl(FORECAST_BASE, "forecast", {
    latitude: loc.latitude,
    longitude: loc.longitude,
    timezone: loc.timezone,
    forecast_days: days,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset",
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = forecastSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected forecast API response shape",
        cause: parsed.error,
      });
    }

    const data = parsed.data;

    return ok({
      location: loc,
      current: {
        temperatureC: data.current.temperature_2m,
        apparentTemperatureC: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        windSpeedKmh: data.current.wind_speed_10m,
        windDirectionDeg: data.current.wind_direction_10m,
        precipitationMm: data.current.precipitation ?? 0,
        weatherCode: data.current.weather_code,
        weatherDescription: describeWeatherCode(data.current.weather_code),
        isDay: data.current.is_day === 1,
        time: data.current.time,
      },
      daily: data.daily.time.map((date, i) => ({
        date,
        weatherCode: data.daily.weather_code[i] ?? 0,
        weatherDescription: describeWeatherCode(
          data.daily.weather_code[i] ?? 0
        ),
        temperatureMaxC: data.daily.temperature_2m_max[i] ?? 0,
        temperatureMinC: data.daily.temperature_2m_min[i] ?? 0,
        precipitationSumMm: data.daily.precipitation_sum?.[i] ?? 0,
        precipitationProbabilityMax:
          data.daily.precipitation_probability_max?.[i] ?? null,
        windSpeedMaxKmh: data.daily.wind_speed_10m_max[i] ?? 0,
        sunrise: data.daily.sunrise[i] ?? "",
        sunset: data.daily.sunset[i] ?? "",
      })),
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function searchWeatherLocations(
  query: string,
  scraperOptions?: ScraperOptions
): Promise<Result<WeatherLocation[]>> {
  const client = createHttpClient(scraperOptions);

  const url = buildUrl(GEOCODING_BASE, "search", {
    name: query,
    count: 10,
    language: "en",
    format: "json",
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = geocodingSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected geocoding API response shape",
        cause: parsed.error,
      });
    }

    const results = parsed.data.results ?? [];

    return ok(
      results.map((r) => ({
        name: r.name,
        country: r.country ?? null,
        admin1: r.admin1 ?? null,
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone ?? "UTC",
      }))
    );
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
