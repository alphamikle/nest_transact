import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config';
import { UserModule } from './user/user.module';
import { TransferModule } from './transfer/transfer.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { InfoController } from './transfer/info.controller';
import { InfoService } from './transfer/info.service';
import { CacheService } from './transfer/cache.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(Config.typeOrmConfig),
    UserModule,
    TransferModule,
    PushNotificationModule,
  ],
  controllers: [InfoController],
  providers: [CacheService, InfoService],
})
export class ExampleAppModule {
}
