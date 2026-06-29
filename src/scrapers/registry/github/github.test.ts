import { describe, it, expect } from "vitest";
import {
  getGitHubRepository,
  getGitHubUser,
  getGitHubTrending,
} from "./index.js";

describe("GitHub Scraper", () => {
  describe("getGitHubRepository", () => {
    it("returns repository data for a known public repo", async () => {
      const result = await getGitHubRepository("facebook", "react");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.name).toBe("react");
      expect(result.data.fullName).toBe("react/react");
      expect(result.data.url).toBe("https://github.com/react/react");
      expect(typeof result.data.stars).toBe("number");
      expect(result.data.stars).toBeGreaterThan(200_000);
      expect(typeof result.data.forks).toBe("number");
      expect(result.data.isPrivate).toBe(false);
    });

    it("returns all required fields with correct types", async () => {
      const result = await getGitHubRepository("microsoft", "vscode");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const repo = result.data;
      expect(typeof repo.id).toBe("number");
      expect(typeof repo.name).toBe("string");
      expect(typeof repo.fullName).toBe("string");
      expect(typeof repo.url).toBe("string");
      expect(typeof repo.stars).toBe("number");
      expect(typeof repo.forks).toBe("number");
      expect(typeof repo.watchers).toBe("number");
      expect(typeof repo.openIssues).toBe("number");
      expect(Array.isArray(repo.topics)).toBe(true);
      expect(typeof repo.isPrivate).toBe("boolean");
      expect(typeof repo.isFork).toBe("boolean");
      expect(typeof repo.isArchived).toBe("boolean");
      expect(typeof repo.createdAt).toBe("string");
      expect(typeof repo.updatedAt).toBe("string");
      expect(typeof repo.defaultBranch).toBe("string");
      expect(typeof repo.size).toBe("number");
    });

    it("returns NOT_FOUND error for a non-existent repository", async () => {
      const result = await getGitHubRepository(
        "this-user-definitely-does-not-exist-12345",
        "this-repo-too"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      if (result.error.code === "RATE_LIMITED") return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("returns a valid ISO date string for createdAt", async () => {
      const result = await getGitHubRepository("torvalds", "linux");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const date = new Date(result.data.createdAt);
      expect(date.getFullYear()).toBeGreaterThan(2000);
    });
  });

  describe("getGitHubUser", () => {
    it("returns user data for a known public user", async () => {
      const result = await getGitHubUser("torvalds");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.login).toBe("torvalds");
      expect(typeof result.data.id).toBe("number");
      expect(typeof result.data.publicRepos).toBe("number");
      expect(result.data.publicRepos).toBeGreaterThan(0);
      expect(typeof result.data.followers).toBe("number");
      expect(result.data.followers).toBeGreaterThan(100_000);
    });

    it("returns all required fields", async () => {
      const result = await getGitHubUser("github");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const user = result.data;
      expect(typeof user.id).toBe("number");
      expect(typeof user.login).toBe("string");
      expect(typeof user.avatarUrl).toBe("string");
      expect(user.avatarUrl).toMatch(/^https:\/\//);
      expect(typeof user.url).toBe("string");
      expect(typeof user.publicRepos).toBe("number");
      expect(typeof user.publicGists).toBe("number");
      expect(typeof user.followers).toBe("number");
      expect(typeof user.following).toBe("number");
      expect(typeof user.createdAt).toBe("string");
    });

    it("returns NOT_FOUND for a non-existent user", async () => {
      const result = await getGitHubUser(
        "this-user-absolutely-does-not-exist-xyz-99999"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      if (result.error.code === "RATE_LIMITED") return;

      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("getGitHubTrending", () => {
    it("returns a list of trending repositories", async () => {
      const result = await getGitHubTrending();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns repositories with required fields", async () => {
      const result = await getGitHubTrending();

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.rank).toBe("number");
      expect(first.rank).toBe(1);
      expect(typeof first.name).toBe("string");
      expect(typeof first.fullName).toBe("string");
      expect(first.fullName).toContain("/");
      expect(typeof first.url).toBe("string");
      expect(first.url).toMatch(/^https:\/\/github\.com\//);
      expect(typeof first.stars).toBe("number");
      expect(typeof first.forks).toBe("number");
    });

    it("returns ranks in ascending order starting at 1", async () => {
      const result = await getGitHubTrending();

      expect(result.success).toBe(true);
      if (!result.success) return;

      result.data.forEach((repo, index) => {
        expect(repo.rank).toBe(index + 1);
      });
    });

    it("filters by language when specified", async () => {
      const result = await getGitHubTrending({ language: "typescript" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);

      const hasTypescript = result.data.some(
        (r) => r.language?.toLowerCase() === "typescript"
      );
      expect(hasTypescript).toBe(true);
    });

    it("accepts since parameter without error", async () => {
      const result = await getGitHubTrending({ since: "weekly" });
      expect(result.success).toBe(true);
    });
  });
});
