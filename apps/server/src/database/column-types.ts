/**
 * Column types that differ by driver.
 *
 * Postgres has no `datetime` and sql.js has no `timestamp`, so neither literal
 * works for both. TypeORM can infer the right one from a `Date` property, but
 * only when the reflected type is exactly `Date` — a nullable `Date | null`
 * reflects as `Object` and fails validation. So the type is chosen here, once,
 * from the same env var `database.config.ts` and `data-source.ts` read.
 *
 * Evaluated at import time, which is correct: entity metadata is built once per
 * process and the driver cannot change underneath it.
 */
export const TIMESTAMP = process.env.DB_TYPE === 'postgres' ? 'timestamp' : 'datetime';
