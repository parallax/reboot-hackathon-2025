import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Export shared postgres client so scripts can control lifecycle when needed
export const pgClient = postgres(DATABASE_URL);

// Create drizzle instance
export const db = drizzle(pgClient, { schema });
