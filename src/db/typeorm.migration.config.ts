import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); 

const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), 
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'], 
    synchronize: true,
    logging: true, 
};

export default new DataSource(dataSourceOptions);
