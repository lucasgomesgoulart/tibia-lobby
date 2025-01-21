import { UsersModule } from '../users/users.module'
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [JwtModule.registerAsync({
    global: true,
    imports: [],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signInOptions: { expiresIn: +configService.get<number>('JWT_EXPIRATION_TIME') }
    }),
    inject: [ConfigService],
  }), UsersModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
