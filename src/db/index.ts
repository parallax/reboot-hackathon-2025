import { drizzle } from 'drizzle-orm/postgres';
import { migrate } from 'drizzle-orm/postgres/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create postgres client
const client = postgres(DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Migration function (to be called during setup)
export async function runMigrations() {
  await migrate(db, { migrationsFolder: './drizzle' });
}