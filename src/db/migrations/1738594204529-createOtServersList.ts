import { MigrationInterface, QueryRunner } from "typeorm";

export class createOtServersList1738594204529 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO otservers (name, created_at, updated_at)
            VALUES ('Rubinot', now(), now())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM otservers WHERE name = 'Rubinot'
        `);
    }
}
