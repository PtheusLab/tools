import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  PypiPackage,
  PypiPerson,
} from "./types.js";

const PYPI_BASE = "https://pypi.org";

const pypiInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  author_email: z.string().nullable().optional(),
  maintainer: z.string().nullable().optional(),
  maintainer_email: z.string().nullable().optional(),
  home_page: z.string().nullable().optional(),
  project_urls: z.record(z.string(), z.string()).nullable().optional(),
  requires_python: z.string().nullable().optional(),
  requires_dist: z.array(z.string()).nullable().optional(),
  classifiers: z.array(z.string()).optional().default([]),
  downloads: z
    .object({
      last_day: z.number(),
      last_week: z.number(),
      last_month: z.number(),
    })
    .nullable()
    .optional(),
});

const pypiPackageSchema = z.object({
  info: pypiInfoSchema,
  releases: z.record(z.string(), z.unknown()).optional().default({}),
  urls: z
    .array(z.object({ upload_time: z.string().optional() }))
    .optional()
    .default([]),
});

function parsePerson(
  name: string | null | undefined,
  email: string | null | undefined
): PypiPerson | null {
  if (!name) return null;
  return {
    name,
    email: email ?? null,
  };
}

function parseKeywords(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

function findProjectUrl(
  urls: Record<string, string> | null | undefined,
  ...keys: string[]
): string | null {
  if (!urls) return null;
  for (const key of keys) {
    const match = Object.entries(urls).find(
      ([k]) => k.toLowerCase() === key.toLowerCase()
    );
    if (match) return match[1];
  }
  return null;
}

export async function getPypiPackage(
  packageName: string,
  options?: ScraperOptions
): Promise<Result<PypiPackage>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(
      `${PYPI_BASE}/pypi/${encodeURIComponent(packageName)}/json`
    );

    const parsed = pypiPackageSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected PyPI API response shape",
        cause: parsed.error,
      });
    }

    const { info, releases, urls } = parsed.data;

    const versionKeys = Object.keys(releases).filter(
      (v) => !["created", "modified"].includes(v)
    );

    const uploadTime = urls[0]?.upload_time ?? null;
    const projectUrls = info.project_urls ?? null;

    return ok({
      name: info.name,
      version: info.version,
      summary: info.summary ?? null,
      description: info.description ?? null,
      keywords: parseKeywords(info.keywords),
      license: info.license ?? null,
      author: parsePerson(info.author, info.author_email),
      maintainer: parsePerson(info.maintainer, info.maintainer_email),
      homepage:
        info.home_page ??
        findProjectUrl(projectUrls, "homepage", "home") ??
        null,
      repository: findProjectUrl(
        projectUrls,
        "source",
        "source code",
        "repository",
        "github"
      ),
      documentation: findProjectUrl(
        projectUrls,
        "documentation",
        "docs",
        "changelog"
      ),
      requiresPython: info.requires_python ?? null,
      dependencies: info.requires_dist ?? [],
      classifiers: info.classifiers,
      createdAt: uploadTime ?? null,
      updatedAt: uploadTime ?? null,
      versions: versionKeys,
      latestVersion: info.version,
      downloads:
        info.downloads && info.downloads.last_day >= 0
          ? {
              lastDay: info.downloads.last_day,
              lastWeek: info.downloads.last_week,
              lastMonth: info.downloads.last_month,
            }
          : null,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
