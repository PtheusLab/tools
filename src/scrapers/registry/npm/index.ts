import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import { buildUrl } from "../../../utils/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  NpmPackage,
  NpmPerson,
  NpmSearchResult,
  NpmSearchOptions,
} from "./types.js";

const NPM_REGISTRY_BASE = "https://registry.npmjs.org";
const NPM_API_BASE = "https://api.npmjs.org";

const npmPersonSchema = z
  .union([
    z.object({
      name: z.string(),
      email: z.string().optional(),
      url: z.string().optional(),
    }),
    z.string(),
  ])
  .nullable()
  .optional();

function normalizePerson(
  raw: z.infer<typeof npmPersonSchema>
): NpmPerson | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const match = raw.match(/^([^<(]+?)(?:\s*<([^>]+)>)?(?:\s*\(([^)]+)\))?$/);
    return {
      name: match?.[1]?.trim() ?? raw,
      email: match?.[2] ?? null,
      url: match?.[3] ?? null,
    };
  }
  return {
    name: raw.name,
    email: raw.email ?? null,
    url: raw.url ?? null,
  };
}

const registryPackageSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional().default([]),
  license: z.string().nullable().optional(),
  author: npmPersonSchema,
  maintainers: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  repository: z
    .object({ type: z.string(), url: z.string() })
    .nullable()
    .optional(),
  homepage: z.string().nullable().optional(),
  bugs: z
    .union([z.object({ url: z.string() }), z.string()])
    .nullable()
    .optional(),
  time: z.record(z.string(), z.string()).optional(),
  versions: z.record(z.string(), z.unknown()).optional(),
  "dist-tags": z.object({ latest: z.string() }).passthrough().optional(),
});

const versionsDetailsSchema = z.object({
  dependencies: z.record(z.string(), z.string()).optional().default({}),
  devDependencies: z.record(z.string(), z.string()).optional().default({}),
  peerDependencies: z.record(z.string(), z.string()).optional().default({}),
});

const npmDownloadsSchema = z.object({
  downloads: z.number(),
});

const npmSearchResponseSchema = z.object({
  objects: z.array(
    z.object({
      package: z.object({
        name: z.string(),
        version: z.string(),
        description: z.string().nullable().optional(),
        keywords: z.array(z.string()).optional().default([]),
        author: npmPersonSchema,
      }),
      score: z.object({
        final: z.number(),
        detail: z.object({}).passthrough(),
      }),
      searchScore: z.number(),
    })
  ),
});

export async function getNpmPackage(
  packageName: string,
  options?: ScraperOptions
): Promise<Result<NpmPackage>> {
  const client = createHttpClient(options);
  const encodedName = encodeURIComponent(packageName).replace(/%40/, "@");

  try {
    const [registryRaw, weeklyRaw, monthlyRaw] = await Promise.all([
      client.get<unknown>(`${NPM_REGISTRY_BASE}/${encodedName}`),
      client.get<unknown>(
        `${NPM_API_BASE}/downloads/point/last-week/${encodedName}`
      ),
      client.get<unknown>(
        `${NPM_API_BASE}/downloads/point/last-month/${encodedName}`
      ),
    ]);

    const parsed = registryPackageSchema.safeParse(registryRaw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected npm registry response shape",
        cause: parsed.error,
      });
    }

    const pkg = parsed.data;
    const latestVersion = pkg["dist-tags"]?.latest ?? "";
    const latestVersionData = versionsDetailsSchema.safeParse(
      (pkg.versions as Record<string, unknown>)?.[latestVersion] ?? {}
    );

    const weeklyDownloads = npmDownloadsSchema.safeParse(weeklyRaw);
    const monthlyDownloads = npmDownloadsSchema.safeParse(monthlyRaw);

    const time = pkg.time ?? {};
    const versionKeys = Object.keys(pkg.versions ?? {}).filter(
      (k) => !["created", "modified"].includes(k)
    );

    return ok({
      name: pkg.name,
      version: latestVersion,
      description: pkg.description ?? null,
      keywords: pkg.keywords,
      license: pkg.license ?? null,
      author: normalizePerson(pkg.author),
      maintainers: pkg.maintainers.map((m) => ({
        name: m.name,
        email: m.email ?? null,
        url: null,
      })),
      repository: pkg.repository ?? null,
      homepage: pkg.homepage ?? null,
      bugs:
        typeof pkg.bugs === "string"
          ? pkg.bugs
          : pkg.bugs?.url ?? null,
      downloads:
        weeklyDownloads.success && monthlyDownloads.success
          ? {
              weekly: weeklyDownloads.data.downloads,
              monthly: monthlyDownloads.data.downloads,
            }
          : null,
      createdAt: (time as Record<string, string | undefined>)["created"] ?? "",
      updatedAt: (time as Record<string, string | undefined>)["modified"] ?? "",
      versions: versionKeys,
      latestVersion,
      dependencies: latestVersionData.success
        ? latestVersionData.data.dependencies
        : {},
      devDependencies: latestVersionData.success
        ? latestVersionData.data.devDependencies
        : {},
      peerDependencies: latestVersionData.success
        ? latestVersionData.data.peerDependencies
        : {},
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function searchNpmPackages(
  query: string,
  searchOptions: NpmSearchOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<NpmSearchResult[]>> {
  const client = createHttpClient(scraperOptions);

  const url = buildUrl(NPM_REGISTRY_BASE, "/-/v1/search", {
    text: query,
    size: searchOptions.limit ?? 10,
    from: searchOptions.offset ?? 0,
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = npmSearchResponseSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected npm search response shape",
        cause: parsed.error,
      });
    }

    const results: NpmSearchResult[] = parsed.data.objects.map((obj) => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description ?? null,
      keywords: obj.package.keywords,
      author: normalizePerson(obj.package.author),
      score: obj.score.final,
      searchScore: obj.searchScore,
    }));

    return ok(results);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
