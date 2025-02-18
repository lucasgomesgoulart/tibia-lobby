import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService} from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { authResponseDto } from './auth.dto';
import { compareSync } from 'bcrypt';


@Injectable()
export class AuthService {

    private jwtExpirationTimeInSeconds: number

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private  configService: ConfigService
    ) {
        this.jwtExpirationTimeInSeconds = +this.configService.get<number>('JWT_EXPIRATE_TIME')
     }
   
    async signIn(username: string, password: string): Promise<authResponseDto>{
        const foundUser = await this.userService.findUserByUsername(username)
        if (!foundUser || !compareSync(password, foundUser.password)) {
            throw new UnauthorizedException()
        }

        const payload = { sub: foundUser.id, username: foundUser.username}
        const token = this.jwtService.sign(payload)
        return {token, expiresIn: this.jwtExpirationTimeInSeconds, userId: foundUser.id}
    }
}

