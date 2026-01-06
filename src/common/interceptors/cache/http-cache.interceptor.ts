import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    if (request.method !== 'GET') {
      return undefined;
    }
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestUrl;
    const cacheKey = isHttpApp
      ? httpAdapter.getRequestUrl(request)
      : request.url;
    return cacheKey;
  }
}
