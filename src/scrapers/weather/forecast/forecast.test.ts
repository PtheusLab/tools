import { describe, it, expect } from "vitest";
import { getWeatherForecast, searchWeatherLocations } from "./index.js";

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
