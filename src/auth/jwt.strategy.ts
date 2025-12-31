import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    console.log('JWT Strategy initialized with secret:', process.env.JWT_SECRET );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '@mySecretKey@',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        console.log('JWT Strategy - User validation failed:', { 
          userExists: !!user, 
          isActive: user?.isActive 
        });
        throw new UnauthorizedException('Invalid token');
      }
      return user;
    } catch (error) {
      console.log('JWT validation error:', error.message);
      throw new UnauthorizedException('Invalid or expired token - please log in again');
    }
  }
}
