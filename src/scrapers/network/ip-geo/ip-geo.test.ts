import { describe, it, expect } from "vitest";
import { getIpGeoLocation } from "./index.js";

describe("IP Geolocation Scraper", () => {
  describe("getIpGeoLocation", () => {
    it("returns geolocation data for a known public IP", async () => {
      const result = await getIpGeoLocation("8.8.8.8");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.ip).toBe("8.8.8.8");
      expect(result.data.country).toBe("United States");
      expect(result.data.countryCode).toBe("US");
    });

    it("returns all required fields with correct types", async () => {
      const result = await getIpGeoLocation("1.1.1.1");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const data = result.data;
      expect(typeof data.ip).toBe("string");
      expect(typeof data.country).toBe("string");
      expect(typeof data.countryCode).toBe("string");
      expect(typeof data.region).toBe("string");
      expect(typeof data.city).toBe("string");
      expect(typeof data.latitude).toBe("number");
      expect(typeof data.longitude).toBe("number");
      expect(typeof data.timezone).toBe("string");
      expect(typeof data.isp).toBe("string");
      expect(typeof data.mobile).toBe("boolean");
      expect(typeof data.proxy).toBe("boolean");
      expect(typeof data.hosting).toBe("boolean");
    });

    it("returns valid latitude and longitude ranges", async () => {
      const result = await getIpGeoLocation("8.8.8.8");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.latitude).toBeGreaterThanOrEqual(-90);
      expect(result.data.latitude).toBeLessThanOrEqual(90);
      expect(result.data.longitude).toBeGreaterThanOrEqual(-180);
      expect(result.data.longitude).toBeLessThanOrEqual(180);
    });

    it("returns NOT_FOUND for an invalid IP address", async () => {
      const result = await getIpGeoLocation("not-a-valid-ip");

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("resolves the requester's own IP when no argument is given", async () => {
      const result = await getIpGeoLocation();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.ip).toBe("string");
      expect(result.data.ip.length).toBeGreaterThan(0);
    });
  });
});
