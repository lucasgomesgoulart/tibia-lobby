import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedActivityTypes1738594500000 implements MigrationInterface {
  name = 'SeedActivityTypes1738594500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO activity_type (id, name, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'PvP', now(), now()),
        (gen_random_uuid(), 'Hunt', now(), now()),
        (gen_random_uuid(), 'Quest', now(), now()),
        (gen_random_uuid(), 'Rotacao Boss', now(), now()),
        (gen_random_uuid(), 'War', now(), now()),
        (gen_random_uuid(), 'Evento', now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM activity_type`);
  }
}
