import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWeatherForecast, searchWeatherLocations } from "./index.js";

const geocodingResults: Record<
  string,
  Array<{
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }>
> = {
  jakarta: [
    {
      name: "Jakarta",
      country: "Indonesia",
      admin1: "Jakarta",
      latitude: -6.2146,
      longitude: 106.8451,
      timezone: "Asia/Jakarta",
    },
  ],
  london: [
    {
      name: "London",
      country: "United Kingdom",
      admin1: "England",
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: "Europe/London",
    },
  ],
  tokyo: [
    {
      name: "Tokyo",
      country: "Japan",
      admin1: "Tokyo",
      latitude: 35.6895,
      longitude: 139.6917,
      timezone: "Asia/Tokyo",
    },
  ],
  "new york": [
    {
      name: "New York",
      country: "United States",
      admin1: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
    },
  ],
  paris: [
    {
      name: "Paris",
      country: "France",
      admin1: "Ile-de-France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
    },
  ],
  springfield: [
    {
      name: "Springfield",
      country: "United States",
      admin1: "Illinois",
      latitude: 39.7817,
      longitude: -89.6501,
      timezone: "America/Chicago",
    },
    {
      name: "Springfield",
      country: "United States",
      admin1: "Missouri",
      latitude: 37.2153,
      longitude: -93.2982,
      timezone: "America/Chicago",
    },
    {
      name: "Springfield",
      country: "United States",
      admin1: "Massachusetts",
      latitude: 42.1015,
      longitude: -72.5898,
      timezone: "America/New_York",
    },
  ],
};

function buildDailyArray<T>(days: number, value: (i: number) => T): T[] {
  return Array.from({ length: days }, (_, i) => value(i));
}

function mockForecastResponse(days: number) {
  return {
    current: {
      time: "2024-06-01T12:00",
      temperature_2m: 28.5,
      apparent_temperature: 31.2,
      relative_humidity_2m: 65,
      wind_speed_10m: 12.4,
      wind_direction_10m: 180,
      precipitation: 0,
      weather_code: 1,
      is_day: 1,
    },
    daily: {
      time: buildDailyArray(days, (i) => `2024-06-0${i + 1}`),
      weather_code: buildDailyArray(days, () => 1),
      temperature_2m_max: buildDailyArray(days, () => 30),
      temperature_2m_min: buildDailyArray(days, () => 22),
      precipitation_sum: buildDailyArray(days, () => 0),
      precipitation_probability_max: buildDailyArray(days, () => 10),
      wind_speed_10m_max: buildDailyArray(days, () => 15),
      sunrise: buildDailyArray(days, (i) => `2024-06-0${i + 1}T05:30`),
      sunset: buildDailyArray(days, (i) => `2024-06-0${i + 1}T18:00`),
    },
  };
}

vi.mock("ofetch", () => ({
  ofetch: vi.fn((url: string) => {
    if (url.includes("geocoding-api.open-meteo.com")) {
      const urlObj = new URL(url);
      const name = (urlObj.searchParams.get("name") ?? "").toLowerCase();
      const results = geocodingResults[name];
      return { results };
    }
    if (url.includes("api.open-meteo.com")) {
      const urlObj = new URL(url);
      const days = parseInt(urlObj.searchParams.get("forecast_days") ?? "7");
      return mockForecastResponse(days);
    }
    throw new Error(`Unexpected URL: ${url}`);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Weather Forecast Scraper", () => {
  describe("getWeatherForecast", () => {
    it("returns forecast data for a known city", async () => {
      const result = await getWeatherForecast("Jakarta");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.location.name).toBe("Jakarta");
      expect(typeof result.data.current.temperatureC).toBe("number");
      expect(typeof result.data.current.weatherDescription).toBe("string");
      expect(Array.isArray(result.data.daily)).toBe(true);
      expect(result.data.daily.length).toBeGreaterThan(0);
    });

    it("respects the days option", async () => {
      const result = await getWeatherForecast("London", { days: 3 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.daily.length).toBe(3);
    });

    it("returns all required current weather fields", async () => {
      const result = await getWeatherForecast("Tokyo");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const current = result.data.current;
      expect(typeof current.temperatureC).toBe("number");
      expect(typeof current.apparentTemperatureC).toBe("number");
      expect(typeof current.humidity).toBe("number");
      expect(typeof current.windSpeedKmh).toBe("number");
      expect(typeof current.isDay).toBe("boolean");
      expect(typeof current.time).toBe("string");
    });

    it("returns daily forecast entries with required fields", async () => {
      const result = await getWeatherForecast("New York");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data.daily[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.date).toBe("string");
      expect(typeof first.temperatureMaxC).toBe("number");
      expect(typeof first.temperatureMinC).toBe("number");
      expect(typeof first.sunrise).toBe("string");
      expect(typeof first.sunset).toBe("string");
    });

    it("returns NOT_FOUND for a nonsense location", async () => {
      const result = await getWeatherForecast(
        "zzzznonexistentplacezzzz12345"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("clamps days above 16 down to 16", async () => {
      const result = await getWeatherForecast("Jakarta", { days: 30 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.daily.length).toBe(16);
    });

    it("returns VALIDATION_ERROR when the forecast response shape is unexpected", async () => {
      const { ofetch } = await import("ofetch");
      vi.mocked(ofetch).mockImplementationOnce((url: string) => {
        // geocoding call succeeds normally
        const urlObj = new URL(url);
        const name = (urlObj.searchParams.get("name") ?? "").toLowerCase();
        return Promise.resolve({ results: geocodingResults[name] });
      });
      vi.mocked(ofetch).mockImplementationOnce(() =>
        Promise.resolve({ unexpected: "shape" })
      );

      const result = await getWeatherForecast("Jakarta");

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("searchWeatherLocations", () => {
    it("returns multiple location matches", async () => {
      const result = await searchWeatherLocations("Springfield");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns locations with required fields", async () => {
      const result = await searchWeatherLocations("Paris");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.name).toBe("string");
      expect(typeof first.country).toBe("string");
      expect(typeof first.latitude).toBe("number");
      expect(typeof first.longitude).toBe("number");
    });
  });
});
