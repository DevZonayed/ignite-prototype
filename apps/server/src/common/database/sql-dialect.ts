import { DataSource } from 'typeorm';

/**
 * Date formatting is the one place the two supported drivers disagree loudly.
 *
 * Dev and test run on sql.js (SQLite), deployments run on Postgres. SQLite has
 * `strftime`, Postgres has `to_char`, and neither knows the other's name — so a
 * query builder that hard-codes one returns rows locally and a 500 in
 * production. That is exactly how `/api/monitoring/lessons-delivered` and the
 * attendance heat-map/trend endpoints shipped broken: every test passed against
 * SQLite.
 *
 * These helpers pick the right expression for whichever driver is connected.
 */

const isSqlite = (dataSource: DataSource): boolean =>
  dataSource.options.type !== 'postgres';

/** `YYYY-MM-DD` for a date or timestamp column. */
export function isoDayExpr(dataSource: DataSource, column: string): string {
  return isSqlite(dataSource)
    ? `strftime('%Y-%m-%d', ${column})`
    : `to_char(${column}, 'YYYY-MM-DD')`;
}

/**
 * A sortable week label such as `2026-W32`.
 *
 * Postgres uses the ISO week (`IYYY`/`IW`) rather than SQLite's Monday-based
 * `%W`. The two disagree on the handful of days either side of New Year; the
 * label is only ever a display/grouping key, so that is acceptable.
 */
export function isoWeekLabelExpr(
  dataSource: DataSource,
  column: string,
): string {
  return isSqlite(dataSource)
    ? `strftime('%Y-W%W', ${column})`
    : `to_char(${column}, 'IYYY-"W"IW')`;
}

/** Week of year as an integer, for grouping. */
export function weekNumberExpr(
  dataSource: DataSource,
  column: string,
): string {
  return isSqlite(dataSource)
    ? `CAST(strftime('%W', ${column}) AS INTEGER)`
    : `CAST(to_char(${column}, 'IW') AS INTEGER)`;
}
