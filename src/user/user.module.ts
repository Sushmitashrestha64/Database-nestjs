import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HttpCacheInterceptor } from 'src/common/interceptors/cache/http-cache.interceptor';

@Module({
    imports:[TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, HttpCacheInterceptor],
    exports: [TypeOrmModule, UserService]
})
export class UserModule {}
