import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../core/index.js";
import type { Result, ScraperOptions } from "../types/index.js";
import type {
  HackerNewsItem,
  HackerNewsStory,
  HackerNewsFeedType,
  HackerNewsFeedOptions,
} from "../types/hacker-news.js";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

const hnItemSchema = z.object({
  id: z.number(),
  type: z
    .enum(["story", "ask", "show", "job", "comment", "poll", "pollopt"])
    .optional(),
  by: z.string().optional(),
  time: z.number().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  score: z.number().optional(),
  descendants: z.number().optional(),
  kids: z.array(z.number()).optional().default([]),
  parent: z.number().optional(),
  deleted: z.boolean().optional().default(false),
  dead: z.boolean().optional().default(false),
});

const feedSchema = z.array(z.number());

function mapHnItem(raw: z.infer<typeof hnItemSchema>): HackerNewsItem {
  return {
    id: raw.id,
    type: raw.type ?? "story",
    by: raw.by ?? null,
    time: raw.time ?? 0,
    url: raw.url ?? null,
    title: raw.title ?? null,
    text: raw.text ?? null,
    score: raw.score ?? null,
    descendants: raw.descendants ?? null,
    kids: raw.kids,
    parent: raw.parent ?? null,
    deleted: raw.deleted,
    dead: raw.dead,
  };
}

function mapToStory(item: HackerNewsItem): HackerNewsStory | null {
  if (!item.by || item.title === null) return null;

  return {
    id: item.id,
    title: item.title,
    url: item.url,
    by: item.by,
    score: item.score ?? 0,
    descendants: item.descendants ?? 0,
    time: item.time ?? 0,
    type: item.type,
    text: item.text,
    kids: item.kids,
  };
}

export async function getHackerNewsItem(
  id: number,
  options?: ScraperOptions
): Promise<Result<HackerNewsItem>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(`${HN_API_BASE}/item/${id}.json`);

    if (raw === null) {
      return err({ code: "NOT_FOUND", message: `Item ${id} not found` });
    }

    const parsed = hnItemSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Hacker News item shape",
        cause: parsed.error,
      });
    }

    return ok(mapHnItem(parsed.data));
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getHackerNewsFeed(
  feed: HackerNewsFeedType = "top",
  feedOptions: HackerNewsFeedOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<HackerNewsStory[]>> {
  const client = createHttpClient(scraperOptions);
  const limit = feedOptions.limit ?? 30;

  const feedEndpointMap: Record<HackerNewsFeedType, string> = {
    top: "topstories",
    new: "newstories",
    best: "beststories",
    ask: "askstories",
    show: "showstories",
    job: "jobstories",
  };

  try {
    const rawIds = await client.get<unknown>(
      `${HN_API_BASE}/${feedEndpointMap[feed]}.json`
    );

    const parsedIds = feedSchema.safeParse(rawIds);

    if (!parsedIds.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected Hacker News feed response",
        cause: parsedIds.error,
      });
    }

    const ids = parsedIds.data.slice(0, limit);

    const items = await Promise.all(
      ids.map(async (id) => {
        const raw = await client.get<unknown>(`${HN_API_BASE}/item/${id}.json`);
        const parsed = hnItemSchema.safeParse(raw);
        if (!parsed.success) return null;
        return mapHnItem(parsed.data);
      })
    );

    const stories = items
      .filter((item): item is HackerNewsItem => item !== null)
      .map(mapToStory)
      .filter((story): story is HackerNewsStory => story !== null);

    return ok(stories);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getHackerNewsMaxItem(
  options?: ScraperOptions
): Promise<Result<number>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(`${HN_API_BASE}/maxitem.json`);
    const parsed = z.number().safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected maxitem response",
      });
    }

    return ok(parsed.data);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
