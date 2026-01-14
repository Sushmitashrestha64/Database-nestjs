import { Inject, Logger, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { cacheConfig } from './config/cache.config';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id/request-id.middleware';
import { b2Module } from './b2/b2.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
    load: configuration,
  }),

   CacheModule.registerAsync(cacheConfig),
   TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get<string>('DATABASE_PORT')),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
   UserModule,
   AuthModule,
   b2Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    
    this.logger.log(`Attempting to connect to Redis at ${redisHost}:${redisPort}...`);
    
    try {
      const stores: any = this.cache.stores || [];
      const store = stores[0];
      const storeType = store?.constructor?.name || 'Unknown';
      this.logger.log(`Cache Store Type: ${storeType}`);
      
      const testKey = 'redis:health:check';
      const testValue = `ok-${Date.now()}`;
      
      await this.cache.set(testKey, testValue, 10);
      const retrievedValue = await this.cache.get(testKey);

      if (retrievedValue === testValue) {
        this.logger.log(` Redis connection successful at ${redisHost}:${redisPort}`);
        this.logger.log(` Redis cache is operational and responding correctly`);

        if (store?.client) {
          this.logger.log(`Using actual Redis client (not in-memory)`);
        } else {
          this.logger.warn(`No Redis client found - may be using in-memory cache`);
        }
      } else {
        this.logger.warn(`Redis connected but value mismatch. Expected: ${testValue}, Got: ${retrievedValue}`);
      }
    } catch (error) {
      this.logger.error(
        `✗ Redis connection failed at ${redisHost}:${redisPort} — fallback to in-memory cache`,
        error.stack,
      );
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, RequestIdMiddleware)
      .forRoutes('*');
  }
}

