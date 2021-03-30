import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config';
import { User } from './model/user.model';
import { Purse } from './model/purse.model';
import { AppServiceV2 } from './app.service-v2';

@Module({
  imports: [
    TypeOrmModule.forRoot(Config.typeOrmConfig),
    TypeOrmModule.forFeature([
      User,
      Purse,
    ]),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    AppServiceV2,
  ],
})
export class AppModule {
}
