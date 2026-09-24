import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum.js';


@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly requiredRole: Role){}
    
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user

        if(!user || user.role !== this.requiredRole)
            {
                throw new ForbiddenException(
                    `Access denied. Required role: ${this.requiredRole}`
                )
            }

        return true
    }
}