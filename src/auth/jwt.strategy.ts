import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

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
    console.log('JWT Strategy - Validating payload:', payload);
    const user = await this.userService.findById(payload.sub);
    console.log('JWT Strategy - Found user:', user);
    
    if (!user || !user.isActive) {
      console.log('JWT Strategy - User validation failed:', { 
        userExists: !!user, 
        isActive: user?.isActive 
      });
      throw new UnauthorizedException('Invalid token');
    }
    console.log('JWT Strategy - Validated User:', user);
    
    return user;
  }
}
