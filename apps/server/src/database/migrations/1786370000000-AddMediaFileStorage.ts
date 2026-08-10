import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Real file storage for the media library.
 *
 * `MediaService` kept records in an in-process array and never wrote the
 * uploaded file, so an "uploaded" asset was a name with nothing behind it and
 * the whole library vanished on restart. Records now live in `media_library`
 * and these columns say where the bytes are.
 */
export class AddMediaFileStorage1786370000000 implements MigrationInterface {
    name = 'AddMediaFileStorage1786370000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_library" ADD "storageKey" character varying`);
        await queryRunner.query(`ALTER TABLE "media_library" ADD "mimeType" character varying`);
        await queryRunner.query(`ALTER TABLE "media_library" ADD "sizeBytes" integer`);
        await queryRunner.query(`ALTER TABLE "media_library" ADD "uploadedById" uuid`);
        await queryRunner.query(`ALTER TABLE "media_library" ADD CONSTRAINT "FK_media_library_uploadedById" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_library" DROP CONSTRAINT "FK_media_library_uploadedById"`);
        await queryRunner.query(`ALTER TABLE "media_library" DROP COLUMN "uploadedById"`);
        await queryRunner.query(`ALTER TABLE "media_library" DROP COLUMN "sizeBytes"`);
        await queryRunner.query(`ALTER TABLE "media_library" DROP COLUMN "mimeType"`);
        await queryRunner.query(`ALTER TABLE "media_library" DROP COLUMN "storageKey"`);
    }
}
