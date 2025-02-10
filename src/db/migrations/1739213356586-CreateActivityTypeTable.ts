import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateActivityTypeTable1739213356586 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "activity_type",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, generationStrategy: "uuid", default: "uuid_generate_v4()" },
                { name: "name", type: "varchar", isUnique: true },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ],
        }));

        await queryRunner.query(`
            INSERT INTO activity_type (id, name) VALUES 
            (uuid_generate_v4(), 'PVP'),
            (uuid_generate_v4(), 'HUNT'),
            (uuid_generate_v4(), 'QUEST'),
            (uuid_generate_v4(), 'BOSS'),
            (uuid_generate_v4(), 'WAR'),
            (uuid_generate_v4(), 'EVENT')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("activity_type");
    }
}
