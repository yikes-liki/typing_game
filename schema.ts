import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  gameResults: defineTable({
    userId: v.id("users"),
    wpm: v.number(),
    accuracy: v.number(),
    timeSpent: v.number(),
    textLength: v.number(),
    mistakes: v.number(),
    gameMode: v.string(),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_wpm", ["wpm"])
    .index("by_game_mode", ["gameMode"]),

  typingTexts: defineTable({
    title: v.string(),
    content: v.string(),
    difficulty: v.string(),
    category: v.string(),
    wordCount: v.number(),
  }).index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"]),

  liveGames: defineTable({
    hostId: v.id("users"),
    players: v.array(v.object({
      userId: v.id("users"),
      username: v.string(),
      progress: v.number(),
      wpm: v.number(),
      accuracy: v.number(),
      finished: v.boolean(),
    })),
    textId: v.id("typingTexts"),
    status: v.string(), // "waiting", "active", "finished"
    startTime: v.optional(v.number()),
    maxPlayers: v.number(),
  }).index("by_status", ["status"])
    .index("by_host", ["hostId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
