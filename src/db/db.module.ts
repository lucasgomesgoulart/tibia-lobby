import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
@Module({
    imports: [TypeOrmModule.forRootAsync({
        useFactory: async (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: +configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
            migrations: [path.join(__dirname, '../**/*.migrations{.ts,.js}')],
            // Permite desligar synchronize em produção. Use DB_SYNC=true para habilitar.
            synchronize: configService.get<string>('DB_SYNC') === 'true',
            autoLoadEntities: true
        }),
        inject: [ConfigService],
    })]
})

export class DbModule { }
