import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1767090663725 implements MigrationInterface {
    name = 'CreateUsersTable1767090663725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
