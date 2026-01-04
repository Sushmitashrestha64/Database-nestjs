import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1767510393696 implements MigrationInterface {
    name = 'CreateUsersTable1767510393696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "file" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "file"`);
    }

}
