import { load } from "cheerio";
import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../core/index.js";
import { parseKiloSuffix, parseIntOrNull } from "../utils/index.js";
import type { Result, ScraperOptions } from "../types/index.js";
import type {
  GitHubRepository,
  GitHubUser,
  GitHubTrendingRepository,
  GitHubTrendingOptions,
} from "../types/github.js";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_BASE = "https://github.com";

const repositoryApiSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  watchers_count: z.number(),
  open_issues_count: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  private: z.boolean(),
  fork: z.boolean(),
  archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  license: z.object({ spdx_id: z.string() }).nullable(),
  default_branch: z.string(),
  size: z.number(),
});

const userApiSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.string(),
  html_url: z.string(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  email: z.string().nullable(),
  blog: z.string().nullable(),
  public_repos: z.number(),
  public_gists: z.number(),
  followers: z.number(),
  following: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

function mapRepository(raw: z.infer<typeof repositoryApiSchema>): GitHubRepository {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    url: raw.html_url,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    watchers: raw.watchers_count,
    openIssues: raw.open_issues_count,
    language: raw.language,
    topics: raw.topics,
    isPrivate: raw.private,
    isFork: raw.fork,
    isArchived: raw.archived,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    license: raw.license?.spdx_id ?? null,
    defaultBranch: raw.default_branch,
    size: raw.size,
  };
}

function mapUser(raw: z.infer<typeof userApiSchema>): GitHubUser {
  return {
    id: raw.id,
    login: raw.login,
    name: raw.name,
    bio: raw.bio,
    avatarUrl: raw.avatar_url,
    url: raw.html_url,
    company: raw.company,
    location: raw.location,
    email: raw.email,
    blog: raw.blog,
    publicRepos: raw.public_repos,
    publicGists: raw.public_gists,
    followers: raw.followers,
    following: raw.following,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getGitHubRepository(
  owner: string,
  repo: string,
  options?: ScraperOptions
): Promise<Result<GitHubRepository>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { Accept: "application/vnd.github.v3+json" }
    );

    const parsed = repositoryApiSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected GitHub API response shape",
        cause: parsed.error,
      });
    }

    return ok(mapRepository(parsed.data));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getGitHubUser(
  username: string,
  options?: ScraperOptions
): Promise<Result<GitHubUser>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(
      `${GITHUB_API_BASE}/users/${username}`,
      { Accept: "application/vnd.github.v3+json" }
    );

    const parsed = userApiSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected GitHub API response shape",
        cause: parsed.error,
      });
    }

    return ok(mapUser(parsed.data));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getGitHubTrending(
  trendingOptions: GitHubTrendingOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<GitHubTrendingRepository[]>> {
  const client = createHttpClient(scraperOptions);

  const params = new URLSearchParams();
  if (trendingOptions.language) params.set("l", trendingOptions.language);
  if (trendingOptions.since) params.set("since", trendingOptions.since);

  const url = `${GITHUB_BASE}/trending?${params.toString()}`;

  try {
    const html = await client.getText(url);
    const $ = load(html);
    const results: GitHubTrendingRepository[] = [];

    $("article.Box-row").each((index, el) => {
      const element = $(el);

      const repoPath = element
        .find("h2 a")
        .attr("href")
        ?.trim()
        .replace(/^\//, "");

      if (!repoPath) return;

      const [ownerPart, namePart] = repoPath.split("/");
      if (!ownerPart || !namePart) return;

      const description = element.find("p").first().text().trim() || null;

      const languageEl = element.find("[itemprop='programmingLanguage']");
      const language = languageEl.text().trim() || null;

      const starsText = element
        .find("a[href$='/stargazers']")
        .first()
        .text()
        .trim();
      const stars = parseKiloSuffix(starsText) ?? 0;

      const forksText = element
        .find("a[href$='/forks']")
        .first()
        .text()
        .trim();
      const forks = parseKiloSuffix(forksText) ?? 0;

      const starsToday =
        parseIntOrNull(
          element
            .find("span.d-inline-block.float-sm-right")
            .text()
            .replace(/[^0-9]/g, "")
        );

      results.push({
        rank: index + 1,
        name: namePart,
        fullName: `${ownerPart}/${namePart}`,
        url: `${GITHUB_BASE}/${ownerPart}/${namePart}`,
        description,
        language,
        stars,
        forks,
        starsToday,
      });
    });

    if (results.length === 0) {
      return err({
        code: "PARSE_ERROR",
        message:
          "No trending repositories found — GitHub HTML structure may have changed",
      });
    }

    return ok(results);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
