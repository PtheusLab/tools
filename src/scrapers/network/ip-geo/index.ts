import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type { IpGeoLocation } from "./types.js";

const IPWHOIS_BASE = "https://ipwho.is";

const ipWhoisSuccessSchema = z.object({
  success: z.literal(true),
  ip: z.string(),
  country: z.string(),
  country_code: z.string(),
  region: z.string(),
  city: z.string(),
  postal: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.object({ id: z.string() }).passthrough(),
  connection: z
    .object({
      isp: z.string().nullable().optional(),
      org: z.string().nullable().optional(),
      asn: z.union([z.number(), z.string()]).nullable().optional(),
    })
    .optional(),
  security: z
    .object({
      proxy: z.boolean().optional(),
      vpn: z.boolean().optional(),
      hosting: z.boolean().optional(),
    })
    .optional(),
});

const ipWhoisFailSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
});

export async function getIpGeoLocation(
  ip: string = "",
  options?: ScraperOptions
): Promise<Result<IpGeoLocation>> {
  const client = createHttpClient(options);
  const target = ip.trim();
  const url = `${IPWHOIS_BASE}/${encodeURIComponent(target)}`;

  try {
    const raw = await client.get<unknown>(url);

    const failParsed = ipWhoisFailSchema.safeParse(raw);
    if (failParsed.success) {
      return err({
        code: "NOT_FOUND",
        message: failParsed.data.message || "IP address lookup failed",
      });
    }

    const parsed = ipWhoisSuccessSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected IP geolocation API response shape",
        cause: parsed.error,
      });
    }

    const data = parsed.data;
    const asn = data.connection?.asn;

    return ok({
      ip: data.ip,
      hostname: null,
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      regionName: data.region,
      city: data.city,
      zip: data.postal ?? "",
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone.id,
      isp: data.connection?.isp ?? data.connection?.org ?? "",
      org: data.connection?.org ?? null,
      asNumber: asn !== undefined && asn !== null ? String(asn) : null,
      mobile: false,
      proxy: data.security?.proxy ?? data.security?.vpn ?? false,
      hosting: data.security?.hosting ?? false,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

