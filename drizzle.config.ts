import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const isPostgres = !!process.env.DATABASE_URL;

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: {
    url: isPostgres ? process.env.DATABASE_URL! : "./data/maths-magic-town.db",
  },
});
