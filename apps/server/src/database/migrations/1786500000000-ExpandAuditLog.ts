import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Request detail on audit entries.
 *
 * `audit_logs` held only event/actor/target/result, which answers "something
 * happened" but not "who, from where, sending what, and with what outcome".
 * Nothing wrote to it either except the bootstrap event, so the Security &
 * Audit page had a single row in it. These columns are what
 * `AuditInterceptor` now fills in on every request.
 */
export class ExpandAuditLog1786500000000 implements MigrationInterface {
    name = 'ExpandAuditLog1786500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "actorEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "actorRole" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "actorSchoolId" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "source" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "targetType" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "targetId" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "method" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "path" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "statusCode" integer`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "durationMs" integer`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "ip" character varying`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "userAgent" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "requestQuery" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "requestBody" text`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "errorMessage" text`);

        // The page reads newest-first and filters by actor, so both orderings
        // are worth an index: this table grows by one row per request.
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_actorId_createdAt" ON "audit_logs" ("actorId", "createdAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_actorId_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_createdAt"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "errorMessage"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "requestBody"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "requestQuery"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "userAgent"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "ip"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "durationMs"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "statusCode"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "path"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "method"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "targetId"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "targetType"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "actorSchoolId"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "actorRole"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "actorEmail"`);
    }
}
