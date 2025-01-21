import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { authResponseDto } from './auth.dto';
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body('username') username: string,
        @Body('password') password: string,
    ): Promise<authResponseDto> {
        return await this.authService.signIn(username, password)
    }


}


