import {CanActivate, ExecutionContext,ForbiddenException,Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../enum/roles.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(),
       context.getClass()
      ],
    );
      const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}