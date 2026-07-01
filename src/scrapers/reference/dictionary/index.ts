import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type { DictionaryEntry } from "./types.js";

const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries";

const definitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
  synonyms: z.array(z.string()).optional().default([]),
  antonyms: z.array(z.string()).optional().default([]),
});

const meaningSchema = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(definitionSchema),
  synonyms: z.array(z.string()).optional().default([]),
  antonyms: z.array(z.string()).optional().default([]),
});

const phoneticSchema = z.object({
  text: z.string().optional(),
  audio: z.string().optional(),
});

const entrySchema = z.object({
  word: z.string(),
  phonetic: z.string().optional(),
  phonetics: z.array(phoneticSchema).optional().default([]),
  meanings: z.array(meaningSchema),
  sourceUrls: z.array(z.string()).optional().default([]),
});

const entriesSchema = z.array(entrySchema);

const notFoundSchema = z.object({
  title: z.string(),
  message: z.string(),
  resolution: z.string().optional(),
});

export async function getWordDefinition(
  word: string,
  lang: string = "en",
  options?: ScraperOptions
): Promise<Result<DictionaryEntry>> {
  const client = createHttpClient(options);
  const url = `${DICTIONARY_API_BASE}/${encodeURIComponent(lang)}/${encodeURIComponent(word.trim())}`;

  try {
    const raw = await client.get<unknown>(url);

    const notFound = notFoundSchema.safeParse(raw);
    if (notFound.success) {
      return err({
        code: "NOT_FOUND",
        message: notFound.data.message || `No definition found for "${word}"`,
      });
    }

    const parsed = entriesSchema.safeParse(raw);

    if (!parsed.success || parsed.data.length === 0) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected dictionary API response shape",
        cause: parsed.success ? undefined : parsed.error,
      });
    }

    const first = parsed.data[0] as z.infer<typeof entrySchema>;

    return ok({
      word: first.word,
      phonetic: first.phonetic ?? null,
      phonetics: first.phonetics.map((p) => ({
        text: p.text ?? null,
        audioUrl: p.audio && p.audio.length > 0 ? p.audio : null,
      })),
      meanings: first.meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.map((d) => ({
          definition: d.definition,
          example: d.example ?? null,
          synonyms: d.synonyms,
          antonyms: d.antonyms,
        })),
        synonyms: m.synonyms,
        antonyms: m.antonyms,
      })),
      sourceUrls: first.sourceUrls,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getAllWordDefinitions(
  word: string,
  lang: string = "en",
  options?: ScraperOptions
): Promise<Result<DictionaryEntry[]>> {
  const client = createHttpClient(options);
  const url = `${DICTIONARY_API_BASE}/${encodeURIComponent(lang)}/${encodeURIComponent(word.trim())}`;

  try {
    const raw = await client.get<unknown>(url);

    const notFound = notFoundSchema.safeParse(raw);
    if (notFound.success) {
      return err({
        code: "NOT_FOUND",
        message: notFound.data.message || `No definition found for "${word}"`,
      });
    }

    const parsed = entriesSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected dictionary API response shape",
        cause: parsed.error,
      });
    }

    return ok(
      parsed.data.map((entry) => ({
        word: entry.word,
        phonetic: entry.phonetic ?? null,
        phonetics: entry.phonetics.map((p) => ({
          text: p.text ?? null,
          audioUrl: p.audio && p.audio.length > 0 ? p.audio : null,
        })),
        meanings: entry.meanings.map((m) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.map((d) => ({
            definition: d.definition,
            example: d.example ?? null,
            synonyms: d.synonyms,
            antonyms: d.antonyms,
          })),
          synonyms: m.synonyms,
          antonyms: m.antonyms,
        })),
        sourceUrls: entry.sourceUrls,
      }))
    );
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
