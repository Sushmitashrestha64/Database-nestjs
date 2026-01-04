import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1767510909326 implements MigrationInterface {
    name = 'CreateUsersTable1767510909326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "file" TO "profilePhoto"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "profilePhoto" TO "file"`);
    }

}
