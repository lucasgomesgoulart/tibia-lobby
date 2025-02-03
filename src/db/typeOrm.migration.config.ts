require('dotenv').config({ path: '.env' });
import { DataSource } from 'typeorm';

export const postgres = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [('/task-management-api/src/db/entities/*.entity{.ts,.js}')],
    migrations: [__dirname + '/migrations/**/*.ts'],
    synchronize: true,
    // autoLoadEntities: true
})