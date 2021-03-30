import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Purse } from './model/purse.model';
import { User } from './model/user.model';
import { UserDto } from './dto/user.dto';
import { PurseDto } from './dto/purse.dto';
import { RemittanceResultDto } from './dto/remittance-result.dto';
import { RemittanceDto } from './dto/remittance.dto';
import { Connection } from 'typeorm';
import { BalanceValueDto } from './dto/balance-value.dto';
import { AppServiceV2 } from './app.service-v2';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appServiceV2: AppServiceV2,
    private readonly connection: Connection,
  ) {
  }

  @Get('users')
  @ApiResponse({
    type: User,
    isArray: true,
  })
  async getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }

  @Get('users/:userId/purse')
  @ApiResponse({
    type: Purse,
  })
  async getDefaultPurse(@Param('userId') userId: string): Promise<Purse> {
    const userIdNum = Number(userId);
    return await this.appService.getPurse(userIdNum);
  }

  @Post('users')
  @ApiResponse({
    type: User,
  })
  async createUser(@Body() userDto: UserDto) {
    return this.appService.createUser(userDto);
  }

  @Post('users/:userId/purse')
  @ApiResponse({
    type: Purse,
  })
  async createPurseForUser(@Param('userId') userId: string, @Body() purseDto: PurseDto) {
    const userIdNum = Number(userId);
    return await this.appService.createPurse(purseDto, userIdNum);
  }

  @Post('remittance')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittance(@Body() remittanceDto: RemittanceDto) {
    return this.appService.makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
  }

  @Post('remittance-with-transaction')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithTransaction(@Body() remittanceDto: RemittanceDto) {
    return this.connection.transaction(manager => {
      return this.appService.withTransaction(manager)/* <-- this is interesting new thing */.makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
    });
  }

  @Post('remittance-with-transaction-and-fee')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithTransactionAndFee(@Body() remittanceDto: RemittanceDto) {
    return this.connection.transaction(async manager => {
      const transactionAppService = this.appService.withTransaction(manager); // <-- this is interesting new thing
      const result = await transactionAppService.makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
      result.fromBalance -= 1; // <-- transfer fee
      const senderPurse = await transactionAppService.getPurse(remittanceDto.userIdFrom);
      senderPurse.balance -= 1; // <-- transfer fee, for example of using several services in one transaction in controller
      await this.appServiceV2.withTransaction(manager).savePurse(senderPurse);
      return result;
    });
  }

  @Post('remittance-with-typeorm-transaction')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithTypeOrmTransaction(@Body() remittanceDto: RemittanceDto) {
    return this.connection.transaction(manager => {
      return this.appService.makeRemittanceWithTypeOrmV1(manager, remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
    });
  }

  @Post('remittance-with-typeorm-transaction-decorators')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithTypeOrmTransactionDecorators(@Body() remittanceDto: RemittanceDto) {
    return this.appService.makeRemittanceWithTypeOrmV2(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, remittanceDto.withError);
  }

  @Patch('purse/:purseId/top-up')
  @ApiResponse({
    type: Purse,
  })
  async topUpPurse(@Param('purseId') purseId: string, @Body() balanceValue: BalanceValueDto) {
    const purseIdNum = Number(purseId);
    return this.appService.topUpPurse(purseIdNum, balanceValue.sum);
  }
}
