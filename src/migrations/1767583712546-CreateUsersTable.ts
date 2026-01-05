import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1767583712546 implements MigrationInterface {
    name = 'CreateUsersTable1767583712546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "storageType" character varying DEFAULT 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "storageType"`);
    }

}
