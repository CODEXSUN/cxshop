import { z } from "zod";

const schema = z.object({
  DB_HOST: z.string().default("127.0.0.1"),
  DB_MASTER_NAME: z.string().default("cxshop_db"),
  DB_PASSWORD: z.string().default("cxshop"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("cxshop"),
  JWT_SECRET: z.string().min(32)
});

export const blogsEnv = schema.parse(process.env);
