import { load } from "cheerio";
import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  WikipediaArticleSummary,
  WikipediaSearchResult,
  WikipediaArticleFull,
  WikipediaSection,
  WikipediaArticleOptions,
  WikipediaSearchOptions,
} from "./types.js";

// Wikipedia REST API (summary / page content)
const WIKI_REST_BASE = (lang: string): string =>
  `https://${lang}.wikipedia.org/api/rest_v1`;

// Wikipedia Action API (search)
const WIKI_ACTION_BASE = (lang: string): string =>
  `https://${lang}.wikipedia.org/w/api.php`;

// ─── Zod schemas ───────────────────────────────────────────────────────────

const thumbnailSchema = z.object({
  source: z.string(),
  width: z.number(),
  height: z.number(),
});

const summaryApiSchema = z.object({
  pageid: z.number(),
  title: z.string(),
  content_urls: z.object({
    desktop: z.object({ page: z.string() }),
  }),
  extract: z.string(),
  thumbnail: thumbnailSchema.optional(),
  timestamp: z.string().optional(),
  lang: z.string().optional(),
  description: z.string().optional(),
});

const searchApiSchema = z.object({
  query: z.object({
    search: z.array(
      z.object({
        pageid: z.number(),
        title: z.string(),
        snippet: z.string(),
        wordcount: z.number(),
        size: z.number(),
        timestamp: z.string(),
      })
    ),
  }),
});

const parsedPageSchema = z.object({
  parse: z.object({
    pageid: z.number(),
    title: z.string(),
    text: z.object({
      "*": z.string(),
    }),
    revid: z.number().optional(),
  }),
});

// ─── Mappers ───────────────────────────────────────────────────────────────

function mapSummary(
  raw: z.infer<typeof summaryApiSchema>,
  lang: string
): WikipediaArticleSummary {
  return {
    pageId: raw.pageid,
    title: raw.title,
    url: raw.content_urls.desktop.page,
    extract: raw.extract,
    thumbnailUrl: raw.thumbnail?.source ?? null,
    thumbnailWidth: raw.thumbnail?.width ?? null,
    thumbnailHeight: raw.thumbnail?.height ?? null,
    lastEdited: raw.timestamp ?? null,
    lang: raw.lang ?? lang,
    description: raw.description ?? null,
  };
}

/** Strip HTML tags and normalise whitespace */
function htmlToText(html: string): string {
  const $ = load(html);
  // Remove elements that don't contain useful prose
  $(
    "table, .mw-editsection, .reference, sup.reference, .navbox, " +
      ".infobox, .sidebar, script, style, .thumb, .reflist, " +
      "#toc, .hatnote, .mw-empty-elt"
  ).remove();
  return $.text().replace(/\s+/g, " ").trim();
}

/** Parse rendered HTML into structured sections */
function parseSections(html: string): WikipediaSection[] {
  const $ = load(html);
  const sections: WikipediaSection[] = [];

  // Collect lead section (everything before the first heading)
  const leadParagraphs: string[] = [];
  $("div.mw-parser-output")
    .children()
    .each((_i, el) => {
      const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? "";
      if (/^h[1-6]$/.test(tag)) return false; // stop at first heading
      if (tag === "p") {
        const text = $(el).text().trim();
        if (text) leadParagraphs.push(text);
      }
    });

  if (leadParagraphs.length > 0) {
    sections.push({
      title: "",
      level: 0,
      content: leadParagraphs.join("\n\n"),
    });
  }

  // Collect subsequent headings and their content
  let currentHeading: WikipediaSection | null = null;
  let contentBuffer: string[] = [];

  $("div.mw-parser-output")
    .children()
    .each((_i, el) => {
      const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? "";
      const headingMatch = tag.match(/^h([1-6])$/);

      if (headingMatch) {
        if (currentHeading) {
          sections.push({
            ...currentHeading,
            content: contentBuffer.join("\n\n"),
          });
        }
        // Remove edit links from heading text
        $(el).find(".mw-editsection").remove();
        currentHeading = {
          title: $(el).text().trim(),
          level: parseInt(headingMatch[1] ?? "2", 10) - 1, // h2 → level 1, h3 → level 2, …
          content: "",
        };
        contentBuffer = [];
      } else if (currentHeading && tag === "p") {
        const text = $(el).text().trim();
        if (text) contentBuffer.push(text);
      }
    });

  if (currentHeading) {
    sections.push({
      ...(currentHeading as WikipediaSection),
      content: contentBuffer.join("\n\n"),
    });
  }

  return sections;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Fetch a concise summary for a Wikipedia article by its title.
 *
 * Uses the Wikipedia REST API `/page/summary/{title}` endpoint which
 * returns the introductory paragraph and metadata.
 *
 * @example
 * const result = await getWikipediaSummary("JavaScript");
 */
export async function getWikipediaSummary(
  title: string,
  articleOptions: WikipediaArticleOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WikipediaArticleSummary>> {
  const lang = articleOptions.lang ?? "en";
  const client = createHttpClient(scraperOptions);
  const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `${WIKI_REST_BASE(lang)}/page/summary/${encodedTitle}`;

  try {
    const raw = await client.get<unknown>(url, {
      Accept: "application/json; charset=utf-8",
    });

    const parsed = summaryApiSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Wikipedia summary response shape",
        cause: parsed.error,
      });
    }

    return ok(mapSummary(parsed.data, lang));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

/**
 * Search Wikipedia articles by keyword.
 *
 * @example
 * const result = await searchWikipedia("TypeScript programming language", { limit: 5 });
 */
export async function searchWikipedia(
  query: string,
  searchOptions: WikipediaSearchOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WikipediaSearchResult[]>> {
  const lang = searchOptions.lang ?? "en";
  const limit = Math.min(searchOptions.limit ?? 10, 50);
  const client = createHttpClient(scraperOptions);

  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    srprop: "snippet|wordcount|size|timestamp",
    format: "json",
    origin: "*",
  });

  const url = `${WIKI_ACTION_BASE(lang)}?${params.toString()}`;

  try {
    const raw = await client.get<unknown>(url, {
      Accept: "application/json",
    });

    const parsed = searchApiSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Wikipedia search response shape",
        cause: parsed.error,
      });
    }

    const results: WikipediaSearchResult[] = parsed.data.query.search.map(
      (item) => ({
        pageId: item.pageid,
        title: item.title,
        // Strip HTML highlight tags (<span class="searchmatch">…</span>)
        snippet: item.snippet.replace(/<[^>]+>/g, ""),
        url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
          item.title.replace(/ /g, "_")
        )}`,
        wordCount: item.wordcount,
        size: item.size,
        lastEdited: item.timestamp,
      })
    );

    return ok(results);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

/**
 * Fetch the full content of a Wikipedia article, parsed into sections.
 *
 * Uses the Action API `parse` endpoint to get the rendered HTML, then
 * extracts sections and plain text with cheerio.
 *
 * @example
 * const result = await getWikipediaArticle("Node.js");
 */
export async function getWikipediaArticle(
  title: string,
  articleOptions: WikipediaArticleOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WikipediaArticleFull>> {
  const lang = articleOptions.lang ?? "en";
  const client = createHttpClient(scraperOptions);

  // Fetch parsed HTML via Action API
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "text|revid",
    format: "json",
    origin: "*",
    redirects: "1",
  });

  const parseUrl = `${WIKI_ACTION_BASE(lang)}?${params.toString()}`;

  // Also fetch the summary for metadata (description, thumbnail, timestamp)
  const summaryResult = await getWikipediaSummary(title, { lang }, scraperOptions);

  try {
    const raw = await client.get<unknown>(parseUrl, {
      Accept: "application/json",
    });

    const parsed = parsedPageSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Wikipedia parse response shape",
        cause: parsed.error,
      });
    }

    const { pageid, title: parsedTitle, text } = parsed.data.parse;
    const html = text["*"];

    const sections = parseSections(html);
    const plainText = htmlToText(html);

    const encodedTitle = encodeURIComponent(parsedTitle.replace(/ /g, "_"));
    const articleUrl = `https://${lang}.wikipedia.org/wiki/${encodedTitle}`;

    const description =
      summaryResult.success ? (summaryResult.data.description ?? null) : null;
    const lastEdited =
      summaryResult.success ? (summaryResult.data.lastEdited ?? null) : null;

    return ok({
      pageId: pageid,
      title: parsedTitle,
      url: articleUrl,
      lang,
      description,
      lastEdited,
      sections,
      plainText,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
