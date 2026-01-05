import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { b2Service } from './b2.service';
import { b2Controller } from './b2.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  providers: [b2Service],
  controllers: [b2Controller]
})
export class b2Module {}
