import {existsSync} from 'node:fs';
import pg from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

export function connectDatabase() {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const url=process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required; configure it in the environment or ignored .env');
  const pool=new pg.Pool({connectionString:url,max:5,connectionTimeoutMillis:5000});
  const db=drizzle(pool,{schema});
  return {db,pool};
}
export type IntelligenceDb=ReturnType<typeof connectDatabase>['db'];
