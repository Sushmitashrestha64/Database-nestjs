import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'yamanote.proxy.rlwy.net',
  port: parseInt(process.env.REDIS_PORT, 10) || 10991,
  password: process.env.REDIS_PASSWORD ||'sNYFhGEwfmrUSYMwYlPLTynYdQIdQsqP',
  ttl: parseInt(process.env.CACHE_TTL, 10) || 60000, 
}));
