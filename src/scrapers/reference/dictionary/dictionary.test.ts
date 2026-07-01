import { describe, it, expect } from "vitest";
import { getWordDefinition, getAllWordDefinitions } from "./index.js";

describe("Dictionary Scraper", () => {
  describe("getWordDefinition", () => {
    it("returns definition data for a known word", async () => {
      const result = await getWordDefinition("hello");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.word).toBe("hello");
      expect(Array.isArray(result.data.meanings)).toBe(true);
      expect(result.data.meanings.length).toBeGreaterThan(0);
    });

    it("returns meanings with definitions", async () => {
      const result = await getWordDefinition("computer");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const meaning = result.data.meanings[0];
      expect(meaning).toBeDefined();
      if (!meaning) return;

      expect(typeof meaning.partOfSpeech).toBe("string");
      expect(Array.isArray(meaning.definitions)).toBe(true);
      expect(meaning.definitions.length).toBeGreaterThan(0);

      const def = meaning.definitions[0];
      expect(def).toBeDefined();
      if (!def) return;
      expect(typeof def.definition).toBe("string");
      expect(def.definition.length).toBeGreaterThan(0);
    });

    it("returns phonetics when available", async () => {
      const result = await getWordDefinition("water");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data.phonetics)).toBe(true);
    });

    it("returns NOT_FOUND for a nonsense word", async () => {
      const result = await getWordDefinition(
        "zzznonexistentwordzzz12345xyz"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("getAllWordDefinitions", () => {
    it("returns an array of dictionary entries", async () => {
      const result = await getAllWordDefinitions("run");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});
