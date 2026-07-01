import { load } from "cheerio";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import { buildUrl } from "../../../utils/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type { RssFeed, RssFeedItem, NewsSearchOptions } from "./types.js";

const GOOGLE_NEWS_BASE = "https://news.google.com/rss/";

function textOrNull($el: ReturnType<ReturnType<typeof load>>): string | null {
  const text = $el.text().trim();
  return text.length > 0 ? text : null;
}

function parseRssXml(xml: string): Result<RssFeed> {
  const $ = load(xml, { xmlMode: true });

  const channel = $("channel").first();
  if (channel.length === 0) {
    return err({
      code: "PARSE_ERROR",
      message: "No <channel> element found in RSS feed",
    });
  }

  const feedTitle = textOrNull(channel.children("title").first()) ?? "";
  const feedLink = textOrNull(channel.children("link").first());
  const feedDescription = textOrNull(channel.children("description").first());

  const items: RssFeedItem[] = [];

  channel.children("item").each((_i, el) => {
    const $item = $(el);
    const title = textOrNull($item.children("title").first());
    const link = textOrNull($item.children("link").first());

    if (!title || !link) return;

    const description = textOrNull($item.children("description").first());
    const pubDate = textOrNull($item.children("pubDate").first());
    const author =
      textOrNull($item.children("author").first()) ??
      textOrNull($item.find("dc\\:creator").first());
    const source = textOrNull($item.children("source").first());

    items.push({
      title,
      link,
      description,
      pubDate,
      author,
      source,
    });
  });

  return ok({
    title: feedTitle,
    link: feedLink,
    description: feedDescription,
    items,
  });
}

export async function getRssFeed(
  feedUrl: string,
  options?: ScraperOptions
): Promise<Result<RssFeed>> {
  const client = createHttpClient(options);

  try {
    const xml = await client.getText(feedUrl, {
      Accept: "application/rss+xml, application/xml, text/xml",
    });

    return parseRssXml(xml);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function searchNews(
  query: string,
  searchOptions: NewsSearchOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<RssFeedItem[]>> {
  const client = createHttpClient(scraperOptions);
  const lang = searchOptions.lang ?? "en";
  const country = searchOptions.country ?? "US";
  const limit = searchOptions.limit ?? 10;

  const url = buildUrl(GOOGLE_NEWS_BASE, "search", {
    q: query,
    hl: lang,
    gl: country,
    ceid: `${country}:${lang}`,
  });

  try {
    const xml = await client.getText(url, {
      Accept: "application/rss+xml, application/xml, text/xml",
    });

    const parsed = parseRssXml(xml);
    if (!parsed.success) {
      return err(parsed.error);
    }

    return ok(parsed.data.items.slice(0, limit));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getTopNews(
  searchOptions: NewsSearchOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<RssFeedItem[]>> {
  const client = createHttpClient(scraperOptions);
  const lang = searchOptions.lang ?? "en";
  const country = searchOptions.country ?? "US";
  const limit = searchOptions.limit ?? 10;

  const url = buildUrl(GOOGLE_NEWS_BASE, "", {
    hl: lang,
    gl: country,
    ceid: `${country}:${lang}`,
  });

  try {
    const xml = await client.getText(url, {
      Accept: "application/rss+xml, application/xml, text/xml",
    });

    const parsed = parseRssXml(xml);
    if (!parsed.success) {
      return err(parsed.error);
    }

    return ok(parsed.data.items.slice(0, limit));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
