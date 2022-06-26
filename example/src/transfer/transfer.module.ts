import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { UserModule } from '../user/user.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purse } from './model/purse.model';
import { PurseService } from './purse.service';
import { PurseRepository } from './purse.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purse,
      PurseRepository,
    ]),
    UserModule,
    PushNotificationModule,
  ],
  providers: [
    TransferService,
    PurseService,
  ],
  controllers: [
    TransferController,
  ],
})
export class TransferModule {
}
