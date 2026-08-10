import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Learner → class enrolment.
 *
 * Until now nothing connected a learner to a class: `GET /classes/:id/learners`
 * matched on school alone, so every class in a school returned the same roster
 * and `classes.learnerCount` had no code path that could maintain it. This adds
 * the missing edge as a nullable FK on the learner, dropping to NULL when the
 * class goes away so a deleted class never deletes its learners.
 */
export class AddLearnerClassEnrolment1786349400000 implements MigrationInterface {
    name = 'AddLearnerClassEnrolment1786349400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "classId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_classId" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        // learnerCount is a cache of the register; start it from the truth.
        await queryRunner.query(`UPDATE "classes" SET "learnerCount" = 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_classId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "classId"`);
    }
}
