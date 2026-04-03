import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  pinHash: text("pin_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .references(() => families.id, { onDelete: "cascade" })
    .notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull(),
  currentLessonId: text("current_lesson_id").notNull().default("lesson-1"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const lessonAttempts = pgTable("lesson_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  lessonId: text("lesson_id").notNull(),
  stars: integer("stars").notNull(),
  quizErrors: integer("quiz_errors").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const songAttempts = pgTable("song_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  songId: text("song_id").notNull(),
  fragmentId: text("fragment_id"),
  completed: boolean("completed").notNull().default(false),
  tempoPercent: integer("tempo_percent").notNull().default(100),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
