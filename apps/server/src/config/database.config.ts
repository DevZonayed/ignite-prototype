import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE', 'sqlite');

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
      synchronize: configService.get<string>('NODE_ENV') !== 'production',
      logging: configService.get<string>('NODE_ENV') === 'development',
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
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  } as TypeOrmModuleOptions;
};
