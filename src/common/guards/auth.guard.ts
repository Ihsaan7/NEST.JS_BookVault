import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization']
    
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedException("Missing or Invalid authorization header")
        }
            
        const token = authHeader.split(' ')[1];
        
        try {
            // Verify the JWT
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET_KEY as string || 'fallback_secret_key_for_development', // Provide fallback secret
            ) as any;

            // Attach user info with request
            request.user={
                id:decoded.id,
                email:decoded.email,
                role:decoded.role
            }

            return true
        } catch (error) {
                throw new UnauthorizedException('Invalid or expired token');
        }
    }
}