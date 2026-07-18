import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  hostname: text("hostname").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  overallGrade: text("overall_grade").notNull(),
  overallScore: integer("overall_score").notNull(),
  scores: jsonb("scores").notNull(),
});

export type ScanRow = typeof scans.$inferSelect;
export type NewScanRow = typeof scans.$inferInsert;
