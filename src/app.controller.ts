import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cache-info')
  async getCacheInfo() {
    const stores: any = this.cache.stores || [];
    const store = stores[0];
    const storeType = store?.constructor?.name || 'Unknown';
    
    // Test set and get
    const testKey = 'diagnostic:test';
    const testValue = { test: 'value', timestamp: Date.now() };
    await this.cache.set(testKey, testValue, 300000); // 5 minutes
    const retrieved = await this.cache.get(testKey);
    
    return {
      storeType,
      hasRedisClient: !!store?.client,
      testKey,
      testPassed: JSON.stringify(testValue) === JSON.stringify(retrieved),
      clientInfo: store?.client ? 'Redis client present' : 'No Redis client',
      message: storeType.includes('Redis') 
        ? 'Using Redis - check Railway for key: diagnostic:test' 
        : 'WARNING: Using in-memory cache, NOT Redis!'
    };
  }
}

