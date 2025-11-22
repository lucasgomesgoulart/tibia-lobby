require('dotenv').config({ path: '.env' });
import { DataSource } from 'typeorm';
import * as path from 'path';

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    synchronize: false,
    // autoLoadEntities: true
})

export default dataSource;