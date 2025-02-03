import { MigrationInterface, QueryRunner } from "typeorm";

export class createWorlds1738594235623 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 🔹 Buscar o ID do Rubinot
        const rubinot = await queryRunner.query(`
            SELECT id FROM otservers WHERE name = 'Rubinot'
        `);

        if (rubinot.length === 0) {
            throw new Error('Rubinot server not found in the database');
        }

        const rubinotId = rubinot[0].id;

        await queryRunner.query(`
            INSERT INTO worlds (name, created_at, updated_at, "otServerId", "isGlobal")
            VALUES 
            ('Spectrum', now(), now(), '${rubinotId}', false),
            ('Solarian', now(), now(), '${rubinotId}', false),
            ('Auroria', now(), now(), '${rubinotId}', false),
            ('Lunarian', now(), now(), '${rubinotId}', false),
            ('Oblivium', now(), now(), '${rubinotId}', false)
        `);

        // 🔹 Inserir mundos globais
        await queryRunner.query(`
            INSERT INTO worlds (name, created_at, updated_at)
            VALUES 
            ('Aethera', now(), now()),
            ('Ambra', now(), now()),
            ('Antica', now(), now()),
            ('Astera', now(), now()),
            ('Belobra', now(), now()),
            ('Bona', now(), now()),
            ('Bravoria', now(), now()),
            ('Calmera', now(), now()),
            ('Cantabra', now(), now()),
            ('Celebra', now(), now()),
            ('Celesta', now(), now()),
            ('Collabra', now(), now()),
            ('Descubra', now(), now()),
            ('Dia', now(), now()),
            ('Divina', now(), now()),
            ('Epoca', now(), now()),
            ('Esmera', now(), now()),
            ('Etebra', now(), now()),
            ('Ferobra', now(), now()),
            ('Fibera', now(), now()),
            ('Firmera', now(), now()),
            ('Flamera', now(), now()),
            ('Gentebra', now(), now()),
            ('Gladera', now(), now()),
            ('Gladibra', now(), now()),
            ('Gravitera', now(), now()),
            ('Harmonia', now(), now()),
            ('Havera', now(), now()),
            ('Honbra', now(), now()),
            ('Inabra', now(), now()),
            ('Issobra', now(), now()),
            ('Jacabra', now(), now()),
            ('Jadebra', now(), now()),
            ('Jaguna', now(), now()),
            ('Kalibra', now(), now()),
            ('Karmeya', now(), now()),
            ('Lobera', now(), now()),
            ('Luminera', now(), now()),
            ('Lutabra', now(), now()),
            ('Malivora', now(), now()),
            ('Menera', now(), now()),
            ('Monza', now(), now()),
            ('Nefera', now(), now()),
            ('Nevia', now(), now()),
            ('Obscubra', now(), now()),
            ('Oceanis', now(), now()),
            ('Ombra', now(), now()),
            ('Ourobra', now(), now()),
            ('Pacera', now(), now()),
            ('Peloria', now(), now()),
            ('Premia', now(), now()),
            ('Quebra', now(), now()),
            ('Quelibra', now(), now()),
            ('Quidera', now(), now()),
            ('Quintera', now(), now()),
            ('Rasteibra', now(), now()),
            ('Refugia', now(), now()),
            ('Retalia', now(), now()),
            ('Runera', now(), now()),
            ('Secura', now(), now()),
            ('Serdebra', now(), now()),
            ('Solidera', now(), now()),
            ('Stralis', now(), now()),
            ('Talera', now(), now()),
            ('Temera', now(), now()),
            ('Thyria', now(), now()),
            ('Tornabra', now(), now()),
            ('Ulera', now(), now()),
            ('Unebra', now(), now()),
            ('Ustebra', now(), now()),
            ('Vandera', now(), now()),
            ('Venebra', now(), now()),
            ('Victoris', now(), now()),
            ('Vitera', now(), now()),
            ('Vunira', now(), now()),
            ('Wadira', now(), now()),
            ('Wildera', now(), now()),
            ('Wintera', now(), now()),
            ('Xyla', now(), now()),
            ('Yara', now(), now()),
            ('Yonabra', now(), now()),
            ('Yovera', now(), now()),
            ('Yubra', now(), now()),
            ('Zephyra', now(), now()),
            ('Zuna', now(), now()),
            ('Zunera', now(), now());
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM worlds;`);
    }
}
