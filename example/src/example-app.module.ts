import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config';
import { UserModule } from './user/user.module';
import { TransferModule } from './transfer/transfer.module';
import { PushNotificationModule } from './push-notification/push-notification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Config.typeOrmConfig),
    UserModule,
    TransferModule,
    PushNotificationModule,
  ],
})
export class ExampleAppModule {
}
