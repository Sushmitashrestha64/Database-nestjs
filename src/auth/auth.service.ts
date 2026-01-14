import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) {}

    async login(email: string, password: string) {
        const isValid = await this.userService.validatePassword(email, password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid input');
        }
        const cacheKey = `auth:user:${email}`;
        let user = await this.cache.get<any>(cacheKey);
        
        if (user) {
            console.log(`CACHE HIT: User data for ${email}`);
        } else {
            console.log(` CACHE MISS: Fetching user data for ${email}`);
            user = await this.userService.findByEmail(email);
            await this.cache.set(cacheKey, user, 300000);
            console.log(` CACHED: User ${email} stored for 5 minutes`);
        }
        
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        
        const token = this.jwtService.sign(payload);
        
        // Cache the token for session tracking (optional)
        const tokenCacheKey = `auth:token:${user.id}`;
        await this.cache.set(tokenCacheKey, token, 86400000); 
        console.log(`🔐 Token cached for user ${user.id}`);
        
        return { 
            access_token: token,
        };
    }
    
    // Method to invalidate user cache (call this on logout or password change)
    async invalidateUserCache(email: string, userId: string) {
        await this.cache.del(`auth:user:${email}`);
        await this.cache.del(`auth:token:${userId}`);
        console.log(`🗑️  Cache invalidated for user ${email}`);
    }
}


