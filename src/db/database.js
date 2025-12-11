import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.DATABASE_URL || "file:./dev.sqlite",
});

export const db = drizzle(client);