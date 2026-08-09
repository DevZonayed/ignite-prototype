import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

/**
 * Two databases, two different schema stories:
 *
 * - **postgres** (deployments): the schema is owned by migrations. `synchronize`
 *   is off unconditionally so a bad entity edit can never silently rewrite a
 *   live table, and `migrationsRun` applies pending migrations at boot. Keep
 *   this in step with `src/database/data-source.ts`, which the migration CLI
 *   uses — same entity glob, same env vars.
 * - **sqljs** (default for local development): an in-process SQLite database
 *   with no migration story at all, so the schema is built by `synchronize`.
 *   Nothing durable lives here.
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE', 'sqlite');
  const isDevelopment =
    configService.get<string>('NODE_ENV') === 'development';

  const entityPath = join(__dirname, '..', 'database', 'entities', '*.{ts,js}');

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_DATABASE', 'ignite'),
      entities: [entityPath],
      migrations: [
        join(__dirname, '..', 'database', 'migrations', '*.{ts,js}'),
      ],
      migrationsTableName: 'migrations',
      synchronize: false,
      migrationsRun: true,
      logging: isDevelopment,
      ssl:
        configService.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // Default: SQLite via sql.js (pure JavaScript — no native modules)
  return {
    type: 'sqljs',
    database: new Uint8Array(0),
    location: configService.get<string>('DB_SQLITE_PATH', './ignite.sqlite'),
    autoSave: true,
    entities: [entityPath],
    synchronize: true,
    logging: isDevelopment,
  } as TypeOrmModuleOptions;
};
