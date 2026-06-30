import { load } from "cheerio";
import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  WikiquotePage,
  WikiquoteSection,
  WikiquoteSearchResult,
  WikiquoteOptions,
  WikiquoteSearchOptions,
} from "./types.js";

const ACTION_BASE = (lang: string): string =>
  `https://${lang}.wikiquote.org/w/api.php`;

const parsedPageSchema = z.object({
  parse: z.object({
    pageid: z.number(),
    title: z.string(),
    text: z.object({ "*": z.string() }),
  }),
});

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
  }),
});

const searchApiSchema = z.object({
  query: z.object({
    search: z.array(
      z.object({
        pageid: z.number(),
        title: z.string(),
        snippet: z.string(),
      })
    ),
  }),
});

function parseQuotes(html: string): WikiquoteSection[] {
  const $ = load(html);
  const sections: WikiquoteSection[] = [];

  // Remove edit section links and references
  $(".mw-editsection, sup.reference, .reflist, .references, #toc").remove();

  let currentTitle = "";
  let currentQuotes: string[] = [];

  $("div.mw-parser-output").children().each((_i, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? "";

    if (/^h[1-6]$/.test(tag)) {
      // Save previous section
      if (currentQuotes.length > 0) {
        sections.push({ title: currentTitle, quotes: currentQuotes });
      }
      currentTitle = $(el).text().trim();
      currentQuotes = [];
      return;
    }

    // Wikiquote stores quotes as <ul><li> lists
    if (tag === "ul") {
      $(el).find("> li").each((_j, li) => {
        // Only take the direct text of the <li>, not nested <ul> (sourcing info)
        const clone = $(li).clone();
        clone.find("ul").remove();
        const text = clone.text().replace(/\s+/g, " ").trim();
        if (text.length > 10) currentQuotes.push(text);
      });
    }
  });

  // Push last section
  if (currentQuotes.length > 0) {
    sections.push({ title: currentTitle, quotes: currentQuotes });
  }

  return sections;
}

export async function getWikiquotePage(
  title: string,
  quoteOptions: WikiquoteOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WikiquotePage>> {
  const lang = quoteOptions.lang ?? "en";
  const client = createHttpClient(scraperOptions);

  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "text",
    format: "json",
    origin: "*",
    redirects: "1",
  });

  const url = `${ACTION_BASE(lang)}?${params.toString()}`;

  try {
    const raw = await client.get<unknown>(url, { Accept: "application/json" });

    const apiError = apiErrorSchema.safeParse(raw);
    if (apiError.success) {
      return err({ code: "NOT_FOUND", message: `Page not found: ${title}` });
    }

    const parsed = parsedPageSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Wikiquote API response shape",
        cause: parsed.error,
      });
    }

    const { pageid, title: parsedTitle, text } = parsed.data.parse;
    const sections = parseQuotes(text["*"]);
    const encodedTitle = encodeURIComponent(parsedTitle.replace(/ /g, "_"));

    return ok({
      pageId: pageid,
      title: parsedTitle,
      url: `https://${lang}.wikiquote.org/wiki/${encodedTitle}`,
      lang,
      quotes: sections,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function searchWikiquote(
  query: string,
  searchOptions: WikiquoteSearchOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<WikiquoteSearchResult[]>> {
  const lang = searchOptions.lang ?? "en";
  const limit = Math.min(searchOptions.limit ?? 10, 50);
  const client = createHttpClient(scraperOptions);

  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    srprop: "snippet",
    format: "json",
    origin: "*",
  });

  const url = `${ACTION_BASE(lang)}?${params.toString()}`;

  try {
    const raw = await client.get<unknown>(url, { Accept: "application/json" });
    const parsed = searchApiSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Wikiquote search response shape",
        cause: parsed.error,
      });
    }

    return ok(
      parsed.data.query.search.map((item) => ({
        pageId: item.pageid,
        title: item.title,
        snippet: item.snippet.replace(/<[^>]+>/g, ""),
        url: `https://${lang}.wikiquote.org/wiki/${encodeURIComponent(
          item.title.replace(/ /g, "_")
        )}`,
      }))
    );
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
