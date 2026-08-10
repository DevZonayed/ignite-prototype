import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';

// The TypeORM CLI runs outside Nest, so nothing has loaded .env for us yet.
loadEnv();

/**
 * Standalone DataSource for the TypeORM CLI (`migration:generate`,
 * `migration:run`, `migration:revert`).
 *
 * The running application does NOT use this — it builds its options from
 * `src/config/database.config.ts` through Nest's ConfigService. Both must
 * describe the same schema, so they share the same entity glob and the same
 * env var names. Changing one without the other will produce migrations that
 * do not match what the app expects.
 *
 * Migrations are Postgres-only. The default sql.js development database is
 * created by `synchronize` and has no migration story.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'ignite',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Matches database.config.ts: .ts when running through ts-node, .js in dist.
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

// Deliberately the only export: the TypeORM CLI rejects a data-source file that
// exports more than one DataSource, and a `default` alias counts as a second.
