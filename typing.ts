import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   GET TYPING TEXTS
========================= */
export const getTypingTexts = query({
  args: {
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.difficulty) {
      return await ctx.db
        .query("typingTexts")
        .withIndex("by_difficulty", q =>
          q.eq("difficulty", args.difficulty!)
        )
        .take(20);
    }

    return await ctx.db.query("typingTexts").take(20);
  },
});

/* =========================
   GET RANDOM TEXT
========================= */
export const getRandomText = query({
  args: { difficulty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let texts;

    if (args.difficulty) {
      texts = await ctx.db
        .query("typingTexts")
        .withIndex("by_difficulty", q =>
          q.eq("difficulty", args.difficulty!)
        )
        .collect();
    } else {
      texts = await ctx.db.query("typingTexts").collect();
    }

    if (texts.length === 0) {
      return {
        _id: "default" as any,
        title: "Computer Science Practice",
        content:
          "Computer science focuses on algorithms data structures and programming. Typing technical content improves both speed and accuracy.",
        difficulty: "easy",
        category: "computer-science",
        wordCount: 20,
        _creationTime: Date.now(),
      };
    }

    return texts[Math.floor(Math.random() * texts.length)];
  },
});

/* =========================
   SAVE GAME RESULT
========================= */
export const saveGameResult = mutation({
  args: {
    wpm: v.number(),
    accuracy: v.number(),
    timeSpent: v.number(),
    textLength: v.number(),
    mistakes: v.number(),
    gameMode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to save results");
    }

    return await ctx.db.insert("gameResults", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

/* =========================
   GET USER STATS
========================= */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const results = await ctx.db
      .query("gameResults")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .take(50);

    if (results.length === 0) {
      return {
        gamesPlayed: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        recentResults: [],
      };
    }

    const averageWpm =
      results.reduce((s, r) => s + r.wpm, 0) / results.length;

    const averageAccuracy =
      results.reduce((s, r) => s + r.accuracy, 0) / results.length;

    return {
      gamesPlayed: results.length,
      averageWpm: Math.round(averageWpm),
      bestWpm: Math.max(...results.map(r => r.wpm)),
      averageAccuracy: Math.round(averageAccuracy),
      bestAccuracy: Math.max(...results.map(r => r.accuracy)),
      recentResults: results.slice(0, 10),
    };
  },
});

/* =========================
   LEADERBOARD
========================= */
export const getLeaderboard = query({
  args: { gameMode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = args.gameMode
      ? await ctx.db
          .query("gameResults")
          .withIndex("by_game_mode", q =>
            q.eq("gameMode", args.gameMode!)
          )
          .order("desc")
          .take(10)
      : await ctx.db
          .query("gameResults")
          .withIndex("by_wpm")
          .order("desc")
          .take(10);

    return Promise.all(
      results.map(async r => {
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          username: user?.name || user?.email || "Anonymous",
        };
      })
    );
  },
});

/* =========================
   INITIALIZE CS TEXTS
========================= */
export const initializeTexts = mutation({
  args: {},
  handler: async (ctx) => {
    const exists = await ctx.db.query("typingTexts").take(1);
    if (exists.length > 0) return "Texts already initialized";

    const texts = [
      {
        title: "Programming Basics",
        content:
          "Programming involves writing logical instructions for computers using languages like Python and Java.",
        difficulty: "easy",
        category: "computer-science",
        wordCount: 14,
      },
      {
        title: "Operating Systems",
        content:
          "An operating system manages memory processes files and hardware resources efficiently.",
        difficulty: "medium",
        category: "computer-science",
        wordCount: 12,
      },
      {
        title: "Data Structures",
        content:
          "Arrays stacks queues and trees organize data for efficient algorithm execution.",
        difficulty: "medium",
        category: "computer-science",
        wordCount: 11,
      },
      {
        title: "Computer Networks",
        content:
          "Computer networks use protocols like TCP IP to transmit data securely.",
        difficulty: "hard",
        category: "computer-science",
        wordCount: 11,
      },
      {
        title: "Software Engineering",
        content:
          "Software engineering applies design testing version control and scalability principles.",
        difficulty: "hard",
        category: "computer-science",
        wordCount: 10,
      },
    ];

    for (const t of texts) {
      await ctx.db.insert("typingTexts", t);
    }

    return "Computer science typing texts initialized";
  },
});
