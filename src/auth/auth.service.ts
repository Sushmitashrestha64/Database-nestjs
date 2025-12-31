import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async login(email:string, password:string){
        const isValid = await this.userService.validatePassword(email, password);
        if(!isValid){
            throw new UnauthorizedException('Invalid input');
        }
        const user = await this.userService.findByEmail(email);
        const payload={
            sub: user.id,
            email: user.email,
        };

        return{ 
            access_token: this.jwtService.sign(payload),
        };
    }
}
