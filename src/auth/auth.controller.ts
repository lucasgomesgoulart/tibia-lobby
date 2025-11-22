import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthResponseDto } from './auth.dto';
import { AuthService } from './auth.service';
import { plainToClass } from 'class-transformer';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body('username') username: string,
        @Body('password') password: string,
    ): Promise<AuthResponseDto> {
        const result = await this.authService.signIn(username, password);
        return plainToClass(AuthResponseDto, result, { excludeExtraneousValues: true });
    }
}


