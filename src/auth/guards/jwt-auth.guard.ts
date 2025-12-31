import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtAuthGuard: Checking access for route', context.getHandler().name);
    
    const request = context.switchToHttp().getRequest();
    console.log('Authorization Header:', request.headers.authorization);
    
    try {
      // Handle Observable or Promise from super.canActivate
      const result = super.canActivate(context);
      const isValid = result instanceof Observable 
        ? await result.toPromise() 
        : await result;
      
      console.log('JWT validation result:', isValid);
      
      if (isValid) {
        console.log('JwtAuthGuard: Authenticated user:', request.user);
      }
      
      return isValid as boolean;
    } catch (error) {
      console.error('JwtAuthGuard Error:', error.message);
      throw error;
    }
  }
}
